type MergeOptions<T> = {
  /** 找到对应项时是否原地回填（不改变顺序） */
  preferInPlace?: boolean
  /** 找不到对应项时插入位置 */
  insertAtIfNotFound?: (list: T[]) => number
}

const normalize = (v: any) => String(v ?? '').trim()

/**
 * 将 /algo/query 返回的 orderResultVOS（已映射为“有 id 的结果项”）合并回列表：
 * - key：只认 algoOrderNo（同时允许旧字段 algoOrderId / pending-${orderNo} 用于定位占位）
 * - 找到占位：默认原地替换 + extras 插在后面
 * - 清理：同 orderNo 的其它“生成中/占位”记录全部移除，避免生成成功后残留空缩略图
 * - 去重：按 id 去重
 */
export function mergeOrderResultsIntoList<T extends Record<string, any>>(
  listRaw: T[],
  orderNoRaw: string,
  resultsRaw: T[],
  options?: MergeOptions<T>,
): { list: T[]; replacedIndex: number } {
  const list = Array.isArray(listRaw) ? [...listRaw] : []
  const orderNo = normalize(orderNoRaw)
  const results = (Array.isArray(resultsRaw) ? resultsRaw : [])
    .map((x) => x as T)
    .filter((x) => !!normalize((x as any)?.id))

  if (!orderNo || results.length === 0) return { list, replacedIndex: -1 }

  const isGeneratingLike = (x: any) => {
    const st = Number(x?.status)
    return st === 0 || st === 1 || st === 2
  }

  const isSameOrderNo = (x: any) => {
    const id = normalize(x?.id)
    return (
      normalize(x?.algoOrderNo) === orderNo ||
      normalize(x?.algoOrderId) === orderNo ||
      id === `pending-${orderNo}`
    )
  }

  // 1) 定位“生成中/占位”记录（优先用它做原地替换）
  let targetIdx = list.findIndex((x) => isSameOrderNo(x) && isGeneratingLike(x))
  // 兜底：有些场景会先把占位状态更新为 3，但仍然是“无 id 的占位项”
  // 这时也应该复用这条，而不是再插入一条新结果，避免出现“多一条没用数据”。
  if (targetIdx < 0) {
    targetIdx = list.findIndex((x) => isSameOrderNo(x) && !normalize((x as any)?.id))
  }

  // 2) 清理同订单号的其它占位（无 id）/生成中（status=0/1/2），只保留 targetIdx 那条
  // 说明：同订单成功后只应保留“有 id 的正式结果”，其它占位必须收敛掉。
  if (targetIdx >= 0) {
    const kept = list[targetIdx]
    const filtered = list.filter((x, i) => {
      if (i === targetIdx) return true
      const noId = !normalize((x as any)?.id)
      return !(isSameOrderNo(x) && (isGeneratingLike(x) || noId))
    })
    // 重新定位（filter 后 index 可能变化）
    targetIdx = filtered.findIndex((x) => x === kept)
    filtered[targetIdx] = kept
    // 使用过滤后的列表继续操作
    list.splice(0, list.length, ...filtered)
  }

  // 3) 去掉可能已存在的同 id（避免重复）
  const idsToRemove = new Set(results.map((r) => normalize((r as any).id)).filter(Boolean))
  for (let i = list.length - 1; i >= 0; i--) {
    const id = normalize((list[i] as any)?.id)
    if (id && idsToRemove.has(id)) list.splice(i, 1)
  }

  const first = results[0]
  const extras = results.slice(1)

  const preferInPlace = options?.preferInPlace !== false
  if (preferInPlace && targetIdx >= 0) {
    const old = list[targetIdx] as any
    list[targetIdx] = { ...old, ...first, status: 3, progress: 100 } as any
    if (extras.length) list.splice(targetIdx + 1, 0, ...extras)
    return { list: dedupeById(list), replacedIndex: targetIdx }
  }

  // 找不到对应项：按调用方策略插入
  const insertAt = options?.insertAtIfNotFound ? options.insertAtIfNotFound(list) : 0
  list.splice(Math.max(0, Math.min(insertAt, list.length)), 0, first, ...extras)
  return { list: dedupeById(list), replacedIndex: insertAt }
}

const dedupeById = <T extends Record<string, any>>(arr: T[]) => {
  const seenById = new Set<string>()
  const seenByOrderNo = new Set<string>()
  const out: T[] = []
  for (const item of arr) {
    const id = normalize((item as any)?.id)
    if (id) {
      if (seenById.has(id)) continue
      seenById.add(id)
      out.push(item)
      continue
    }

    // pending/生成中占位通常没有 id，不能在这里直接丢弃；
    // 否则并发多任务时，某个任务完成回填会把其它任务的占位吞掉。
    const orderNo = normalize((item as any)?.algoOrderNo) || normalize((item as any)?.algoOrderId)
    if (orderNo) {
      const k = `order:${orderNo}`
      if (seenByOrderNo.has(k)) continue
      seenByOrderNo.add(k)
    }
    out.push(item)
  }
  return out
}

