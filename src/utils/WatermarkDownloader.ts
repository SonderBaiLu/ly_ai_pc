/**
 * 水印下载器最小占位
 * 说明：真实逻辑通常包含鉴权、去水印下载链路等；这里仅用于满足引用。
 */
export class WatermarkDownloader {
  async download(_url: string) {
    // TODO: 接入真实下载实现
    return
  }
}

// 兼容旧代码的默认实例导出
export const watermarkDownloader = new WatermarkDownloader()

