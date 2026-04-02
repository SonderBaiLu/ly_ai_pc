/**
 * 创作类型 / 参数字典 code（用于接口提交或获取字典项）
 * 说明：后端约定的 code，请勿随意改动。
 */
export const CREATION_PARAM_CODES = {
  /** 创作款型（AI服装设计-创作款型） */
  CREATION_STYLE: 'creation_style',
  /** 设计特征（AI服装设计-设计特征） */
  DESIGN_FEATURES: 'design_features',
  /** 灵感词词典（各模块与对应 functionCode 联用，如实物转线稿 + phys_obj_to_line_draw） */
  INSPIRATION_WORDS: 'inspiration_words',
  /** 线稿转实物-线稿类型 */
  SKETCH_TYPE: 'sketch_type',
  /** 线稿转实物-线稿风格 */
  SKETCH_STYLE: 'sketch_style',
  /** 线稿转实物-图片类型 */
  IMAGE_TYPE: 'image_type',
  /** 实物转线稿-创作款型（款型弹窗树，与 functionCode=phys_obj_to_line_draw 联用） */
  GARMENT_STYLE: 'garment_style',
  /**
   * 实物转线稿-页面配置：左侧分段（线稿生成类型/风格等）用 getInspirationWords 的 typeCode=sketch_generation_type 拉取（与线稿转实物 sketch_type 用法一致）
   */
  SKETCH_GENERATION_TYPE: 'sketch_generation_type',
  /** 实物转线稿-线稿生成风格（分类节点 code，可与 type 同批或单独配置） */
  SKETCH_GENERATION_STYLE: 'sketch_generation_style',
  /** 面料创款-图片类型 */
  FABRIC_IMAGE_TYPE: 'fabric_image_type',
} as const

export type CreationParamCode = (typeof CREATION_PARAM_CODES)[keyof typeof CREATION_PARAM_CODES]

/**
 * 参数字典 code 对应说明（与后端枚举保持一致）
 */
export const CREATION_PARAM_LABELS: Record<CreationParamCode, string> = {
  [CREATION_PARAM_CODES.CREATION_STYLE]: 'AI服装设计-创作款型',
  [CREATION_PARAM_CODES.DESIGN_FEATURES]: 'AI服装设计-设计特征',
  [CREATION_PARAM_CODES.INSPIRATION_WORDS]: '灵感词词典',
  [CREATION_PARAM_CODES.SKETCH_TYPE]: '线稿转实物-线稿类型',
  [CREATION_PARAM_CODES.SKETCH_STYLE]: '线稿转实物-线稿风格',
  [CREATION_PARAM_CODES.IMAGE_TYPE]: '线稿转实物-图片类型',
  [CREATION_PARAM_CODES.GARMENT_STYLE]: '实物转线稿-创作款型',
  [CREATION_PARAM_CODES.SKETCH_GENERATION_TYPE]: '实物转线稿-页面配置（线稿生成类型等）',
  [CREATION_PARAM_CODES.SKETCH_GENERATION_STYLE]: '实物转线稿-线稿生成风格',
  [CREATION_PARAM_CODES.FABRIC_IMAGE_TYPE]: '面料创款-图片类型',
}
