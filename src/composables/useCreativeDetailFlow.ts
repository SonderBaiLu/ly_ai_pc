import { nextTick, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { algoApi } from '@/api/algo'
import type { CreativeTemplate } from '@/types'

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
  /**
   * ====== 再生成（orderNo）轮询控制 ======
   * 同一个 orderNo 可能被多处触发（按钮点击、watch 状态变化等）。
   * 使用 Promise 复用：保证同一 orderNo 只会轮询一次。
   */
  const pollingPromiseMap = new Map<string, Promise<void>>()
  const lastPollingStateMap = new Map<string, { status: number; progress: number }>()

  /**
   * ====== 详情接口（getAlgoResultDetails）并发保护 ======
   * 避免用户快速切换/轮询成功后同时触发详情请求造成乱序覆盖。
   *
   * - detailRequestToken：请求版本号，用于丢弃过期返回
   * - currentDetailTargetId：当前应该展示的详情 id
   * - inFlightDetailId：同 id 并发请求直接跳过
   * - lastLoadedDetailId：同 id 已加载过则跳过，减少重复请求
   */
  const detailRequestToken = ref(0)
  const currentDetailTargetId = ref<string | number | null>(null)
  const lastLoadedDetailId = ref<string | number | null>(null)
  const inFlightDetailId = ref<string | number | null>(null)

  const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

  /**
   * 是否需要调用详情接口补全右侧展示字段：
   * - 生成中/待请求/失败阶段：不调用详情接口（右侧直接用列表/占位回显）
   * - 生成完成：需要调用详情接口获取完整字段（模型参数/输出类型等）
   */
  const shouldFetchDetailForId = (id?: string | number) => {
    if (id === undefined || id === null) return false
    const target = ctx.relatedTemplates.value.find((x: any) => String(x?.id) === String(id)) as any
    const status = Number(target?.status)
    // status: 0初始化 1待请求 2处理中 3完成 4失败
    if (status === 0 || status === 1 || status === 2 || status === 4) return false
    return status === 3 || !Number.isFinite(status)
  }

  /**
   * ====== 占位与占位 patch ======
   * 提交“再次生成”后先在列表最前面插入 pending-${orderNo} 占位卡，
   * 然后轮询 status/progress 把占位卡更新为实时状态，直到 status=3 成功。
   */
  const prependGeneratingPlaceholder = (orderNo: string, payload: any) => {
    const now = new Date().toISOString()
    const placeholder: any = {
      id: `pending-${orderNo}`,
      algoOrderId: orderNo,
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
      (x: any) => String(x?.algoOrderId || '') === String(orderNo) || String(x?.id || '') === String(placeholder.id),
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
    const idx = ctx.relatedTemplates.value.findIndex(
      (x: any) => String(x?.algoOrderId || '') === String(orderNo) || String(x?.id || '') === `pending-${orderNo}`,
    )
    if (idx < 0) return
    ctx.relatedTemplates.value[idx] = {
      ...(ctx.relatedTemplates.value[idx] as any),
      ...patch,
      algoOrderId: String((ctx.relatedTemplates.value[idx] as any)?.algoOrderId || orderNo),
    } as any
    if (ctx.selectedThumbnail.value === idx) ctx.templateDetail.value = { ...(ctx.relatedTemplates.value[idx] as any) }
  }

  /**
   * status=3 成功后，把 orderResultVOS 映射插入 relatedTemplates：
   * - 新结果排在最前（selectedThumbnail=0）
   * - 去重：避免与已存在记录重复（pending 占位也会被替换掉）
   * - 同步 templateDetail：右侧直接展示最新一张
   */
  const prependGeneratedResults = (records: any[], orderNo?: string) => {
    if (!Array.isArray(records) || records.length === 0) return null
    const normalized = records
      .map((item: any) => ({ ...item, id: ctx.getAlgoResultId(item) != null ? String(ctx.getAlgoResultId(item)) : '' }))
      .filter((item: any) => !!item?.id)
    if (normalized.length === 0) return null

    const idSet = new Set(normalized.map((x: any) => String(x.id)))
    const merged = [
      ...normalized,
      ...ctx.relatedTemplates.value.filter((x: any) => {
        const sameId = idSet.has(String(x?.id))
        const sameOrderPlaceholder =
          !!orderNo && Number((x as any)?.status) === 2 && String((x as any)?.algoOrderId || '') === String(orderNo)
        return !sameId && !sameOrderPlaceholder
      }),
    ]
    ctx.relatedTemplates.value = merged as any[]

    const first = normalized[0]
    ctx.selectedThumbnail.value = 0
    ctx.previousThumbnailIndex.value = 0
    ctx.templateDetail.value = { ...first } as any
    nextTick(() => ctx.syncMediaContainerToSelected(true))
    return first
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
    const key = String(orderNo ?? '')
    if (!key) return
    const existedPromise = pollingPromiseMap.get(key)
    if (existedPromise) return existedPromise
    const promise = pollAgainGenerateResult(key, opts).finally(() => {
      pollingPromiseMap.delete(key)
      lastPollingStateMap.delete(key)
    })
    pollingPromiseMap.set(key, promise)
    return promise
  }

  /**
   * 轮询逻辑：
   * - status 1/2：回填 pending 占位卡 progress
   * - status 3：成功 -> 刷新用户信息 + 插入结果 + 只做详情回显（不刷新列表）
   * - status 4：失败 -> pending 占位卡切失败态
   */
  const pollAgainGenerateResult = async (
    orderNo: string,
    opts?: { successText?: string; failText?: string; timeoutText?: string; noResultText?: string },
  ) => {
    const successText = opts?.successText ?? '再次生成完成'
    const failText = opts?.failText ?? '再次生成失败'
    const timeoutText = opts?.timeoutText ?? '再次生成超时，请稍后在列表查看'
    const noResultText = opts?.noResultText ?? '生成完成，但未返回结果'

    for (let i = 0; i < 120; i++) {
      if (ctx.isUnmountedRef.value) return
      try {
        const queryResp = await algoApi.query({ orderNo })
        if ((queryResp as any)?.code !== '0000' || !(queryResp as any)?.data) {
          await sleep(3000)
          continue
        }
        const data: any = (queryResp as any).data
        const status = Number(data?.status)
        const orderResultVOS = Array.isArray(data?.orderResultVOS) ? data.orderResultVOS : []
        const firstVO = orderResultVOS[0] || {}
        const mergedProgress = Number(data?.progress ?? firstVO?.progress ?? 0)

        if (status === 1 || status === 2) {
          const prevState = lastPollingStateMap.get(orderNo)
          const nextState = { status, progress: mergedProgress }
          if (!prevState || prevState.status !== nextState.status || prevState.progress !== nextState.progress) {
            patchAgainGeneratePlaceholder(orderNo, nextState)
            lastPollingStateMap.set(orderNo, nextState)
          }
        }

        if (status === 3) {
          const first = prependGeneratedResults(orderResultVOS, orderNo)
          if (!first) {
            ElMessage.warning(noResultText)
            return
          }
          const firstId = ctx.getAlgoResultId(first)
          if (firstId) await loadDetailOnce(firstId)
          ElMessage.success(successText)
          return
        }

        if (status === 4) {
          patchAgainGeneratePlaceholder(orderNo, {
            status: 4,
            prompt: '生成失败',
            thumbUrl: '',
            url: '',
            originalUrl: '',
          })
          ctx.selectedThumbnail.value = 0
          ctx.previousThumbnailIndex.value = 0
          const top = ctx.relatedTemplates.value[0] as any
          if (top) ctx.templateDetail.value = { ...top }
          nextTick(() => ctx.syncMediaContainerToSelected(true))
          ElMessage.error(failText)
          return
        }
      } catch (error) {
        console.error('[pollAgainGenerateResult] query failed:', error)
      }
      await sleep(3000)
    }
    ElMessage.warning(timeoutText)
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
        const orderNo = String(target?.algoOrderId ?? target?.id ?? expectedId ?? '')
        startPollingGenerateResult(orderNo, {
          successText: '生成完成',
          failText: '生成失败',
          timeoutText: '生成超时，请稍后在“我的创作”中查看',
        })
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
          : data?.orderNo ?? data?.algoOrderNo ?? data?.algoOrderId ?? '') || '',
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
      const selectedItem = cachedListData.list[foundIndex]
      const processedList = cachedListData.list.map((item: any) => {
        if (!item.creativeTemplate) return item
        return {
          ...item.creativeTemplate,
          likeId: item.likeId || item.creativeTemplate?.likeId,
          useLikes: item.useLikes !== undefined ? item.useLikes : item.creativeTemplate?.useLikes,
          creativeTemplateId: item.creativeTemplateId || item.creativeTemplate?.id,
        }
      })

      ctx.selectedThumbnail.value = foundIndex
      ctx.templateDetail.value = processedList[foundIndex] as CreativeTemplate
      ctx.relatedTemplates.value = processedList as any[]

      await nextTick()
      if (ctx.mediaContainerRef.value && ctx.relatedTemplates.value.length > 0) {
        await new Promise((resolve) => window.requestAnimationFrame(resolve))
        const container = ctx.mediaContainerRef.value
        if (!container) return
        const itemHeight = container.clientHeight
        container.scrollTop = ctx.selectedThumbnail.value * itemHeight
      }

      ctx.isDataReady.value = true
      const detailId = selectedItem.creativeTemplateId || selectedItem.creativeTemplate?.id || selectedItem.id
      if (detailId) await loadTemplateDetail(detailId)
      return
    }

    await loadTemplateDetail(ctx.route.params.id as string | number | undefined)
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
      await loadTemplateDetail(targetAlgoResulId)
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
    pollAgainGenerateResult,
    startPollingGenerateResult,
    loadTemplateDetail,
    loadDetailOnce,
    initFromCachedList,
    initByLoadingListFirst,
    onMountedFlow,
    getOrderNoCandidate: (item: any) => String(item?.algoOrderId ?? item?.algoOrderNo ?? item?.id ?? '').trim(),
  }
}

