import { ElMessage } from 'element-plus'
import { algoApi } from '@/api/algo'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'

/**
 * 创作（算法结果）数据结构：只使用最新接口字段
 * - 统一用 thumbUrl/url/originalUrl/collectStatus/status/fileType
 * - 不兼容旧字段（imageUrl/fileUrl/noWatermarkUrl/collectId/isCollect 等）
 */
export interface CreationResult {
  /** 生成结果ID（后端：id） */
  id: string
  /** 用户ID（后端：userId） */
  userId?: string
  /** 团队用户ID（后端：userSonId） */
  userSonId?: string | null
  /** 生成订单ID（后端：algoOrderId） */
  algoOrderId: string
  /** 算法请求编号（后端：algoOrderNo） */
  algoOrderNo?: string
  /** 算法 uuid（后端：algoUuId，可能为 null） */
  algoUuId?: string | null
  /** 功能菜单 code（后端：menuCode） */
  menuCode?: string

  /** 缩略图（后端：thumbUrl） */
  thumbUrl?: string | null
  /** 资源链接（后端：url） */
  url?: string | null
  /** 无水印链接（后端：originalUrl） */
  originalUrl?: string | null
  /** 文件大小（后端：fileSize） */
  fileSize?: number
  /** 音视频时长（后端：duration） */
  duration?: number
  /** 收藏状态（后端：collectStatus 0未收藏 1已收藏） */
  collectStatus?: number | null

  /** 生成类型（后端：fileType 1图片 2视频 3音频 4音视频） */
  fileType: number
  /** 任务状态（后端：status 0初始化 1待请求 2处理中 3完成 4失败） */
  status: number

  /** 进度信息（后端可能返回） */
  progress?: number
  successfulCount?: number
  failedCount?: number

  /** 提示词（用于 UI 回显） */
  prompt: string

  /** 创建时间（用于 UI） */
  createTime: string

  /** 前端轮询专用字段（非后端字段） */
  queryType?: string
}

/**
 * 全局注册所有使用任务轮询的资产列表引用
 * 这样同一个 taskId 的进度更新可以同步到多个模块的资产列表中
 */
const assetsRefsRegistry = new Set<Ref<CreationResult[]>>()

const registerAssetsRef = (assetsRef: Ref<CreationResult[]>) => {
  assetsRefsRegistry.add(assetsRef)
}

/**
 * 全局轮询任务 Map，避免同一个 taskId 被重复轮询
 * key: taskId / taskUuid
 * value: 对应的 setInterval 句柄
 */
const pollingTaskMap = new Map<string, ReturnType<typeof setInterval>>()

/**
 * 任务轮询和结果查询 Composable
 * 处理API响应、任务轮询、资产状态更新等逻辑
 */
