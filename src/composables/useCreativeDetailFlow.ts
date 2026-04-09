import { nextTick, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { algoApi } from '@/api/algo'
import type { CreativeTemplate } from '@/types'
import { useAlgoPollingStore } from '@/stores/algoPolling'
import { mergeOrderResultsIntoList } from '@/utils/orderResultMerge'

type FlowCtx = {
  props: any
  route: any
  templateStore: any
  userStore: any
  mediaContainerRef: Ref<any>
  isUnmountedRef: Ref<boolean>
  isSubmittingAgain: Ref<boolean>
  templateDetail: Ref<CreativeTemplate | null>
  relatedTemplates: Ref<any[]>
  selectedThumbnail: Ref<number>
  previousThumbnailIndex: Ref<number>
  isDataReady: Ref<boolean>
  creativeDescription: Ref<string>
  getAlgoResultId: (item: any) => string | number | null
  loadRelatedTemplates: (isRefresh?: boolean) => Promise<void>
  syncMediaContainerToSelected: (instant?: boolean) => void
}

export function useCreativeDetailFlow(ctx: FlowCtx) {
  const algoPollingStore = useAlgoPollingStore()
  // /algo/query 的 orderNo 只用 algoOrderNo
  const getOrderNoCandidate = (item: any) => String(item?.algoOrderNo ?? '').trim()
  const normalizeOrderNo = (raw: any) => String(raw ?? '').trim()

  // 同一 orderNo 复用轮询 Promise，避免重复请求
  const pollingPromiseMap = new Map<string, Promise<void>>()
  const lastPollingStateMap = new Map<string, { status: number; progress: number }>()

  // getAlgoResultDetails 并发保护：丢弃过期请求，避免乱序覆盖
  const detailRequestToken = ref(0) // 请求版本号，用于丢弃过期返回
  const currentDetailTargetId = ref<string | number | null>(null) // 当前应该展示的详情 id
  const lastLoadedDetailId = ref<string | number | null>(null) // 同 id 已加载过则跳过，减少重复请求
  const inFlightDetailId = ref<string | number | null>(null) // 同 id 并发请求直接跳过

  // 只有 status=3（完成）才需要补全详情
  const shouldFetchDetailForId = (id?: string | number) => {
    if (id === undefined || id === null) return false
    const target = ctx.relatedTemplates.value.find((x: any) => String(x?.id) === String(id)) as any
    const status = Number(target?.status)
    if (status === 0 || status === 1 || status === 2 || status === 4) return false
    return status === 3 || !Number.isFinite(status)
  }

  // 再生成：插入 pending 占位，并在轮询中回填 status/progress
  const prependGeneratingPlaceholder = (orderNo: string, payload: any) => {
    const key = normalizeOrderNo(orderNo)
    if (!key) return
    const now = new Date().toISOString()
    const placeholder: any = {
      id: `pending-${key}`,
      algoOrderId: key,
      // 保证轮询/回填使用同一语义的订单号字段
      algoOrderNo: key,
      menuCode: String((ctx.templateDetail.value as any)?.menuCode || ''),
      fileType: Number((ctx.templateDetail.value as any)?.fileType ?? 1),
      status: 2,
      prompt: String(payload?.creativeDescription ?? ctx.creativeDescription.value ?? '生成中...'),
      progress: 0,
      createTime: now,
      url: '',
      thumbUrl: '',
      originalUrl: '',
      collectStatus: 0,
    }

    const existed = ctx.relatedTemplates.value.findIndex(
      (x: any) =>
        normalizeOrderNo((x as any)?.algoOrderNo) === key ||
        normalizeOrderNo((x as any)?.algoOrderId) === key ||
        String((x as any)?.id || '') === String(placeholder.id),
    )
    if (existed >= 0) ctx.relatedTemplates.value[existed] = { ...(ctx.relatedTemplates.value[existed] as any), ...placeholder }
    else ctx.relatedTemplates.value = [placeholder, ...ctx.relatedTemplates.value] as any[]

    ctx.selectedThumbnail.value = 0
    ctx.previousThumbnailIndex.value = 0
    ctx.templateDetail.value = { ...placeholder } as any
    nextTick(() => ctx.syncMediaContainerToSelected(true))
  }

  /**
   * 更新 pending-${orderNo} 占位卡（只 patch 当前 pending 记录）。
   * 若 pending 恰好是当前 selectedThumbnail，则同步更新 templateDetail 以保证右侧显示一致。
   */
  const patchAgainGeneratePlaceholder = (orderNo: string, patch: Record<string, any>) => {
    const key = normalizeOrderNo(orderNo)
    if (!key) return
    const idx = ctx.relatedTemplates.value.findIndex(
      (x: any) =>
        normalizeOrderNo((x as any)?.algoOrderNo) === key ||
        normalizeOrderNo((x as any)?.algoOrderId) === key ||
        String((x as any)?.id || '') === `pending-${key}`,
    )
    if (idx < 0) return
    ctx.relatedTemplates.value[idx] = {
      ...(ctx.relatedTemplates.value[idx] as any),
      ...patch,
      algoOrderId: String((ctx.relatedTemplates.value[idx] as any)?.algoOrderId || key),
      algoOrderNo: String((ctx.relatedTemplates.value[idx] as any)?.algoOrderNo || key),
    } as any
    if (ctx.selectedThumbnail.value === idx) ctx.templateDetail.value = { ...(ctx.relatedTemplates.value[idx] as any) }
  }

  /**
   * status=3 成功后，把 orderResultVOS 回填到 relatedTemplates：
   * - 优先“原地替换”同 orderNo 的生成中/占位项（避免详情页看起来又新增了一组列表）
   * - 若找不到目标项，则退化为把新结果插到最前
   * - 去重：避免与已存在记录重复
   * - 同步 templateDetail：右侧直接展示第一张结果
   */
  const applyGeneratedResults = (records: any[], orderNo?: string) => {
    if (!Array.isArray(records) || records.length === 0) return null
    const normalized = records
      .map((item: any) => ({ ...item, id: ctx.getAlgoResultId(item) != null ? String(ctx.getAlgoResultId(item)) : '' }))
      .filter((item: any) => !!item?.id)
    if (normalized.length === 0) return null

    const key = normalizeOrderNo(orderNo)
    const merged = mergeOrderResultsIntoList(
      (ctx.relatedTemplates.value || []) as any[],
      key,
      normalized as any[],
      { preferInPlace: true, insertAtIfNotFound: () => 0 },
    )
    ctx.relatedTemplates.value = merged.list as any[]
    const replaceIdx = merged.replacedIndex >= 0 ? merged.replacedIndex : 0
    ctx.selectedThumbnail.value = Math.max(0, Math.min(replaceIdx, ctx.relatedTemplates.value.length - 1))
    ctx.previousThumbnailIndex.value = ctx.selectedThumbnail.value
    const current = ctx.relatedTemplates.value[ctx.selectedThumbnail.value] as any
    ctx.templateDetail.value = current ? ({ ...current } as any) : null
    nextTick(() => ctx.syncMediaContainerToSelected(true))
    return current || null
  }

  /**
   * 单次详情加载（getAlgoResultDetails），带并发保护：
   * - inFlightDetailId：同 id 请求中跳过
   * - lastLoadedDetailId：同 id 已加载过跳过
   * - detailRequestToken/currentDetailTargetId：丢弃过期返回
   */
  const loadDetailOnce = async (id?: string | number) => {
    if (!id) return
    if (!shouldFetchDetailForId(id)) return
    if (inFlightDetailId.value != null && String(inFlightDetailId.value) === String(id)) return
    if (lastLoadedDetailId.value != null && String(lastLoadedDetailId.value) === String(id)) return

    currentDetailTargetId.value = id
    const token = ++detailRequestToken.value
    inFlightDetailId.value = id
    try {
      await loadTemplateDetail(id, { token, expectedId: id })
    } finally {
      if (inFlightDetailId.value != null && String(inFlightDetailId.value) === String(id)) {
        inFlightDetailId.value = null
      }
    }
  }

  /**
   * 启动 orderNo 轮询（复用 promise）：
   * - key=orderNo
   * - 已有轮询则复用现成 Promise
   */
  const startPollingGenerateResult = (
    orderNo: string,
    opts?: { successText?: string; failText?: string; timeoutText?: string; noResultText?: string },
  ) => {
    const key = normalizeOrderNo(orderNo)
    if (!key) return
    const existedPromise = pollingPromiseMap.get(key)
    if (existedPromise) return existedPromise
    // 统一走全局轮询：避免列表/详情重复请求
    const promise = (algoPollingStore.start(key) as Promise<any>)
      .then((finalState) => {
        if (!finalState) return
        const status = Number(finalState.status)
        if (status === 3) {
          const vos = Array.isArray((finalState as any).orderResultVOS) ? (finalState as any).orderResultVOS : []
          const first = applyGeneratedResults(vos, key)
          if (!first) {
            ElMessage.warning(opts?.noResultText ?? '生成完成，但未返回结果')
            return
          }
          const firstId = ctx.getAlgoResultId(first)
          if (firstId) return loadDetailOnce(firstId)
          ElMessage.success(opts?.successText ?? '生成完成')
          return
        }
        if (status === 4) {
          patchAgainGeneratePlaceholder(key, { status: 4, progress: Number(finalState.progress ?? 0), prompt: '生成失败' })
          ElMessage.error(opts?.failText ?? '生成失败')
        }
      })
      .finally(() => {
        pollingPromiseMap.delete(key)
        lastPollingStateMap.delete(key)
      })
    pollingPromiseMap.set(key, promise)
    return promise
  }
  /**
   * loadTemplateDetail：请求 /api/v1/algo/getAlgoResultDetails 补全详情字段。
   * 先用列表项兜底（避免空白），再回填补全字段。
   */
  const loadTemplateDetail = async (
    id?: string | number,
    options?: { token: number; expectedId?: string | number },
  ) => {
    if (!id) return
    const myToken = options?.token
    const expectedId = options?.expectedId ?? id
    if (myToken != null && myToken !== detailRequestToken.value) return
    if (
      expectedId != null &&
      currentDetailTargetId.value != null &&
      String(expectedId) !== String(currentDetailTargetId.value)
    ) return

    const fallback = ctx.relatedTemplates.value.find((x: any) => String(x?.id) === String(id)) as any
    if (fallback) ctx.templateDetail.value = { ...(ctx.templateDetail.value || ({} as any)), ...fallback }
    else ctx.templateDetail.value = null

    if (!shouldFetchDetailForId(id)) {
      if (myToken != null && myToken === detailRequestToken.value) lastLoadedDetailId.value = expectedId
      const target = ctx.relatedTemplates.value.find((x: any) => String(x?.id) === String(id)) as any
      const status = Number(target?.status)
      if (myToken != null && myToken === detailRequestToken.value && (status === 1 || status === 2)) {
        const orderNo = getOrderNoCandidate(target)
        if (orderNo) {
          startPollingGenerateResult(orderNo, {
            successText: '生成完成',
            failText: '生成失败',
            timeoutText: '生成超时，请稍后在“我的创作”中查看',
          })
        }
      }
      return
    }

    try {
      const algoResulId = String(id)
      const response = await algoApi.getAlgoResultDetails({ algoResulId })
      const detailData = (response as any)?.data ?? response
      if (myToken != null && myToken !== detailRequestToken.value) return
      if (
        expectedId != null &&
        currentDetailTargetId.value != null &&
        String(expectedId) !== String(currentDetailTargetId.value)
      ) return

      ctx.templateDetail.value = { ...(ctx.templateDetail.value || ({} as any)), ...(detailData as any) }
      const idx = ctx.relatedTemplates.value.findIndex((x: any) => String(x?.id) === algoResulId)
      if (idx >= 0) ctx.relatedTemplates.value[idx] = { ...(ctx.relatedTemplates.value[idx] as any), ...(detailData as any) }
      lastLoadedDetailId.value = expectedId
    } catch (e) {
      console.warn('[CreativeDetail] getAlgoResultDetails failed:', e)
      if (myToken != null && myToken === detailRequestToken.value) lastLoadedDetailId.value = expectedId
    }
  }

  /**
   * 再次生成按钮入口：
   * - 从 templateDetail.webRequest 取 payload
   * - submit 成功后得到 orderNo
   * - 插入 pending 占位卡 + 启动轮询
   */
  const handleAgainGenerate = async () => {
    if (ctx.isSubmittingAgain.value) return
    const d: any = ctx.templateDetail.value
    if (!d) return ElMessage.warning('详情数据不存在')

    const wrRaw = d?.webRequest
    let payload: any = null
    if (wrRaw && typeof wrRaw === 'object') payload = wrRaw
    else if (typeof wrRaw === 'string') {
      try { payload = JSON.parse(wrRaw) } catch { payload = null }
    }
    if (!payload || typeof payload !== 'object') return ElMessage.warning('缺少可提交的 webRequest 参数')

    try {
      ctx.isSubmittingAgain.value = true
      const resp = await algoApi.submit(payload as any)
      if ((resp as any)?.code !== '0000') return ElMessage.error((resp as any)?.msg || '再次生成提交失败')
      const data = (resp as any)?.data
      const orderNo = String(
        (typeof data === 'string' || typeof data === 'number'
          ? data
          : data?.algoOrderNo ?? data?.algoOrderId ?? '') || '',
      )
      if (!orderNo) return ElMessage.warning('提交成功，但未返回任务编号')

      // 只要提交成功就刷新一次个人信息（扣点/会员状态可能已变化）
      await ctx.userStore.getUserInfo().catch((e: any) => {
        console.warn('[CreativeDetail] 再次生成提交成功后刷新用户信息失败:', e)
      })
      ElMessage.success('已提交再次生成任务，正在生成中')
      const pollPromise = startPollingGenerateResult(orderNo)
      prependGeneratingPlaceholder(orderNo, payload)
      if (pollPromise) await pollPromise
    } catch (error) {
      console.error('[handleAgainGenerate] submit failed:', error)
      ElMessage.error('再次生成提交失败，请稍后重试')
    } finally {
      ctx.isSubmittingAgain.value = false
    }
  }

  /**
   * 初始化策略：优先使用 store 缓存列表数据。
   * - 使用缓存可避免首屏闪烁与选中错位
   * - 最后仍会根据 creativeTemplateId/templateId 拉一次完整详情
   */
  const initFromCachedList = async (cachedListData: any) => {
    const templateId = ctx.props.id || ctx.route.params.id
    let foundIndex: number
    if (cachedListData.currentIndex !== undefined && cachedListData.currentIndex >= 0) foundIndex = cachedListData.currentIndex
    else {
      foundIndex = cachedListData.list.findIndex((item: any) => {
        const itemTemplateId = item.creativeTemplateId || item.creativeTemplate?.id || item.id
        return (
          String(item.id) === String(templateId) ||
          String(item.creativeTemplateId) === String(templateId) ||
          String(item.creativeTemplate?.id) === String(templateId) ||
          String(itemTemplateId) === String(templateId)
        )
      })
    }

    if (foundIndex >= 0 && foundIndex < cachedListData.list.length) {
      // 缓存列表里的每一项 id 语义不一致（有的会把 creativeTemplate.id 覆盖进来），
      // 这里不做扁平化转换，保持“列表项 id=algoResulId”的语义，避免误调详情接口。
      const list = Array.isArray(cachedListData.list) ? cachedListData.list : []
      const selectedItem = list[foundIndex]

      ctx.selectedThumbnail.value = foundIndex
      ctx.relatedTemplates.value = list as any[]
      ctx.templateDetail.value = selectedItem as any

      await nextTick()
      if (ctx.mediaContainerRef.value && ctx.relatedTemplates.value.length > 0) {
        await new Promise((resolve) => window.requestAnimationFrame(resolve))
        const container = ctx.mediaContainerRef.value
        if (!container) return
        const itemHeight = container.clientHeight
        container.scrollTop = ctx.selectedThumbnail.value * itemHeight
      }

      ctx.isDataReady.value = true
      const detailId = ctx.getAlgoResultId(selectedItem)
      if (detailId) await loadDetailOnce(detailId)
      return
    }

    await loadDetailOnce(ctx.route.params.id as string | number | undefined)
    if (ctx.templateDetail.value) {
      ctx.relatedTemplates.value = [ctx.templateDetail.value as any]
      ctx.selectedThumbnail.value = 0
      ctx.isDataReady.value = true
    }
  }

  /**
   * 初始化策略：无缓存时先拉“相关列表”，再定位路由 id 并回显详情。
   */
  const initByLoadingListFirst = async () => {
    const targetAlgoResulId = (ctx.props.id || ctx.route.params.id) as string | number | undefined
    const targetAlgoResulIdStr = targetAlgoResulId != null ? String(targetAlgoResulId) : ''
    await ctx.loadRelatedTemplates(true)
    if (!ctx.relatedTemplates.value.length) {
      await loadDetailOnce(targetAlgoResulId)
      if (ctx.templateDetail.value) {
        ctx.relatedTemplates.value = [ctx.templateDetail.value as any]
        ctx.selectedThumbnail.value = 0
        ctx.isDataReady.value = true
      }
      return
    }
    const foundIndex = ctx.relatedTemplates.value.findIndex((x: any) => String(x?.id) === targetAlgoResulIdStr)
    ctx.selectedThumbnail.value = foundIndex >= 0 ? foundIndex : 0
    const current = ctx.relatedTemplates.value[ctx.selectedThumbnail.value] as any
    ctx.templateDetail.value = current
    ctx.isDataReady.value = true
    const detailId = ctx.getAlgoResultId(current)
    if (detailId) await loadDetailOnce(detailId)
  }

  /**
   * 组件挂载入口：选择缓存初始化还是列表优先初始化。
   */
  const onMountedFlow = async () => {
    const cachedListData = ctx.templateStore.getTemplateListData()
    const cateIdFromRoute = ctx.props.cateId || (ctx.route.query.cateId as string)
    const shouldUseCachedData =
      cachedListData &&
      (cachedListData.cateId === undefined || cachedListData.cateId === cateIdFromRoute)

    if (shouldUseCachedData && cachedListData.list && cachedListData.list.length > 0) await initFromCachedList(cachedListData)
    else await initByLoadingListFirst()
  }

  return {
    handleAgainGenerate,
    startPollingGenerateResult,
    loadTemplateDetail,
    loadDetailOnce,
    initFromCachedList,
    initByLoadingListFirst,
    onMountedFlow,
    getOrderNoCandidate,
  }
}

