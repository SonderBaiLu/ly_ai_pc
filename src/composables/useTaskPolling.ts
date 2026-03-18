import { ElMessage } from 'element-plus'
import { creativeApi } from '@/api/creative'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { getQueryTypeByTaskType } from '@/constants/taskType'

/**
 * 资产接口（直接使用后端返回的字段）
 */
export interface Asset {
  id: string // 资产ID
  taskId: string // 任务ID
  taskUuid: string // 任务UUID
  imageUrl: string // 图片URL或视频封面
  fileUrl?: string // 视频URL（如果是视频）
  fileType: number // 文件类型：1=图片, 2=视频
  prompt: string // 提示词
  model?: string // 模型名称
  size?: string // 尺寸
  count?: number // 生成数量
  scenario?: string // 场景
  baseImageUrl?: string // 原始图片
  createTime: string // 创建时间
  updateTime?: string // 更新时间
  status: number // 状态：1未开始 2进行中 3完成 4失败
  type?: number // 类型
  isDel?: number | null // 是否删除
  collectId?: string | null // 收藏ID，null表示未收藏
  queryType?: string // 查询类型（前端用于轮询，非后端字段）
  progress?: number // 生成进度（0-100，直接使用接口 progress）
  successfulCount?: number // 成功数量
  failedCount?: number // 失败数量
  noWatermarkUrl?: string | null // 无水印URL（图片和视频都使用此字段）
}

/**
 * 全局注册所有使用任务轮询的资产列表引用
 * 这样同一个 taskId 的进度更新可以同步到多个模块的资产列表中
 */
const assetsRefsRegistry = new Set<Ref<Asset[]>>()