export function useTaskPolling(
  assets: Ref<CreationResult[]>,
  currentAssetIndex: Ref<number>,
  coinErrorType: Ref<string>,
  showCoinInsufficient: Ref<boolean>,
  creativeDescription: Ref<string>,
  onTaskFinished?: (resultList: any[]) => void
) {
  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)

  // 将当前模块的资产列表引用注册到全局，用于跨模块同步进度
  registerAssetsRef(assets)

  /**
   * 处理API响应
   */
  const handleApiResponse = async (res: any, errorContext = '提交', queryType = 'default') => {
    if (res.code === '0000') {
      ElMessage.success(`任务提交成功，生成中`)

      // 更新用户信息（刷新灵衍值等信息）
      if (userInfo.value?.phone) {
        try {
          await userStore.getUserInfo()
          console.log('用户信息已更新')
        } catch (error) {
          console.error('更新用户信息失败:', error)
        }
      }

      const taskId = res.data
      console.log('生成任务已提交，taskId:', taskId)

      // 立即添加生成中状态的占位卡片到资产列表
      addGeneratingAsset(taskId, errorContext, queryType)

      // 开始轮询查询生成结果
      startPollingTaskResult(taskId, errorContext, queryType)
    } else if (res.code === '0001') {
      // 处理灵衍值不足或需要升级VIP
      const errorType = res.msg
      if (errorType === 'coin_deficiency' || errorType === 'up_vip') {
        // 显示灵衍值不足弹窗
        coinErrorType.value = errorType
        showCoinInsufficient.value = true
      } else {
        ElMessage.error(res.msg || `${errorContext}失败`)
      }
    } else {
      ElMessage.error(res.msg || `${errorContext}失败`)
    }
  }

  /**
   * 添加生成中状态的资产到列表
   */
  const addGeneratingAsset = (taskId: string, _taskType: string, queryType: string) => {
    const now = new Date()
    const generatingAsset: CreationResult = {
      // 占位卡片：先用 taskId 作为结果 id，待 query 返回后用真实结果覆盖
      id: taskId,
      algoOrderId: taskId,
      algoUuId: null,
      menuCode: '',
      thumbUrl: null,
      url: null,
      originalUrl: null,
      collectStatus: 0,
      fileType: 1, // 默认图片
      prompt: creativeDescription.value || '生成中...',
      createTime: now.toISOString(),
      status: 2, // 2=处理中
      queryType: queryType, // 前端用于轮询
      progress: 0, // 初始进度
    }

    assets.value.unshift(generatingAsset)
    currentAssetIndex.value = 0
  }

  /**
   * 已完成任务集合，防止重复处理已完成的任务
   */
  const finishedTaskSet = new Set<string>()

  /**
   * 轮询查询任务结果
   */
  const startPollingTaskResult = (taskId: string, taskType: string, queryType: string) => {
    // 如果该任务已经在轮询中，则不再重复开启
    if (pollingTaskMap.has(taskId)) {
      console.log('[useTaskPolling] task 已在轮询中，跳过重复 start:', taskId, queryType)
      return
    }

    // 如果该任务已经完成，则不再开启轮询
    if (finishedTaskSet.has(taskId)) {
      console.log('[useTaskPolling] task 已完成，跳过重复 start:', taskId, queryType)
      return
    }

    // 最多轮询120次（10分钟）
    let pollCount = 0
    const maxPolls = 120

    const pollInterval = setInterval(async () => {
      // 如果任务已经完成，直接返回，不处理后续逻辑
      if (finishedTaskSet.has(taskId)) {
        clearInterval(pollInterval)
        pollingTaskMap.delete(taskId)
        return
      }

      pollCount++

      try {
        // 使用 algo/query 轮询算法生成状态（参数名：orderNo）
        const res = await algoApi.query({ orderNo: taskId })

        if (res.code === '0000' && res.data) {
          const { status, progress, successfulCount, failedCount } = res.data
          const orderResultVOS: any[] = Array.isArray(res.data?.orderResultVOS) ? res.data.orderResultVOS : []

          // 兼容：进度/数量可能只在 orderResultVOS 内返回
          const fallbackFirst = orderResultVOS[0] || {}
          const mergedProgress = progress ?? fallbackFirst.progress
          const mergedSuccessfulCount = successfulCount ?? fallbackFirst.successfulCount
          const mergedFailedCount = failedCount ?? fallbackFirst.failedCount

          // status 状态：1未开始 2进行中 3完成 4失败
          if (status === 3) {
            // 如果任务已经处理过，直接返回，避免重复处理
            if (finishedTaskSet.has(taskId)) {
              return
            }

            // 标记任务已完成，防止重复处理
            finishedTaskSet.add(taskId)

            // 3=完成，生成成功
            clearInterval(pollInterval)
            pollingTaskMap.delete(taskId)

            if (orderResultVOS && orderResultVOS.length > 0) {
              // 更新资产为生成完成状态
              updateAssetWithResult(taskId, res.data, taskType)
              ElMessage.success(`生成完成！`)

              // 生成成功后更新用户信息（刷新灵衍值等信息）
              if (userInfo.value?.phone) {
                try {
                  await userStore.getUserInfo()
                  console.log('生成成功，用户信息已更新')
                } catch (error) {
                  console.error('更新用户信息失败:', error)
                }
              }

              onTaskFinished?.(orderResultVOS)
            } else {
              // 状态为3但resultList为空，视为生成失败
              updateAssetWithError(taskId, '生成完成但未返回结果')
              ElMessage.warning('生成完成但未返回结果')
            }

            // 处理完成后直接返回，避免继续执行后续逻辑
            return
          } else if (status === 4) {
            // 4=失败，生成失败
            clearInterval(pollInterval)
            pollingTaskMap.delete(taskId)
            updateAssetWithError(taskId, '生成过程中出现错误')
            ElMessage.error(`生成失败：生成过程中出现错误`)
          } else if (status === 1) {
            // 1=未开始，排队中
            console.log(`任务排队中，taskId: ${taskId}`)
          } else if (status === 2) {
            // 2=进行中，生成中 - 更新进度信息，仅使用 progress
            updateAssetProgress(taskId, {
              progress: mergedProgress,
              successfulCount: mergedSuccessfulCount,
              failedCount: mergedFailedCount,
            })
            console.log(`任务生成中，taskId: ${taskId}，进度: ${mergedProgress || 0}%`)
          }
        } else if (res.code === '0001') {
          // API返回错误也视为生成失败
          clearInterval(pollInterval)
          pollingTaskMap.delete(taskId)
          updateAssetWithError(taskId, res.msg || '服务器响应异常')
          ElMessage.error(`生成失败：${res.msg || '服务器响应异常'}`)
        }

        // 轮询超时检查（在所有情况外检查）
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval)
          pollingTaskMap.delete(taskId)
          updateAssetWithError(taskId, '生成超时')
          ElMessage.warning(`生成超时，请稍后在"我的创作"中查看`)
        }
      } catch (error) {
        console.error('查询任务结果失败:', error)
        // 网络异常也停止轮询并标记失败
        clearInterval(pollInterval)
        pollingTaskMap.delete(taskId)
        updateAssetWithError(taskId, '网络异常，查询失败')
        ElMessage.error('网络异常，查询结果失败')
      }
    }, 5000) // 每5秒轮询一次

    // 记录当前任务的轮询句柄，用于去重和后续可能的主动停止
    pollingTaskMap.set(taskId, pollInterval)
  }

  /**
   * 主动停止指定 task 的轮询（切页/销毁组件时非常重要）
   */
  const stopPollingTask = (taskId: string) => {
    const handle = pollingTaskMap.get(taskId)
    if (handle) {
      clearInterval(handle)
      pollingTaskMap.delete(taskId)
      console.log('[useTaskPolling] stopPollingTask:', taskId)
    }
  }

  /**
   * 停止所有任务轮询（页面离开/组件卸载时调用，防止 interval 堆积导致卡死/崩溃）
   */
  const stopAllPolling = () => {
    if (pollingTaskMap.size === 0) return
    console.warn('[useTaskPolling] stopAllPolling, count:', pollingTaskMap.size)
    pollingTaskMap.forEach((handle, taskId) => {
      clearInterval(handle)
      pollingTaskMap.delete(taskId)
    })
  }

  /**
   * 在指定资产列表中更新某个任务的完成状态
   * 抽成一个工具函数，方便在多个模块的 assets 列表上复用
   * 对于跨模块同步，只更新第一个结果，不添加额外的资产
   */
  const updateAssetWithResultInAssets = (
    targetAssets: Ref<CreationResult[]>,
    taskId: string,
    resultList: any[]
  ) => {
    // 占位卡片阶段：id/algoOrderId 可能都等于 taskId
    const assetIndex = targetAssets.value.findIndex(
      (asset: CreationResult) => asset.algoOrderId === taskId || asset.id === taskId || asset.algoUuId === taskId
    )
    if (assetIndex !== -1 && resultList.length > 0) {
      // 只更新第一个结果（跨模块同步时不添加额外资产）
      const item = resultList[0]
      targetAssets.value[assetIndex] = {
        ...targetAssets.value[assetIndex],
        ...item,
        algoOrderId: String(item.algoOrderId ?? item.algoOrderID ?? item.taskId ?? taskId),
        algoUuId: (item.algoUuId ?? item.taskUuid ?? null) as any,
        queryType: targetAssets.value[assetIndex].queryType, // 保留前端轮询字段
      }
    }
  }

  /**
   * 更新资产为生成成功状态
   * 将占位卡片更新为实际生成的图片/视频
   * 同时应用到所有已注册的模块资产列表中，实现跨模块完成状态同步
   */
  const updateAssetWithResult = (taskId: string, resultData: any, _taskType: string) => {
    console.log('更新资产结果，taskId:', taskId, 'resultData:', resultData)

    // 处理返回的数据结构，可能包含 resultList 数组
    let resultList: any[] = []

    if (Array.isArray(resultData?.resultList)) {
      resultList = resultData.resultList
    } else if (Array.isArray(resultData?.orderResultVOS)) {
      // algo/query：返回 orderResultVOS
      resultList = resultData.orderResultVOS
    } else if (resultData) {
      resultList = [resultData]
    }

    console.log('处理后的 resultList:', resultList)

    // 找到对应的占位资产（同时支持 taskId 和 taskUuid 匹配）
    const assetIndex = assets.value.findIndex(
      (asset: CreationResult) => asset.algoOrderId === taskId || asset.id === taskId || asset.algoUuId === taskId
    )
    console.log('找到的占位资产索引:', assetIndex)

    if (assetIndex !== -1 && resultList.length > 0) {
      const originAsset = assets.value[assetIndex]

      // 如果是 algo/query 的 orderResultVO 结构，则映射成页面 Asset 需要的字段
      const isAlgoOrderVO = (v: any) => {
        return v && (v.thumbUrl || v.url || v.originalUrl || typeof v.fileType === 'number' || v.algoOrderId)
      }

      let mappedList: CreationResult[] = resultList as any
      if (isAlgoOrderVO(resultList[0])) {
        mappedList = resultList.map((vo: any, idx: number): CreationResult => {
          return {
            ...originAsset,
            // latest fields
            id: String(vo?.id ?? `${taskId}-${idx}`), // 结果ID
            userId: vo?.userId != null ? String(vo.userId) : undefined,
            userSonId: vo?.userSonId != null ? String(vo.userSonId) : null,
            algoOrderId: String(vo?.algoOrderId ?? taskId), // 算法订单ID
            algoOrderNo: vo?.algoOrderNo != null ? String(vo.algoOrderNo) : undefined,
            algoUuId: (vo?.algoUuId ?? null) as any, // 算法返回uuid
            menuCode: String(vo?.menuCode ?? ''),

            // 后端：fileType 1图片 2视频 3音频 4音视频
            fileType: Number(vo?.fileType ?? 1),

            thumbUrl: vo?.thumbUrl ?? null,
            url: vo?.url ?? null,
            originalUrl: vo?.originalUrl ?? null,

            fileSize: vo?.fileSize !== undefined && vo?.fileSize !== null ? Number(vo.fileSize) : undefined,
            duration: vo?.duration !== undefined && vo?.duration !== null ? Number(vo.duration) : undefined,
            collectStatus: Number(vo?.collectStatus ?? 0),

            // 后端：status 0初始化 1待请求 2处理中 3完成 4失败
            status: Number(vo?.status ?? 3),

            progress: vo?.progress !== undefined && vo?.progress !== null ? Number(vo?.progress) : 0,
            successfulCount: vo?.successfulCount !== undefined && vo?.successfulCount !== null ? Number(vo?.successfulCount) : 0,
            failedCount: vo?.failedCount !== undefined && vo?.failedCount !== null ? Number(vo?.failedCount) : 0,
          }
        })
      }

      // 在原始模块中执行完整逻辑（包括处理多个结果、添加新资产等）
      if (mappedList.length === 1) {
        // 如果只有一个结果，更新占位卡片
        const item = mappedList[0]
        console.log('更新单个结果 - item:', item)
        assets.value[assetIndex] = {
          ...originAsset,
          ...item,
          id: String(item.id || originAsset.id || taskId),
          algoOrderId: String(item.algoOrderId || originAsset.algoOrderId || taskId),
          algoUuId: (item.algoUuId ?? originAsset.algoUuId ?? null) as any,
          queryType: originAsset.queryType, // 保留前端轮询字段
        }
      } else {
        // 如果有多个结果，更新第一个占位卡片，其余的添加到列表
        console.log('处理多个结果，数量:', mappedList.length)
        // 先更新第一个占位卡片
        const firstItem = mappedList[0]
        console.log('更新第一个占位卡片 - item:', firstItem)
        assets.value[assetIndex] = {
          ...originAsset,
          ...firstItem,
          id: String(firstItem.id || `${taskId}-0`), // 确保 id 唯一
          algoOrderId: String(firstItem.algoOrderId || taskId),
          algoUuId: (firstItem.algoUuId ?? null) as any,
          queryType: originAsset.queryType, // 保留前端轮询字段
        }
        // 然后从第二个开始，依次插入到第一个后面
        for (let i = 1; i < mappedList.length; i++) {
          const item = mappedList[i]
          console.log('添加额外结果，index:', i, 'item:', item)
          const newAsset: CreationResult = {
            ...originAsset,
            ...item,
            id: String(item.id || `${taskId}-${i}`), // 确保 id 唯一
            algoOrderId: String(item.algoOrderId || taskId),
            algoUuId: (item.algoUuId ?? null) as any,
            queryType: originAsset.queryType,
          }
          // 插入到第一个资产后面，每次插入后位置会递增
          assets.value.splice(assetIndex + i, 0, newAsset)
        }
      }

      // 自动切换到第一个生成的资产（只在原始模块中执行）
      currentAssetIndex.value = assetIndex
      console.log('资产更新完成，当前索引:', assetIndex)

      // 跨模块同步：在其它所有模块中更新完成状态（只更新第一个结果，不添加额外资产）
      assetsRefsRegistry.forEach((assetsRef) => {
        // 跳过原始模块（已经处理过了）
        if (assetsRef !== assets) {
          updateAssetWithResultInAssets(assetsRef, taskId, mappedList)
        }
      })
    } else {
      console.warn('未找到对应的占位资产或结果列表为空')
    }
  }

  /**
   * 在指定资产列表中更新某个任务的错误状态
   * 抽成一个工具函数，方便在多个模块的 assets 列表上复用
   */
  const updateAssetWithErrorInAssets = (
    targetAssets: Ref<CreationResult[]>,
    taskId: string,
    errorMsg: string
  ) => {
    const assetIndex = targetAssets.value.findIndex(
      (asset: CreationResult) => asset.algoOrderId === taskId || asset.id === taskId || asset.algoUuId === taskId
    )
    if (assetIndex !== -1) {
      targetAssets.value[assetIndex] = {
        ...targetAssets.value[assetIndex],
        status: 4, // 4=失败
        prompt: `生成失败：${errorMsg}`, // 更新提示词显示错误信息
      }
    }
  }

  /**
   * 更新资产为生成失败状态
   * 同时应用到所有已注册的模块资产列表中，实现跨模块错误状态同步
   */
  const updateAssetWithError = (taskId: string, errorMsg: string) => {
    assetsRefsRegistry.forEach((assetsRef) => {
      updateAssetWithErrorInAssets(assetsRef, taskId, errorMsg)
    })
  }

  /**
   * 在指定资产列表中更新某个任务的进度信息
   * 抽成一个工具函数，方便在多个模块的 assets 列表上复用
   */
  const updateAssetProgressInAssets = (
    targetAssets: Ref<CreationResult[]>,
    taskId: string,
    progressData: {
      progress?: number
      successfulCount?: number
      failedCount?: number
    }
  ) => {
    const assetIndex = targetAssets.value.findIndex(
      (asset: CreationResult) => asset.algoOrderId === taskId || asset.id === taskId || asset.algoUuId === taskId
    )
    if (assetIndex !== -1) {
      const currentAsset = targetAssets.value[assetIndex]
      const currentProgress = currentAsset.progress ?? 0
      const incomingProgress = progressData.progress ?? 0

      // 确保进度只增不减：使用 Math.max 取较大值
      const newProgress = Math.max(currentProgress, incomingProgress)

      targetAssets.value[assetIndex] = {
        ...currentAsset,
        progress: newProgress,
        successfulCount: progressData.successfulCount ?? currentAsset.successfulCount,
        failedCount: progressData.failedCount ?? currentAsset.failedCount,
      }
    }
  }

  /**
   * 更新资产进度信息（生成中状态）
   * 确保进度只增不减，直接使用接口返回的 progress 值
   * 同时应用到所有已注册的模块资产列表中，实现跨模块进度同步
   */
  const updateAssetProgress = (
    taskId: string,
    progressData: {
      progress?: number
      successfulCount?: number
      failedCount?: number
    }
  ) => {
    assetsRefsRegistry.forEach((assetsRef) => {
      updateAssetProgressInAssets(assetsRef, taskId, progressData)
    })
  }

  /**
   * 从资产记录列表中恢复进行中任务的轮询（用于页面刷新后自动恢复）
   * 只对 status 为 1/2 且有 type 的任务调用 startPollingTaskResult
   */
  const recoverTasksFromRecords = (records: CreationResult[] = []) => {
    records.forEach((item) => {
      const taskId = String(item.algoOrderId || item.id || '')
      if (!taskId) return

      // 仅对未开始/进行中的任务恢复轮询
      if (item.status === 1 || item.status === 2) {
        // queryType 是前端字段：若不存在则使用 default，不阻断恢复
        startPollingTaskResult(taskId, '任务恢复', item.queryType || 'default')
      }
    })
  }

  return {
    handleApiResponse,
    addGeneratingAsset,
    startPollingTaskResult,
    stopPollingTask,
    stopAllPolling,
    updateAssetWithResult,
    updateAssetWithError,
    recoverTasksFromRecords,
  }
}
