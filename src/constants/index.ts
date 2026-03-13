export const COLLECT_TYPE = {
  /** 默认：模特姿势/模特生成类收藏（项目里 ImageItem 默认用这个） */
  MODEL_POSE: 1,
  /** 预留：服装设计收藏 */
  FASHION: 2,
  /** 预留：面料创拍收藏 */
  FABRIC: 3,
} as const

export type CollectTypeValue = (typeof COLLECT_TYPE)[keyof typeof COLLECT_TYPE]

export * from './taskType'
