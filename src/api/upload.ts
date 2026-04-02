/* global File, FormData */
import { h } from 'vue'
import request from '@/utils/request'
import type { ApiResponse } from '@/types'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

/** 异常时优先取响应体 msg（与业务失败一致）；无则走通用提示 */
const pickErrorMsg = (error: unknown): string => {
  const d = (error as any)?.response?.data
  if (d && typeof d === 'object') {
    const m = (d as any).msg ?? (d as any).message
    if (typeof m === 'string' && m.trim()) return m.trim()
  }
  return ''
}

/**
 * 文件上传配置
 */
interface UploadConfig {
  showLoading?: boolean // 是否显示加载提示
  loadingText?: string // 加载提示文本
  /** 是否显示默认成功/失败消息（默认 true）；为 false 时由调用方自定义提示 */
  showMessage?: boolean
}

/**
 * 上传响应数据
 */
interface UploadResponse {
  name: string // 文件名
  contentType: string // 文件类型
  size: number // 文件大小（字节）
  url: string // 文件访问URL
  path: string // 服务器存储路径
  createTime: string // 创建时间
  source: string | null // 来源
}

/**
 * 文件上传 API
 */
export const uploadApi = {
  /**
   * 上传图片
   * @param file 文件对象
   * @param config 上传配置
   * @returns Promise<上传结果>
   */
  uploadImage: async (
    file: File,
    config?: UploadConfig
  ): Promise<{ success: boolean; url?: string; message?: string }> => {
    const {
      showLoading = true,
      loadingText = '图片上传中...',
      showMessage = true,
    } = config || {}

    let loadingMsg: any = null

    try {
      if (showLoading) {
        loadingMsg = ElMessage({
          message: loadingText,
          duration: 0,
          showClose: false,
          customClass: 'upload-loading-message',
          icon: h(Loading, { class: 'is-loading' }),
        })
      }

      const formData = new FormData()
      formData.append('file', file)

      const response: ApiResponse<UploadResponse> = await request.post(
        '/v1/storage/uploadImage',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (loadingMsg) {
        loadingMsg.close()
      }

      const respData: any = (response as any).data
      const uploadedUrl = String(respData?.url || respData?.fileUrl || '').trim()
      const code = String((response as any).code ?? '')
      if (code === '0000' && uploadedUrl) {
        if (showLoading && showMessage) {
          ElMessage.success('图片上传成功')
        }
        return { success: true, url: uploadedUrl }
      } else {
        const msg = (response as any).msg || '图片上传失败'
        if (showMessage) ElMessage.error(msg)
        return { success: false, message: msg || '上传失败' }
      }
    } catch (error) {
      if (loadingMsg) {
        loadingMsg.close()
      }

      console.error('图片上传失败:', error)
      const failMsg = pickErrorMsg(error)
      if (showMessage) {
        ElMessage.error(failMsg || '网络开小差了，请稍后重试~')
      }
      return { success: false, message: failMsg || '网络错误' }
    }
  },

  /**
   * 上传多张图片
   */
  uploadImages: async (
    files: File[],
    config?: UploadConfig
  ): Promise<Array<{ success: boolean; url?: string; message?: string }>> => {
    const uploadPromises = files.map((file) => uploadApi.uploadImage(file, config))
    return Promise.all(uploadPromises)
  },

  /**
   * 上传视频
   */
  uploadVideo: async (
    file: File,
    config?: UploadConfig
  ): Promise<{ success: boolean; url?: string; message?: string }> => {
    const { showLoading = true, loadingText = '视频上传中...', showMessage = true } = config || {}

    let loadingMsg: any = null

    try {
      if (showLoading) {
        loadingMsg = ElMessage({
          message: loadingText,
          duration: 0,
          showClose: false,
          customClass: 'upload-loading-message',
          icon: h(Loading, { class: 'is-loading' }),
        })
      }

      const formData = new FormData()
      formData.append('file', file)

      const response: ApiResponse<UploadResponse> = await request.post(
        '/api-file/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (loadingMsg) {
        loadingMsg.close()
      }

      const respData: any = (response as any).data
      const code = String((response as any).code ?? '')
      if (code === '0000' && respData?.url) {
        if (showLoading && showMessage) {
          ElMessage.success('视频上传成功')
        }
        return { success: true, url: respData.url }
      } else {
        const msg = (response as any).msg || '视频上传失败'
        if (showMessage) ElMessage.error(msg)
        return { success: false, message: msg || '上传失败' }
      }
    } catch (error) {
      if (loadingMsg) {
        loadingMsg.close()
      }

      console.error('视频上传失败:', error)
      const failMsg = pickErrorMsg(error)
      if (showMessage) {
        ElMessage.error(failMsg || '网络开小差了，请稍后重试~')
      }
      return { success: false, message: failMsg || '网络错误' }
    }
  },

  /**
   * 通用文件上传
   */
  uploadFile: async (
    file: File,
    config?: UploadConfig
  ): Promise<{ success: boolean; url?: string; message?: string }> => {
    const { showLoading = true, loadingText = '文件上传中...', showMessage = true } = config || {}

    let loadingMsg: any = null

    try {
      if (showLoading) {
        loadingMsg = ElMessage({
          message: loadingText,
          duration: 0,
          showClose: false,
          customClass: 'upload-loading-message',
          icon: h(Loading, { class: 'is-loading' }),
        })
      }

      const formData = new FormData()
      formData.append('file', file)

      const response: ApiResponse<UploadResponse> = await request.post(
        '/api-file/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (loadingMsg) {
        loadingMsg.close()
      }

      const respData: any = (response as any).data
      const code = String((response as any).code ?? '')
      if (code === '0000' && respData?.url) {
        if (showLoading && showMessage) {
          ElMessage.success('文件上传成功')
        }
        return { success: true, url: respData.url }
      } else {
        const msg = (response as any).msg || '文件上传失败'
        if (showMessage) ElMessage.error(msg)
        return { success: false, message: msg || '上传失败' }
      }
    } catch (error) {
      if (loadingMsg) {
        loadingMsg.close()
      }

      console.error('文件上传失败:', error)
      const failMsg = pickErrorMsg(error)
      if (showMessage) {
        ElMessage.error(failMsg || '网络开小差了，请稍后重试~')
      }
      return { success: false, message: failMsg || '网络错误' }
    }
  },
}

export default uploadApi
