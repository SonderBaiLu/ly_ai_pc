export async function copyText(text: string) {
  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // ignore
  }
  // 兜底：不支持时返回 false
  return false
}

// 兼容旧命名
export async function copyToClipboard(text: string) {
  return copyText(text)
}

