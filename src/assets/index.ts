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

  // C
  channel: new URL('./images/channel.png', import.meta.url).href,
  choose: new URL('./images/choose.png', import.meta.url).href,
  close: new URL('./images/close.png', import.meta.url).href,
  coin: new URL('./images/coin.png', import.meta.url).href,
  comma: new URL('./images/comma.png', import.meta.url).href,

  // D
  designActive: new URL('./images/design_active.png', import.meta.url).href,
  designIcon: new URL('./images/design_icon.png', import.meta.url).href,
  douyin: new URL('./images/douyin.png', import.meta.url).href,
  down: new URL('./images/down.png', import.meta.url).href,
  edit: new URL('./images/edit.png', import.meta.url).href,

  // F
  fabricActive: new URL('./images/fabric_active.png', import.meta.url).href,

  // H
  homeBg: new URL('./images/home_bg.png', import.meta.url).href,

  // L
  language: new URL('./images/language.png', import.meta.url).href,
  logo: new URL('./images/logo.png', import.meta.url).href,
  logo2: new URL('./images/logo2.png', import.meta.url).href,

  // M
  more: new URL('./images/more.png', import.meta.url).href,
  msg: new URL('./images/msg.png', import.meta.url).href,

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

  // U
  uploadIcon: new URL('./images/upload_icon.png', import.meta.url).href,

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
  download: new URL('./images/down.png', import.meta.url).href,
  vip: new URL('./images/star2.png', import.meta.url).href,
  del: new URL('./images/close.png', import.meta.url).href,

  // ImageParamPopup / ImageUploadArea / PaymentModal / Membership 等
  imgVideo: new URL('./images/logo.png', import.meta.url).href,
  vip4: new URL('./images/star2.png', import.meta.url).href,
  sort2: new URL('./images/arrow_icon.png', import.meta.url).href,
  replace2: new URL('./images/edit.png', import.meta.url).href,
  delete2: new URL('./images/close.png', import.meta.url).href,
  uploadImg: new URL('./images/add.png', import.meta.url).href,

  // PaymentModal / SubscriptionManageModal
  closePay: new URL('./images/close.png', import.meta.url).href,
  alipayPay: new URL('./images/coin.png', import.meta.url).href,
  subscription: new URL('./images/msg.png', import.meta.url).href,
  copy: new URL('./images/comma.png', import.meta.url).href,

  // InspirationValueModal
  time: new URL('./images/refresh.png', import.meta.url).href,
  warn: new URL('./images/msg.png', import.meta.url).href,

  // PersonalSettingsModal / WriteOffModal
  close3: new URL('./images/close.png', import.meta.url).href,
  editWhite: new URL('./images/edit.png', import.meta.url).href,
  clear2: new URL('./images/close.png', import.meta.url).href,
  checkedActive: new URL('./images/choose.png', import.meta.url).href,
  checkedNo: new URL('./images/close.png', import.meta.url).href,

  // InfiniteScrollLoader
  noneData: new URL('./images/logo2.png', import.meta.url).href,
} as const

export default images

