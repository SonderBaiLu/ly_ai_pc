/**
 * 最小二维码工具占位
 * 说明：真实实现通常依赖 qrcode 库；这里仅提供类型/接口占位避免构建报错。
 */
export async function toDataURL(_text: string): Promise<string> {
  // TODO: 接入真实 qrcode 生成逻辑
  return ''
}

// 兼容老代码使用的命名
export async function generateQRCode(text: string): Promise<string> {
  return toDataURL(text)
}
