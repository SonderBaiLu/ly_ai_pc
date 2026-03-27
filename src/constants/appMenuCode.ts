/**
 * APP 功能菜单 code（后端约定）
 */
export const APP_MENU_CODES = {
  /** AI服装设计 */
  AI_FASHION_DESIGN: 'ai_fashion_design',
  /** 线稿转实物 */
  LINE_DRAW_TO_PHYS_OBJ: 'line_draw_to_phys_obj',
  /** 实物转线稿 */
  PHYS_OBJ_TO_LINE_DRAW: 'phys_obj_to_line_draw',
  /** 面料创款 */
  FABRIC_DESIGN_CONCEPT: 'fabric_design_concept',
} as const

export type AppMenuCode = (typeof APP_MENU_CODES)[keyof typeof APP_MENU_CODES]

