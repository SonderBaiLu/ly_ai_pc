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
  alipay: new URL('./images/alipay.png', import.meta.url).href,

  // C
  channel: new URL('./images/channel.png', import.meta.url).href,
  choose: new URL('./images/choose.png', import.meta.url).href,
  chosseNo: new URL('./images/choose_no.png', import.meta.url).href,
  chooseActive: new URL('./images/choose_active.png', import.meta.url).href,
  close: new URL('./images/close.png', import.meta.url).href,
  closeCustomer: new URL('./images/close_customer.png', import.meta.url).href,
  closeDialog: new URL('./images/close_dialog.png', import.meta.url).href,
  closeParams: new URL('./images/close_params.png', import.meta.url).href,
  closeWords: new URL('./images/close_words.png', import.meta.url).href,
  closeFeedback: new URL('./images/close_feedback.png', import.meta.url).href,
  closePay: new URL('./images/close_pay.png', import.meta.url).href,
  coin: new URL('./images/coin.png', import.meta.url).href,
  copy: new URL('./images/copy.png', import.meta.url).href,
  comma: new URL('./images/comma.png', import.meta.url).href,
  checked: new URL('./images/checked.png', import.meta.url).href,
  checkedActive: new URL('./images/checked_active.png', import.meta.url).href,
  checkedNo: new URL('./images/checked_no.png', import.meta.url).href,
  clear: new URL('./images/clear.png', import.meta.url).href,
  certification: new URL('./images/certification.png', import.meta.url).href,
  check: new URL('./images/check.png', import.meta.url).href,
  check1: new URL('./images/check1.png', import.meta.url).href,
  check2: new URL('./images/check2.png', import.meta.url).href,
  check3: new URL('./images/check3.png', import.meta.url).href,

  collect: new URL('./images/collect.png', import.meta.url).href,
  collectNo: new URL('./images/collect_no.png', import.meta.url).href,
  collectActive: new URL('./images/collect_active.png', import.meta.url).href,

  // D
  date: new URL('./images/date.png', import.meta.url).href,
  designActive: new URL('./images/design_active.png', import.meta.url).href,
  designIcon: new URL('./images/design_icon.png', import.meta.url).href,
  douyin: new URL('./images/douyin.png', import.meta.url).href,
  down: new URL('./images/down.png', import.meta.url).href,
  del: new URL('./images/del.png', import.meta.url).href,
  delIcon: new URL('./images/del_icon.png', import.meta.url).href,
  delete: new URL('./images/delete.png', import.meta.url).href,
  delMini: new URL('./images/del_mini.png', import.meta.url).href,
  download: new URL('./images/download.png', import.meta.url).href,
  downloadIcon: new URL('./images/download_icon.png', import.meta.url).href,
  downloadMini: new URL('./images/download_mini.png', import.meta.url).href,

  design1: new URL('./images/home/design1.png', import.meta.url).href,
  design2: new URL('./images/home/design2.png', import.meta.url).href,
  design3: new URL('./images/home/design3.png', import.meta.url).href,
  design4: new URL('./images/home/design4.png', import.meta.url).href,

  designFeatures: new URL('./images/design_features.png', import.meta.url).href,
  designFeatures1: new URL('./images/design_features1.png', import.meta.url).href,
  designFeatures2: new URL('./images/design_features2.png', import.meta.url).href,
  designFeatures3: new URL('./images/design_features3.png', import.meta.url).href,
  designFeatures4: new URL('./images/design_features4.png', import.meta.url).href,
  designFeatures5: new URL('./images/design_features5.png', import.meta.url).href,
  designFeatures6: new URL('./images/design_features6.png', import.meta.url).href,
  designFeatures7: new URL('./images/design_features7.png', import.meta.url).href,
  designFeatures8: new URL('./images/design_features8.png', import.meta.url).href,
  designFeatures9: new URL('./images/design_features9.png', import.meta.url).href,
  designActive1: new URL('./images/design_active1.png', import.meta.url).href,
  designActive2: new URL('./images/design_active2.png', import.meta.url).href,
  designActive3: new URL('./images/design_active3.png', import.meta.url).href,
  designActive4: new URL('./images/design_active4.png', import.meta.url).href,
  designActive5: new URL('./images/design_active5.png', import.meta.url).href,
  designActive6: new URL('./images/design_active6.png', import.meta.url).href,
  designActive7: new URL('./images/design_active7.png', import.meta.url).href,
  designActive8: new URL('./images/design_active8.png', import.meta.url).href,
  designActive9: new URL('./images/design_active9.png', import.meta.url).href,

  // E
  edit: new URL('./images/edit.png', import.meta.url).href,
  editText: new URL('./images/edit_text.png', import.meta.url).href,
  editWhite: new URL('./images/edit_white.png', import.meta.url).href,
  eye: new URL('./images/login_popup/eye.png', import.meta.url).href,
  eyeClose: new URL('./images/login_popup/eye_close.png', import.meta.url).href,

  // F
  fabricActive: new URL('./images/fabric_active.png', import.meta.url).href,
  failFace: new URL('./images/fail_face.png', import.meta.url).href,
  favorite: new URL('./images/favorite.png', import.meta.url).href,
  fail: new URL('./images/fail.png', import.meta.url).href,
  fail1: new URL('./images/fail1.png', import.meta.url).href,

  // H
  homeBg: new URL('./images/home_bg.png', import.meta.url).href,
  handshake: new URL('./images/handshake.png', import.meta.url).href,

  // L
  language: new URL('./images/language.png', import.meta.url).href,
  logo: new URL('./images/logo.png', import.meta.url).href,
  logo2: new URL('./images/logo2.png', import.meta.url).href,
  logoMini: new URL('./images/logo.png', import.meta.url).href,

  // M
  more: new URL('./images/more.png', import.meta.url).href,
  msg: new URL('./images/msg.png', import.meta.url).href,
  money: new URL('./images/money.png', import.meta.url).href,
  magic: new URL('./images/magic.png', import.meta.url).href,

  // N
  noneData: new URL('./images/none_data.png', import.meta.url).href,
  notice: new URL('./images/notice.png', import.meta.url).href,

  // P
  plus: new URL('./images/plus.png', import.meta.url).href,

  // R
  realActive: new URL('./images/real_active.png', import.meta.url).href,
  realIcon: new URL('./images/real_icon.png', import.meta.url).href,
  redBook: new URL('./images/red book.png', import.meta.url).href,
  refresh: new URL('./images/refresh.png', import.meta.url).href,
  refreshTry: new URL('./images/refresh2.png', import.meta.url).href,
  right: new URL('./images/right.png', import.meta.url).href,
  rightTop: new URL('./images/right_top.png', import.meta.url).href,
  replace: new URL('./images/replace.png', import.meta.url).href,

  // S
  sketchActive: new URL('./images/sketch_active.png', import.meta.url).href,
  sketchIcon: new URL('./images/sketch_icon.png', import.meta.url).href,
  star: new URL('./images/star.png', import.meta.url).href,
  star2: new URL('./images/star2.png', import.meta.url).href,
  subscription: new URL('./images/subscription.png', import.meta.url).href,

  // T
  together: new URL('./images/together.png', import.meta.url).href,
  tagDel: new URL('./images/tag_del.png', import.meta.url).href,
  time: new URL('./images/time.png', import.meta.url).href,

  // U
  uploadIcon: new URL('./images/upload_icon.png', import.meta.url).href,
  uploadImg: new URL('./images/upload_img.png', import.meta.url).href,

  // V
  vip: new URL('./images/vip.png', import.meta.url).href,
  visionBg: new URL('./images/vision_bg.png', import.meta.url).href,

  // W
  wechat: new URL('./images/wechat.png', import.meta.url).href,
  wechatCode1: new URL('./images/wechat_code1.png', import.meta.url).href,
  wechatCode2: new URL('./images/wechat_code2.png', import.meta.url).href,
  wechatCode3: new URL('./images/wechat_code3.png', import.meta.url).href,
  warn: new URL('./images/warn.png', import.meta.url).href,
  warning: new URL('./images/warning.png', import.meta.url).href,
} as const

export default images

