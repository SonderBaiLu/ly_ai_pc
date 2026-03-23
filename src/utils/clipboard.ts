/**
 * 剪贴板工具函数
 */

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本内容
 * @returns Promise<boolean> 复制是否成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false

  const isBrowser =
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as any).window !== 'undefined' &&
    typeof (globalThis as any).document !== 'undefined'
  const hasClipboardApi = typeof (globalThis as any).navigator !== 'undefined' && !!(globalThis as any).navigator?.clipboard

  try {
    // 1) 现代 Clipboard API（需要 https 或 localhost）
    if (hasClipboardApi && (globalThis as any).window.isSecureContext) {
      await (globalThis as any).navigator.clipboard.writeText(text)
      return true
    }

    // 2) 非浏览器环境直接失败
    if (!isBrowser) return false

    // 3) 降级：使用 document.execCommand（适用于 http 和旧浏览器）
    const doc = (globalThis as any).document as any
    const textArea = doc.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '0'
    doc.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = doc.execCommand('copy')
    textArea.remove()
    if (successful) return true

    // 4) 最后兜底：部分非常旧版本 IE（非标准，尽量避免）
    const win = (globalThis as any).window as unknown as {
      clipboardData?: { setData: (type: string, data: string) => boolean }
    }
    if (win && win.clipboardData) {
      return win.clipboardData.setData('Text', text)
    }

    return false
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 从剪贴板读取文本
 * @returns Promise<string> 剪贴板中的文本内容
 */
export const readFromClipboard = async (): Promise<string> => {
  const hasClipboardApi = typeof (globalThis as any).navigator !== 'undefined' && !!(globalThis as any).navigator?.clipboard
  try {
    if (hasClipboardApi && (globalThis as any).window.isSecureContext) {
      return await (globalThis as any).navigator.clipboard.readText()
    }
    return ''
  } catch (error) {
    console.error('读取剪贴板失败:', error)
    return ''
  }
}
