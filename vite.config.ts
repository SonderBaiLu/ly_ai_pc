import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
import type { Plugin } from 'vite'
import http from 'http'
import https from 'https'
import devEnv from './env.development'
import prodEnv from './env.production'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = mode === 'production' ? prodEnv : devEnv
  const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || env.VITE_API_PROXY_TARGET
  const apiBaseUrl = process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL
  const appVersion = process.env.VITE_APP_VERSION || env.VITE_APP_VERSION
  const isProd = mode === 'production'

  // 文件代理中间件：统一使用 /file-proxy
  const fileProxyPlugin = (): Plugin => {
    const mountProxy = (server: any, mountPath: string) => {
      server.middlewares.use(mountPath, (req: any, res: any) => {
        const rawPath = req.url || ''
        // 支持格式：/<protocol>/<domain>/<path>
        const match = rawPath.match(/^\/(https?)\/([^/]+)(\/.*)$/)
        if (!match) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Not Found: Invalid proxy path format')
          return
        }

        const protocol = match[1]
        const domain = match[2]
        const actualPath = match[3]
        const targetUrl = `${protocol}://${domain}${actualPath}`
        const client = protocol === 'https' ? https : http

        const proxyReq = client.request(
          targetUrl,
          {
            method: req.method,
            headers: {
              ...req.headers,
              host: domain,
              // dev 下禁用协商缓存，避免浏览器 304 读缓存失败（ERR_CACHE_READ_FAILURE）
              'if-none-match': undefined as any,
              'if-modified-since': undefined as any,
            },
            rejectUnauthorized: false,
            timeout: 30000,
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, {
              ...proxyRes.headers,
              'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
              pragma: 'no-cache',
              expires: '0',
              'access-control-allow-origin': '*',
              'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'access-control-allow-headers': '*',
            })
            proxyRes.pipe(res)
          },
        )

        proxyReq.on('error', (err) => {
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end(`Proxy Error: ${err.message}`)
          }
        })

        if (req.method !== 'GET' && req.method !== 'HEAD') {
          req.pipe(proxyReq)
        } else {
          proxyReq.end()
        }
      })
    }

    return {
      name: 'file-proxy',
      configureServer(server) {
        mountProxy(server, '/file-proxy')
      },
    }
  }

  return {
    define: {
      // 让业务代码里可以直接用 import.meta.env.VITE_API_BASE_URL
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
      // 让业务代码里可以直接用 import.meta.env.VITE_APP_VERSION
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    plugins: [
      vue(),
      fileProxyPlugin(),
      // 自动导入 Vue/Router/Pinia 等 API + Element Plus 相关函数
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: true, // 在项目根目录生成 auto-imports.d.ts
        resolvers: [ElementPlusResolver()],
      }),
      // 自动注册组件（Element Plus + 本地组件）
      Components({
        dts: true, // 在项目根目录生成 components.d.ts
        dirs: ['src/components', 'src/sections', 'src/views/**/components'],
        extensions: ['vue'],
        deep: true,
        resolvers: [
          ElementPlusResolver({
            // 这里不自动导入样式，继续使用 main.ts 里全局引入的 CSS
            importStyle: false,
          }),
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 让所有 <style lang="scss"> 自动可用全局变量/混入，避免每个组件重复导入
          additionalData: `@use "@/styles/variables" as *;\n`,
        },
      },
    },
    // 生产环境剔除 debug 日志（保留 warn/error 便于排障）
    esbuild: isProd
      ? {
        drop: ['console', 'debugger'],
      }
      : undefined,
  server: {
      port: 9004,
      strictPort: true,
      // 避免 Chrome 在 dev 模块 304 场景下出现 ERR_CACHE_READ_FAILURE
      headers: {
        'Cache-Control': 'no-store',
      },
      proxy: {
        // 开发环境 API 代理：/api -> 线上域名（或 .env 配置）
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
  },
  }
})
