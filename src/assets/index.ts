/**
 * 图片资源统一管理
 */

// 所有图片统一导出（按字母顺序排列，方便查找）
export const images = {
  // ===== 已存在资源 =====
  // A
  add: new URL('./images/add.png', import.meta.url).href,
  aiDesign1: new URL('./images/ai_design1.png', import.meta.url).href,
  aiDesign2: new URL('./images/ai_design2.png', import.meta.url).href,
  aiDesign3: new URL('./images/ai_design3.png', import.meta.url).href,
  aiDesign4: new URL('./images/ai_design4.png', import.meta.url).href,
  aiDesignBg: new URL('./images/ai_design_bg.png', import.meta.url).href,
  arrow: new URL('./images/arrow.png', import.meta.url).href,
  arrowIcon: new URL('./images/arrow_icon.png', import.meta.url).href,
  avatar: new URL('./images/avatar.png', import.meta.url).href,
  avatarDefault: new URL('./images/avatar_default.png', import.meta.url).href,
  againEdit: new URL('./images/again_edit.png', import.meta.url).href,
  againGenerate: new URL('./images/again_generate.png', import.meta.url).href,
  aboutBg: new URL('./images/about_bg.png', import.meta.url).href,

  // C
  channel: new URL('./images/channel.png', import.meta.url).href,
  choose: new URL('./images/choose.png', import.meta.url).href,
  chosseNo: new URL('./images/choose_no.png', import.meta.url).href,
  close: new URL('./images/close.png', import.meta.url).href,
  closeCustomer: new URL('./images/close_customer.png', import.meta.url).href,
  closeDialog: new URL('./images/close_dialog.png', import.meta.url).href,
  coin: new URL('./images/coin.png', import.meta.url).href,
  comma: new URL('./images/comma.png', import.meta.url).href,
  checkedActive: new URL('./images/checked_active.png', import.meta.url).href,
  checkedNo: new URL('./images/checked_no.png', import.meta.url).href,
  clear: new URL('./images/clear.png', import.meta.url).href,
  certification: new URL('./images/certification.png', import.meta.url).href,

  // D
  designActive: new URL('./images/design_active.png', import.meta.url).href,
  designIcon: new URL('./images/design_icon.png', import.meta.url).href,
  douyin: new URL('./images/douyin.png', import.meta.url).href,
  down: new URL('./images/down.png', import.meta.url).href,
  edit: new URL('./images/edit.png', import.meta.url).href,
  del: new URL('./images/del.png', import.meta.url).href,
  download: new URL('./images/download.png', import.meta.url).href,

  design1: new URL('./images/home/design1.png', import.meta.url).href,
  design2: new URL('./images/home/design2.png', import.meta.url).href,
  design3: new URL('./images/home/design3.png', import.meta.url).href,
  design4: new URL('./images/home/design4.png', import.meta.url).href,

  // E
  editWhite: new URL('./images/edit_white.png', import.meta.url).href,

  // F
  fabricActive: new URL('./images/fabric_active.png', import.meta.url).href,
  failFace: new URL('./images/fail_face.png', import.meta.url).href,
  favorite: new URL('./images/favorite.png', import.meta.url).href,

  // H
  homeBg: new URL('./images/home_bg.png', import.meta.url).href,
  handshake: new URL('./images/handshake.png', import.meta.url).href,

  // L
  language: new URL('./images/language.png', import.meta.url).href,
  logo: new URL('./images/logo.png', import.meta.url).href,
  logo2: new URL('./images/logo2.png', import.meta.url).href,

  // M
  more: new URL('./images/more.png', import.meta.url).href,
  msg: new URL('./images/msg.png', import.meta.url).href,

  // N
  noneData: new URL('./images/none_data.png', import.meta.url).href,

  // R
  realActive: new URL('./images/real_active.png', import.meta.url).href,
  realIcon: new URL('./images/real_icon.png', import.meta.url).href,
  redBook: new URL('./images/red book.png', import.meta.url).href,
  refresh: new URL('./images/refresh.png', import.meta.url).href,
  right: new URL('./images/right.png', import.meta.url).href,
  rightTop: new URL('./images/right_top.png', import.meta.url).href,

  // S
  sketchActive: new URL('./images/sketch_active.png', import.meta.url).href,
  sketchIcon: new URL('./images/sketch_icon.png', import.meta.url).href,
  star: new URL('./images/star.png', import.meta.url).href,
  star2: new URL('./images/star2.png', import.meta.url).href,

  // T
  together: new URL('./images/together.png', import.meta.url).href,

  // U
  uploadIcon: new URL('./images/upload_icon.png', import.meta.url).href,
  uploadImg: new URL('./images/upload_img.png', import.meta.url).href,

  // V
  visionBg: new URL('./images/vision_bg.png', import.meta.url).href,

  // W
  wechat: new URL('./images/wechat.png', import.meta.url).href,
  wechatCode1: new URL('./images/wechat_code1.png', import.meta.url).href,
  wechatCode2: new URL('./images/wechat_code2.png', import.meta.url).href,
  wechatCode3: new URL('./images/wechat_code3.png', import.meta.url).href,



  // ===== 兼容历史 key（当前仓库缺失文件，先用占位图）=====
  // MainImageDisplay
  failVideoPrimary: new URL('./images/msg.png', import.meta.url).href,
  failImgPrimary: new URL('./images/msg.png', import.meta.url).href,
  collected: new URL('./images/star2.png', import.meta.url).href,
  collect: new URL('./images/star.png', import.meta.url).href,

  // CreativeDetail 兼容 key
  like: new URL('./images/star2.png', import.meta.url).href,
  dislike: new URL('./images/star.png', import.meta.url).href,
  vip: new URL('./images/star2.png', import.meta.url).href,

  // ImageParamPopup / ImageUploadArea / PaymentModal / Membership 等
  imgVideo: new URL('./images/logo.png', import.meta.url).href,
  vip4: new URL('./images/star2.png', import.meta.url).href,
  sort2: new URL('./images/arrow_icon.png', import.meta.url).href,
  replace2: new URL('./images/edit.png', import.meta.url).href,
  delete2: new URL('./images/close.png', import.meta.url).href,

  // PaymentModal / SubscriptionManageModal
  closePay: new URL('./images/close.png', import.meta.url).href,
  alipayPay: new URL('./images/coin.png', import.meta.url).href,
  subscription: new URL('./images/msg.png', import.meta.url).href,
  copy: new URL('./images/comma.png', import.meta.url).href,

  // InspirationValueModal
  time: new URL('./images/refresh.png', import.meta.url).href,
  warn: new URL('./images/msg.png', import.meta.url).href,
} as const

export default images

