import type { CreationResult } from '@/composables/useTaskPolling'

type MapOptions = {
  fallbackIdFromAlgoResultId?: boolean
  fallbackCreateTime?: string
}

export const mapRecordToCreationResult = (r: any, options?: MapOptions): CreationResult | null => {
  const fallbackIdFromAlgoResultId = !!options?.fallbackIdFromAlgoResultId
  const id = String(r?.id ?? (fallbackIdFromAlgoResultId ? r?.algoOrderResultId : '') ?? '')
  if (!id) return null

  const backendFileType = Number(r?.fileType ?? 1)
  const backendStatus = Number(r?.status ?? 3)
  const collect = Number(r?.collectStatus ?? 0)

  return {
    id,
    algoOrderId: String(r?.algoOrderId ?? ''),
    // 轮询/回填 key 只认 algoOrderNo（与你的接口约定保持一致）
    algoOrderNo: (() => {
      const key = r?.algoOrderNo != null ? String(r.algoOrderNo).trim() : ''
      return key ? key : undefined
    })(),
    algoUuId: r?.algoUuId === undefined ? undefined : (r?.algoUuId == null ? null : String(r.algoUuId)),
    userId: r?.userId != null ? String(r.userId) : undefined,
    userSonId: r?.userSonId != null ? String(r.userSonId) : null,
    menuCode: r?.menuCode != null ? String(r.menuCode) : undefined,
    thumbUrl: (r?.thumbUrl ?? null) as any,
    url: (r?.url ?? null) as any,
    originalUrl: (r?.originalUrl ?? null) as any,
    fileSize: r?.fileSize !== undefined && r?.fileSize !== null ? Number(r.fileSize) : undefined,
    duration: r?.duration !== undefined && r?.duration !== null ? Number(r.duration) : undefined,
    fileType: backendFileType,
    status: backendStatus,
    collectStatus: collect,
    prompt: String(r?.prompt ?? r?.functionPrompt ?? r?.creativeDescription ?? ''),
    createTime: String(r?.createTime ?? r?.create_time ?? options?.fallbackCreateTime ?? ''),
    progress: Number(r?.progress ?? (backendStatus === 3 ? 100 : 0)),
  }
}

