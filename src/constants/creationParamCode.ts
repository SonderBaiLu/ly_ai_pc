/**
 * 创作类型 / 参数字典 code（用于接口提交或获取字典项）
 * 说明：后端约定的 code，请勿随意改动。
 */
export const CREATION_PARAM_CODES = {
  /** 创作款型（AI服装设计-创作款型） */
  CREATION_STYLE: 'creation_style',
  /** 设计特征（AI服装设计-设计特征） */
  DESIGN_FEATURES: 'design_features',
  /** 灵感词词典 */
  INSPIRATION_WORDS: 'inspiration_words',
  /** 线稿转实物-线稿类型 */
  SKETCH_TYPE: 'sketch_type',
  /** 线稿转实物-线稿风格 */
  SKETCH_STYLE: 'sketch_style',
  /** 线稿转实物-图片类型 */
  IMAGE_TYPE: 'image_type',
  /** 实物转线稿-款型 */
  GARMENT_STYLE: 'garment_style',
  /** 实物转线稿-线稿生成类型 */
  SKETCH_GENERATION_TYPE: 'sketch_generation_type',
  /** 实物转线稿-线稿生成风格 */
  SKETCH_GENERATION_STYLE: 'sketch_generation_style',
  /** 面料创款-图片类型 */
  FABRIC_IMAGE_TYPE: 'fabric_image_type',
} as const

export type CreationParamCode = (typeof CREATION_PARAM_CODES)[keyof typeof CREATION_PARAM_CODES]

