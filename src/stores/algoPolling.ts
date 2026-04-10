/**
 * 算法任务轮询（按 algoOrderNo）：全局单例、同订单不重复开多路轮询。
 * 页面侧只读 tasks，完成/失败时写入 orderResultVOS 供列表回填。
 */
import { defineStore } from 'pinia'
import { algoApi } from '@/api/algo'
import { waitForNavigatorOnline } from '@/utils/networkWait'

type PollState = {
  status: number
  progress: number
  successfulCount?: number
  failedCount?: number
  /** 原样透传后端，用于完成态落结果 */
  orderResultVOS?: any[]
}

// 内部：全局唯一轮询控制（不放到 store state，避免序列化/热更新污染）
const inFlightPromiseMap = new Map<string, Promise<PollState | null>>()
const timerMap = new Map<string, number>()

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

const normalizeOrderNo = (raw: any) => String(raw ?? '').trim()

export const useAlgoPollingStore = defineStore('algoPolling', {
  state: () => ({
    /** key=algoOrderNo，value=最新轮询状态 */
    tasks: {} as Record<string, PollState>,
  }),
  actions: {
    get(orderNo: string) {
      return this.tasks[orderNo]
    },
    stop(orderNoRaw: string) {
      const orderNo = normalizeOrderNo(orderNoRaw)
      const t = timerMap.get(orderNo)
      if (t) window.clearTimeout(t)
      timerMap.delete(orderNo)
      // 关键：删除 in-flight 标记，_poll 循环会在下一轮主动退出
      inFlightPromiseMap.delete(orderNo)
      // 不删除 tasks：让 UI 还能读到最后一次状态（完成/失败）
    },
    stopAll() {
      timerMap.forEach((t) => window.clearTimeout(t))
      timerMap.clear()
      // stopAll 也要真正中断所有 in-flight 轮询
      inFlightPromiseMap.clear()
    },
    async start(orderNoRaw: string) {
      const orderNo = normalizeOrderNo(orderNoRaw)
      if (!orderNo) return null

      const existed = inFlightPromiseMap.get(orderNo)
      if (existed) return existed

      const p = this._poll(orderNo).finally(() => {
        inFlightPromiseMap.delete(orderNo)
      })
      inFlightPromiseMap.set(orderNo, p)
      return p
    },
    async _poll(orderNo: string): Promise<PollState | null> {
      // 先立即拉一次（不等定时器），避免“点进详情但没请求”的空窗
      let lastProgress = Number(this.tasks[orderNo]?.progress ?? 0) || 0

      for (let i = 0; i < 240; i++) {
        await waitForNavigatorOnline()

        // 如果外部 stop 了，这里直接退出
        if (!inFlightPromiseMap.has(orderNo)) return this.tasks[orderNo] ?? null

        try {
          const res: any = await algoApi.query({ orderNo })
          if (String(res?.code) !== '0000' || !res?.data) {
            await sleep(3000)
            continue
          }

          const data: any = res.data
          const status = Number(data?.status ?? 0)
          const orderResultVOS = Array.isArray(data?.orderResultVOS) ? data.orderResultVOS : []
          const firstVO = orderResultVOS[0] || {}
          const rawProgress = data?.progress ?? firstVO?.progress
          const parsed = rawProgress === undefined || rawProgress === null || rawProgress === '' ? NaN : Number(rawProgress)
          const incoming = Number.isFinite(parsed) ? parsed : 0
          const progress = Math.max(lastProgress, Math.min(100, Math.max(0, incoming)))
          lastProgress = progress

          const next: PollState = {
            status,
            progress,
            successfulCount: data?.successfulCount ?? firstVO?.successfulCount,
            failedCount: data?.failedCount ?? firstVO?.failedCount,
            orderResultVOS,
          }
          // 先写入 tasks，让 UI 能立即吃到最新进度/计数
          this.tasks[orderNo] = next

          const hasDonePayload = orderResultVOS.some((vo: any) => {
            const id = String(vo?.id ?? vo?.algoOrderId ?? vo?.algoOrderNo ?? '').trim()
            const url = String(vo?.url ?? vo?.thumbUrl ?? '').trim()
            return !!id || !!url
          })
          // 兼容后端“先给 status=3，后补 orderResultVOS”的时序：
          // 仅 status=3 不立刻停轮询，拿到有效结果再停。
          if (status === 4 || hasDonePayload) {
            // 完成/失败：停止后续定时
            this.stop(orderNo)
            return next
          }
        } catch (_e) {
          // 断网/异常：稍后再试（waitForNavigatorOnline 会在离线时挂起）
          await waitForNavigatorOnline()
        }

        // 生成中：每 5s 一次；离线时 waitForNavigatorOnline 会把这段自然“挂住”
        await sleep(5000)
      }

      return this.tasks[orderNo] ?? null
    },
  },
})

