/* global fetch, document, Blob */
import { ElMessage } from 'element-plus'
import { downloadFile, buildDownloadUrl } from '@/utils/download'

let JSZip: any
async function getJSZip() {
  if (!JSZip) {
    const JSZipModule = await import('jszip')
    JSZip = JSZipModule.default || JSZipModule
  }
  return JSZip
}

/**
 * 下载配置选项
 */
interface DownloadOptions {
  /** 是否静默下载（不显示提示消息） */
  silent?: boolean
  /** 自定义成功提示消息 */
  successMessage?: string
  /** 自定义错误提示消息 */
  errorMessage?: string
  /** 下载文件名 */
  filename?: string
  /** 是否强制添加水印（即使是会员） */
  forceWatermark?: boolean
}

/**
 * 下载结果
 */
interface DownloadResult {
  success: boolean
  data?: any
  error?: any
  message?: string
}

/**
 * 水印下载器 - 统一处理文件下载，自动处理会员状态和水印
 *
 * 功能：
 * 1. 自动检测会员状态
 * 2. 会员：无水印直接下载
 * 3. 非会员：通过API添加水印后下载
 * 4. 统一的错误处理
 * 5. 灵活的配置选项
 *
 * @example
 * ```ts
 * // 下载单张图片
 * await watermarkDownloader.download('https://example.com/image.jpg')
 *
 * // 批量下载
 * await watermarkDownloader.download(['url1', 'url2', 'url3'])
 *
 * // 静默下载
 * await watermarkDownloader.download(url, { silent: true })
 *
 * // 自定义提示
 * await watermarkDownloader.download(url, {
 *   successMessage: '图片已保存',
 *   errorMessage: '保存失败'
 * })
 * ```
 */
class WatermarkDownloader {
  private static instance: WatermarkDownloader

  /**
   * 获取单例实例
   */
  static getInstance(): WatermarkDownloader {
    if (!this.instance) {
      this.instance = new WatermarkDownloader()
    }
    return this.instance
  }

  /**
   * 统一下载方法（单个文件直接下载，多个文件自动打包成ZIP）
   * @param urls - 文件URL（单个或数组）
   * @param options - 下载配置选项
   * @returns Promise<DownloadResult>
   */
  async download(urls: string | string[], options?: DownloadOptions): Promise<DownloadResult> {
    try {
      // 1. 统一处理URL格式
      const urlArray = Array.isArray(urls) ? urls : [urls]

      if (urlArray.length === 0) {
        throw new Error('下载URL不能为空')
      }

      const prefix = 'chaotuishou'

      // 2. 单个文件：直接下载
      if (urlArray.length === 1) {
        const url = urlArray[0]
        const filename =
          options?.filename ||
          `${prefix}_${this.extractFilename(url).replace(/\s+/g, '_') || 'download'}`

        // 统一下载：水印/无水印由上层在传入 url 时决定（此处只负责下载）
        await downloadFile(url, filename)

        if (!options?.silent) {
          const message = options?.successMessage || '下载成功'
          ElMessage.success(message)
        }

        return {
          success: true,
          message: '下载成功',
        }
      }

      // 3. 多个文件：打包成ZIP下载（使用 JSZip，与可灵AI相同）
      const JSZipClass = await getJSZip()
      const zip = new JSZipClass()
      let successCount = 0
      let failCount = 0

      // 显示加载提示
      if (!options?.silent) {
        ElMessage.info(`正在打包 ${urlArray.length} 个文件...`)
      }

      // 并行下载所有文件并添加到zip
      const downloadPromises = urlArray.map(async (url, index) => {
        try {
          let finalUrl = buildDownloadUrl(url)
          // 如果是相对路径，补全为绝对 URL（与 downloadFile 逻辑一致）
          if (finalUrl.startsWith('/')) {
            finalUrl = new URL(finalUrl, window.location.origin).toString()
          }
          const response = await fetch(finalUrl, { credentials: 'include' })

          if (!response.ok) {
            throw new Error(`下载失败，状态码：${response.status}`)
          }

          const blob = await response.blob()
          const filename = this.extractFilename(url) || `file_${index + 1}`
          const extension = this.getFileExtension(url) || this.getExtensionFromBlob(blob)
          const zipFilename = `${prefix}_${filename}${extension ? '.' + extension : ''}`

          zip.file(zipFilename, blob)
          successCount++
        } catch (error) {
          console.error(`下载文件失败 [${index + 1}/${urlArray.length}]:`, url, error)
          failCount++
        }
      })

      await Promise.allSettled(downloadPromises)

      if (successCount === 0) {
        throw new Error('所有文件下载失败')
      }

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
      const zipFilename = options?.filename || `${prefix}_批量下载_${Date.now()}.zip`

      // 下载ZIP文件
      const objectUrl = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = zipFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)

      // 显示成功提示
      if (!options?.silent) {
        const message =
          successCount === urlArray.length
            ? options?.successMessage || `成功打包下载 ${successCount} 个文件`
            : `成功打包下载 ${successCount} 个文件，${failCount} 个文件下载失败`
        ElMessage.success(message)
      }

      return {
        success: true,
        message: `成功打包下载 ${successCount} 个文件`,
        data: { successCount, failCount, total: urlArray.length },
      }
    } catch (error: any) {
      this.handleError(error, options)
      return {
        success: false,
        error,
        message: error.message || '下载失败',
      }
    }
  }

  /**
   * 从URL中提取文件名
   */
  private extractFilename(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fullFilename = pathname.substring(pathname.lastIndexOf('/') + 1)
      // 移除扩展名
      const lastDotIndex = fullFilename.lastIndexOf('.')
      return lastDotIndex > 0
        ? fullFilename.substring(0, lastDotIndex)
        : fullFilename || `download_${Date.now()}`
    } catch {
      return `download_${Date.now()}`
    }
  }

  /**
   * 从URL中获取文件扩展名
   */
  private getFileExtension(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const lastDotIndex = pathname.lastIndexOf('.')
      if (lastDotIndex > 0) {
        return pathname.substring(lastDotIndex + 1).toLowerCase()
      }
      return ''
    } catch {
      return ''
    }
  }

  /**
   * 从Blob类型获取扩展名
   */
  private getExtensionFromBlob(blob: Blob): string {
    const type = blob.type
    if (type.includes('jpeg') || type.includes('jpg')) return 'jpg'
    if (type.includes('png')) return 'png'
    if (type.includes('gif')) return 'gif'
    if (type.includes('webp')) return 'webp'
    if (type.includes('mp4')) return 'mp4'
    if (type.includes('webm')) return 'webm'
    return ''
  }

  /**
   * 统一错误处理
   */
  private handleError(error: any, options?: DownloadOptions): void {
    console.error('下载失败:', error)

    if (!options?.silent) {
      const message = options?.errorMessage || error.message || '下载失败，请重试'
      ElMessage.error(message)
    }
  }

  // 会员相关逻辑暂不启用，保留占位
  isVip(): boolean {
    return false
  }

  getDownloadTip(): string {
    return '下载文件'
  }
}

// 导出单例实例
export const watermarkDownloader = WatermarkDownloader.getInstance()

// 导出类型
export type { DownloadOptions, DownloadResult }

// 默认导出
export default watermarkDownloader
