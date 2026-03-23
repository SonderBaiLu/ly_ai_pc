import QRCode from 'qrcode'

/**
 * 将文本或URL转换为二维码图片（base64格式）
 * @param text 要转换为二维码的文本或URL
 * @param options 二维码选项（可选）
 * @returns Promise<string> 返回base64格式的图片数据URL
 */
export async function generateQRCode(
  text: string,
  options?: {
    width?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
  }
): Promise<string> {
  try {
    const defaultOptions = {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      ...options,
    }

    // 生成二维码并返回base64格式的图片
    const dataUrl = await QRCode.toDataURL(text, defaultOptions)
    return dataUrl
  } catch (error) {
    console.error('生成二维码失败:', error)
    throw error
  }
}

/**
 * 将文本或URL转换为二维码图片（Canvas元素）
 * @param text 要转换为二维码的文本或URL
 * @param canvas Canvas元素
 * @param options 二维码选项（可选）
 */
export async function generateQRCodeToCanvas(
  text: string,
  canvas: globalThis.HTMLCanvasElement,
  options?: {
    width?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
  }
): Promise<void> {
  try {
    const defaultOptions = {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      ...options,
    }

    await QRCode.toCanvas(canvas, text, defaultOptions)
  } catch (error) {
    console.error('生成二维码失败:', error)
    throw error
  }
}
