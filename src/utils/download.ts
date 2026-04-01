/* global fetch, document, AbortController */
/**
 * 通用下载工具：支持开发环境代理、fetch->blob，避免浏览器直接打开资源
 * 无需配置域名列表，自动支持任意域名的跨域下载
 */

/**
 * 构建可下载的 URL
 * - 全环境统一通过 /file-proxy（或配置的前缀）走同域代理，避免跨域
 */
export const buildDownloadUrl = (url: string): string => {
  if (!url || !url.trim()) {
    return url
  }

  // 代理前缀：默认 /file-proxy，可通过 VITE_FILE_PROXY_PREFIX 覆盖
  const fileProxyPrefix = (import.meta.env.VITE_FILE_PROXY_PREFIX || '/file-proxy') as string

  // 如果已经是代理前缀开头的路径（说明已经经过处理），直接返回
  if (url.startsWith(`${fileProxyPrefix}/`)) {
    return url
  }

  try {
    // 1. 处理绝对 URL（http / https）
    if (/^https?:\/\//i.test(url)) {
      let host: string
      let path: string

      try {
        const urlObj = new URL(url)
        host = urlObj.hostname
        path = urlObj.pathname + urlObj.search
      } catch (error) {
        const urlMatch = url.match(/^(https?:\/\/)([^/?#]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i)
        if (urlMatch) {
          host = urlMatch[2]
          path = (urlMatch[3] || '/') + (urlMatch[4] || '')
          if (import.meta.env.DEV) {
            console.warn('[buildDownloadUrl] new URL() 解析失败，使用正则提取:', {
              url,
              host,
              path,
              error: String(error),
            })
          }
        } else {
          if (import.meta.env.DEV) {
            console.error('[buildDownloadUrl] URL 格式无法解析:', url)
          }
          return url
        }
      }

      // 全环境统一走同域代理：<fileProxyPrefix>/<protocol>/<host>/<path>
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      const originalProtocol = url.toLowerCase().startsWith('https://') ? 'https' : 'http'
      const proxyUrl = `${fileProxyPrefix}/${originalProtocol}/${host}${normalizedPath}`
      if (import.meta.env.DEV) {
        console.log('[buildDownloadUrl] 代理 URL:', {
          original: url,
          protocol: originalProtocol,
          host,
          path: normalizedPath,
          proxyUrl,
        })
      }
      return proxyUrl
    }

    // 2. 相对路径（以 / 开头）
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url
    }

    return url
  } catch (_error) {
    return url
  }
}

/**
 * 触发文件下载
 * @param url 原始文件地址
 * @param filename 下载文件名（不含路径）
 */
export const downloadFile = async (url: string, filename: string) => {
  if (!url) throw new Error('下载地址为空')

  const isDev = import.meta.env.DEV
  if (isDev) {
    console.log('[downloadFile] 开始下载:', { url, filename })
  }

  let finalUrl = buildDownloadUrl(url)
  if (!finalUrl) {
    throw new Error('构建下载URL失败')
  }

  if (isDev) {
    console.log('[downloadFile] buildDownloadUrl 返回:', { finalUrl })
  }

  // 如果仍然是相对路径（例如 /file-proxy/...），补全为当前站点的完整 URL
  // 注意：/file-proxy/domain/path 这种格式需要特殊处理，不能直接用 new URL() 解析
  if (finalUrl.startsWith('/')) {
    // 对于 /file-proxy/ 路径，直接拼接 origin，不做任何编码或解析
    // 因为路径已经由 buildDownloadUrl 正确处理过，保持原样即可
    // 浏览器在发送 fetch 请求时会自动处理 URL 编码
    finalUrl = `${window.location.origin}${finalUrl}`
  }

  if (isDev) {
    console.log('[downloadFile] 最终请求 URL:', finalUrl)
  }

  // fetch -> blob 避免浏览器直接预览，同时兼容跨域代理
  // 设置超时（30秒）
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(finalUrl, {
      credentials: 'include',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(`下载失败，状态码：${res.status}`)
    }

    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = objectUrl
    // filename 由业务层传入，包含原始扩展名，这里不做任何改动
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      const timeoutError = new Error('下载超时，请稍后重试')
      ;(timeoutError as any).cause = error
      throw timeoutError
    }
    throw error
  }
}