const registerAssetsRef = (assetsRef: Ref<Asset[]>) => {
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
  assets: Ref<Asset[]>,
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

      // 更新用户信息（刷新潮币等信息）
      if (userInfo.value?.phone) {
        try {
          await userStore.getUserInfo(userInfo.value.phone)
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
      // 处理潮币不足或需要升级VIP
      const errorType = res.msg
      if (errorType === 'coin_deficiency' || errorType === 'up_vip') {
        // 显示潮币不足弹窗
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
    const generatingAsset: Asset = {
      id: taskId,
      taskId: taskId,
      taskUuid: taskId,
      imageUrl: '',
      fileUrl: '',
      fileType: 1, // 默认图片
      prompt: creativeDescription.value || '生成中...',
      createTime: now.toISOString(),
      status: 2, // 2=进行中
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
        // 获取用户ID（转换为字符串）
        const userId = String(userInfo.value?.userId || '')

        // 统一使用算法结果查询接口
        const res = await creativeApi.findAlgorithmResult({ userId, taskUuid: taskId })

        if (res.code === '0000' && res.data) {
          const { status, resultList, progress, successfulCount, failedCount } = res.data

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

            if (resultList && resultList.length > 0) {
              // 更新资产为生成完成状态
              updateAssetWithResult(taskId, res.data, taskType)
              ElMessage.success(`生成完成！`)

              // 生成成功后更新用户信息（刷新潮币等信息）
              if (userInfo.value?.phone) {
                try {
                  await userStore.getUserInfo(userInfo.value.phone)
                  console.log('生成成功，用户信息已更新')
                } catch (error) {
                  console.error('更新用户信息失败:', error)
                }
              }

              onTaskFinished?.(resultList)
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
              progress,
              successfulCount,
              failedCount,
            })
            console.log(`任务生成中，taskId: ${taskId}，进度: ${progress || 0}%`)
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
          ElMessage.warning(`生成超时，请稍后在"我的资产"中查看`)
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
    targetAssets: Ref<Asset[]>,
    taskId: string,
    resultList: any[]
  ) => {
    // 同时支持 taskId 和 taskUuid 匹配（因为后端返回的资产可能使用 taskUuid）
    const assetIndex = targetAssets.value.findIndex(
      (asset: Asset) => asset.taskId === taskId || asset.taskUuid === taskId
    )
    if (assetIndex !== -1 && resultList.length > 0) {
      // 只更新第一个结果（跨模块同步时不添加额外资产）
      const item = resultList[0]
      targetAssets.value[assetIndex] = {
        ...item,
        taskId: item.taskId || taskId,
        taskUuid: item.taskUuid || taskId,
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

    if (resultData.resultList && Array.isArray(resultData.resultList)) {
      // 如果返回的是包含 resultList 的对象
      resultList = resultData.resultList
    } else {
      // 如果直接返回的是单个结果对象
      resultList = [resultData]
    }

    console.log('处理后的 resultList:', resultList)

    // 找到对应的占位资产（同时支持 taskId 和 taskUuid 匹配）
    const assetIndex = assets.value.findIndex(
      (asset: Asset) => asset.taskId === taskId || asset.taskUuid === taskId
    )
    console.log('找到的占位资产索引:', assetIndex)

    if (assetIndex !== -1 && resultList.length > 0) {
      // 在原始模块中执行完整逻辑（包括处理多个结果、添加新资产等）
      if (resultList.length === 1) {
        // 如果只有一个结果，更新占位卡片
        const item = resultList[0]
        console.log('更新单个结果 - item:', item)
        assets.value[assetIndex] = {
          ...item,
          taskId: item.taskId || taskId,
          taskUuid: item.taskUuid || taskId,
          queryType: assets.value[assetIndex].queryType, // 保留前端轮询字段
        }
      } else {
        // 如果有多个结果，更新第一个占位卡片，其余的添加到列表
        console.log('处理多个结果，数量:', resultList.length)
        // 先更新第一个占位卡片
        const firstItem = resultList[0]
        console.log('更新第一个占位卡片 - item:', firstItem)
            assets.value[assetIndex] = {
          ...firstItem,
          id: firstItem.id || `${taskId}-0`, // 确保 id 唯一
          taskId: firstItem.taskId || taskId,
          taskUuid: firstItem.taskUuid || taskId,
              queryType: assets.value[assetIndex].queryType, // 保留前端轮询字段
            }
        // 然后从第二个开始，依次插入到第一个后面
        for (let i = 1; i < resultList.length; i++) {
          const item = resultList[i]
          console.log('添加额外结果，index:', i, 'item:', item)
            const newAsset: Asset = {
              ...item,
            id: item.id || `${taskId}-${i}`, // 确保 id 唯一
              taskId: item.taskId || taskId,
              taskUuid: item.taskUuid || taskId,
            }
          // 插入到第一个资产后面，每次插入后位置会递增
          assets.value.splice(assetIndex + i, 0, newAsset)
          }
      }

      // 自动切换到第一个生成的资产（只在原始模块中执行）
      currentAssetIndex.value = assetIndex
      console.log('资产更新完成，当前索引:', assetIndex)
    } else {
      console.warn('未找到对应的占位资产或结果列表为空')
    }

    // 跨模块同步：在其他所有模块中更新完成状态（只更新第一个结果，不添加额外资产）
    assetsRefsRegistry.forEach((assetsRef) => {
      // 跳过原始模块（已经处理过了）
      if (assetsRef !== assets) {
        updateAssetWithResultInAssets(assetsRef, taskId, resultList)
      }
    })
  }

  /**
   * 在指定资产列表中更新某个任务的错误状态
   * 抽成一个工具函数，方便在多个模块的 assets 列表上复用
   */
  const updateAssetWithErrorInAssets = (
    targetAssets: Ref<Asset[]>,
    taskId: string,
    errorMsg: string
  ) => {
    // 同时支持 taskId 和 taskUuid 匹配（因为后端返回的资产可能使用 taskUuid）
    const assetIndex = targetAssets.value.findIndex(
      (asset: Asset) => asset.taskId === taskId || asset.taskUuid === taskId
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
    targetAssets: Ref<Asset[]>,
    taskId: string,
    progressData: {
      progress?: number
      successfulCount?: number
      failedCount?: number
    }
  ) => {
    // 同时支持 taskId 和 taskUuid 匹配（因为后端返回的资产可能使用 taskUuid）
    const assetIndex = targetAssets.value.findIndex(
      (asset: Asset) => asset.taskId === taskId || asset.taskUuid === taskId
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
  const recoverTasksFromRecords = (records: Asset[] = []) => {
    records.forEach((item) => {
      const taskId = (item.taskUuid as string) || (item.taskId as string)
      if (!taskId || !item.type) return

      // 仅对未开始/进行中的任务恢复轮询
      if (item.status === 1 || item.status === 2) {
        const queryType = getQueryTypeByTaskType(item.type)
        if (!queryType) return

        // startPollingTaskResult 内部已做去重判断，这里直接调用即可
        startPollingTaskResult(taskId, '任务恢复', queryType)
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
