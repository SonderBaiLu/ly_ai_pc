/**
 * 任务类型到 queryType 的映射（最小实现）
 * 说明：当前项目仅用于轮询/查询类型兜底，不影响页面渲染。
 */
export function getQueryTypeByTaskType(_taskType?: string | number) {
  // 参考项目里通常会按 taskType 映射不同 queryType；这里先返回 default
  return 'default'
}

