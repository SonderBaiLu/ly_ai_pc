import { createI18n } from 'vue-i18n'

type Locale = 'zh' | 'en'

const STORAGE_KEY = 'locale'

const zh = {
  header: {
    aiDesign: 'AI服装设计',
    fabricCreative: '面料创款',
    about: '关于',
    contactUs: '联系我们',
    followUs: '关注我们',
    language: '简体中文',
    login: '登录',
    register: '立即体验',
  },
  hero: {
    title: '灵衍AI · 让设计回归创造力本质',
    description:
      '灵衍AI，以"让设计回归创造力本质"为核心使命，打造专属服饰行业的智能协作平台，依托前沿AI算法与全球产业资源，覆盖设计全链路、破解行业核心痛点，助力设计师快人一步，抢占时尚先机。',
    button: '开始AI设计',
  },
  features: {
    tabs: ['AI服装设计', '线稿转实物', '实物转线稿'],
    feature1Title: '文字生款，创意不限',
    feature1Tag: 'text-to-design',
    feature1Desc:
      '高级感极简感齐发，简洁垂坠感长款，宽松色晕染面料。干净的酒秀剪裁，哑光质感，同色系搭配，高级感的黑白色。',
    feature2Title: '灵感不用画，文字直接变服装',
    feature2Tag: 'inspiration',
    feature2Desc:
      '极简高级感女装，宽松的羊毛面料，奶白色，舒适自在的穿着感。经典版型结合法式大片感，柔和自然采光，低饱和度。',
    feature3Title: '文字即版型',
    feature3Tag: 'text-to-pattern',
    feature3Desc: '高级感极简连衣裙，真丝混纺面料，雾蓝色，A字廓形，极简无袖设计，丝绸光泽，温柔无比，约会必入。',
    sketchToRealCard1Title: '手稿落地，即刻成衣',
    sketchToRealCard2Title: '线稿变实物，设计不等待',
    sketchToRealCard3Title: '让手绘设计，拥有真实模样',
    realToSketchCard1Title: '实物一键转手绘',
    realToSketchCard2Title: '实物提炼，线稿呈现',
    realToSketchCard3Title: 'AI 智能勾勒实物线稿',
  },
  fabricSection: {
    title: '面料创款',
    subtitle: '让一块面料，从"布"变成"成衣"的全流程设计与开发',
    description:
      '以面料为核心，从风格、版型、工艺、系列化四个维度，自动/辅助生成完整成衣方案，解决"有好布却不知道做什么款"的痛点。',
    steps: ['上传面料图', '自定义特征', '一键生成'],
    stepDescriptions: ['支持 JPG、PNG，以及本地上传。', '添加款式、面料、颜色等具体细节。', '瞬间预览多版本平面和成衣图。'],
    button: '立即体验',
    originalFabric: '原始面料图',
    fabricRender: '面料创款图',
    fabricFeatures: '面料特征 (Prompts)',
    high: '亮片质感',
    same: '蓝色色系',
    addPrompt: '添加面料、环境、光影...',
    placeholder: '输入款式细节，如"吊带连衣裙", "高级感蓝色"...',
    regenerate: '重新生成效果图',
    moreCreative: '更多创款',
  },
  modelSection: {
    title: '全球模特库',
    subtitle: '一站式全球模特资源，肤色全、年龄全、性别多元，预置超多参数，海内外需求轻松搞定。',
  },
  statsSection: {
    title: '打造专属服饰领域的智能协作标杆平台',
    description:
      '以“让设计回归创造力本质”为核心使命，深耕服饰行业痛点。 依托前沿AI算法赋能创意，链接全球优质产业资源，打通从趋势洞察、创意设计、面料适配到版型优化、成稿输出的全流程壁垒。',
    stat1: '80%',
    stat1Label: '降低设计成本',
    stat2: '95%',
    stat2Label: '提升审美契合度',
    stat3: '70%',
    stat3Label: '缩短出款周期',
    stat4: '65%',
    stat4Label: '减少面料试错损耗',
  },
  designMatrix: {
    title: '多维设计矩阵',
    subtitle: '覆盖全品类、全场景的服装生成能力',
    tags: ['外套', 'T恤', '裙子', '裤子', '立即设计'],
    ctaTitle: '一键解锁即刻设计 + AI 赋能',
    ctaSubtitle: '告别冗长流程，用 AI 驱动灵感，让每一次设计都快人一步。',
    ctaButton: '立即体验',
  },
  footer: {
    // 注意：vue-i18n v11 message 编译器会把 `@` 当作 linked-message token；这里改用插值拼接，避免直接出现 `@`
    businessEmail: '商务邮箱：lingyanservice{at}126.com',
    copyright: 'Copyright 2026 © 杭州灵衍人工智能科技有限公司｜浙ICP备2025191840号-3',
    privacy: '隐私政策',
    userAgreement: '用户协议',
    nav: {
      fashionDesign: '服装设计',
      aiFabric: 'AI面料',
      help: '帮助',
      aiFashionDesign: 'AI服装设计',
      sketchToReal: '线稿转实物',
      realToSketch: '实物转线稿',
      fabricCreative: '面料创款',
      productTutorial: '产品教程',
    },
  },
  LoginPopUpPage: {
    title: '灵衍AI',
    mainTitle: '登录即享专属礼遇',
    promoText: '新用户注册免费赠送',
    promoValue: '50灵衍值',
    simplifyDesign: '卸下设计繁琐，让每一份创意都能纯粹发光',
    aiEmpowerment: '解锁AI设计全能力，守护你的每一份时尚热爱',
    loginRewards: '登录有礼，解锁潮流面料+专属设计工具，不负初心',
    backToEssence: '让设计回归本质，创作更轻松',
    agreement: '注册登录即代表同意',
    userAgreement: '《用户协议》',
    userPolicy: '《隐私政策》',
    personalLogin: '个人登录',
    teamLogin:'团队登录',
    and: '和',
    scanToLogIn:'扫码登录',
    mobileLogin: '手机登录',
    subHint: '扫码关注「灵衍AI」公众号完成登录',
    inviteLink: '填写邀请码注册',
    wechatScanLogin:'打开微信 扫一扫登录',
    mobilePhoneNumber:'手机号',
    enterPhoneNumber: '请输入手机号',
    captcha:'验证码',
    passwordLogin: '密码登录',
    enterTheVerificationCode: '请输入验证码',
    getVerificationCode: '获取验证码',
  },
}

const en = {
  header: {
    aiDesign: 'AI Fashion Design',
    fabricCreative: 'Fabric Creation',
    about: 'About',
    contactUs: 'Contact Us',
    followUs: 'Follow Us',
    language: 'English',
    login: 'Login',
    register: 'Start Now',
  },
  hero: {
    title: 'Lingyan AI · Let Design Return to the Essence of Creativity',
    description:
      'Lingyan AI, with the core mission of "letting design return to the essence of creativity", creates an intelligent collaboration platform exclusively for the fashion industry. Relying on cutting-edge AI algorithms and global industry resources, it covers the entire design chain, solves core industry pain points, and helps designers stay one step ahead and seize fashion opportunities.',
    button: 'Start AI Design',
  },
  features: {
    tabs: ['AI Fashion Design', 'Sketch to Real', 'Real to Sketch'],
    feature1Title: 'Text to Design, Unlimited Creativity',
    feature1Tag: 'text-to-design',
    feature1Desc:
      'Advanced minimalist style, clean draping long coat, loose color gradient fabric. Clean wine show tailoring, matte texture, monochromatic matching, high-end black and white.',
    feature2Title: 'Inspiration Without Drawing, Text Becomes Clothing',
    feature2Tag: 'inspiration',
    feature2Desc:
      "Minimalist high-end women's clothing, loose wool fabric, off-white, comfortable and relaxed wearing feeling. Classic silhouette combined with French大片感, soft natural lighting, low saturation.",
    feature3Title: 'Text is Silhouette',
    feature3Tag: 'text-to-pattern',
    feature3Desc:
      'High-end minimalist dress, silk blend fabric, fog blue, A-line silhouette, minimalist sleeveless design, silk luster, incredibly gentle, perfect for dates.',
    sketchToRealCard1Title: 'Sketch Lands, Garment Ready',
    sketchToRealCard2Title: 'Line Art to Reality, No Waiting for Design',
    sketchToRealCard3Title: 'Let Hand-drawn Designs Become Real Looks',
    realToSketchCard1Title: 'One-click Real-to-Sketch',
    realToSketchCard2Title: 'Extract from Real, Reveal in Lines',
    realToSketchCard3Title: 'AI Smartly Outlines Real-world Sketches',
  },
  fabricSection: {
    title: 'Fabric Creation',
    subtitle: 'Full-process design and development from "fabric" to "garment"',
    description:
      'With fabric as the core, automatically/assist generate complete garment solutions from four dimensions: style, silhouette, craftsmanship, and serialization, solving the pain point of "having good fabric but not knowing what style to make".',
    steps: ['Upload Fabric Image', 'Custom Features', 'One-click Generation'],
    stepDescriptions: [
      'Supports JPG, PNG, and local uploads.',
      'Add specific details like style, fabric, color, etc.',
      'Instantly preview multiple versions of flat and garment images.',
    ],
    button: 'Experience Now',
    originalFabric: 'Original Fabric Image',
    fabricRender: 'Fabric Creation Image',
    fabricFeatures: 'Fabric Features (Prompts)',
    high: 'Sequin Texture',
    same: 'Blue Tones',
    addPrompt: 'Add fabric, environment, lighting...',
    placeholder: 'Enter style details, such as "sling dress", "high-end blue"...',
    regenerate: 'Regenerate Effect Image',
    moreCreative: 'More Creations',
  },
  modelSection: {
    title: 'Global Model Library',
    subtitle:
      'One-stop global model resources, full skin tones, full ages, diverse genders, with many preset parameters, easily meet domestic and international needs.',
  },
  statsSection: {
    title: 'Create an Intelligent Collaboration Benchmark Platform Exclusive to the Fashion Industry',
    description:
      'With the core mission of "letting design return to the essence of creativity", we deeply cultivate the pain points of the fashion industry. Relying on cutting-edge AI algorithms to empower creativity, linking global high-quality industry resources, and breaking through the entire process barriers from trend insight, creative design, fabric adaptation to pattern optimization and large-scale output.',
    stat1: '80%',
    stat1Label: 'Reduce Design Costs',
    stat2: '95%',
    stat2Label: 'Improve Aesthetic Fit',
    stat3: '70%',
    stat3Label: 'Shorten Design Cycle',
    stat4: '65%',
    stat4Label: 'Reduce Fabric Trial Waste',
  },
  designMatrix: {
    title: 'Multi-dimensional Design Matrix',
    subtitle: 'Full-category, full-scene clothing generation capabilities',
    tags: ['Coats', 'T-Shirts', 'Dresses', 'Pants', 'Design Now'],
    ctaTitle: 'One-click Unlock Instant Design + AI Empowerment',
    ctaSubtitle: 'Say goodbye to lengthy processes, drive inspiration with AI, and make every design one step ahead.',
    ctaButton: 'Experience Now',
  },
  footer: {
    // Avoid raw `@` token in vue-i18n message compiler by using interpolation
    businessEmail: 'Business Email: lingyanservice{at}126.com',
    // 注意：vue-i18n 的 message 语法里 `|` 可能被当作复数分隔符导致编译报错，改用全角分隔符
    copyright: 'Copyright 2026 © Hangzhou Lingyan Artificial Intelligence Technology Co., Ltd. ｜ Zhejiang ICP 2025191840-3',
    privacy: 'Privacy Policy',
    userAgreement: 'User Agreement',
    nav: {
      fashionDesign: 'Fashion Design',
      aiFabric: 'AI Fabric',
      help: 'Help',
      aiFashionDesign: 'AI Fashion Design',
      sketchToReal: 'Sketch to Real',
      realToSketch: 'Real to Sketch',
      fabricCreative: 'Fabric Creation',
      productTutorial: 'Product Tutorial',
    },
  },
  LoginPopUpPage: {
    title: 'English',
    mainTitle: 'English',
    promoText: 'English',
    promoValue: 'English',
    simplifyDesign: 'English，English',
    aiEmpowerment: 'English，English',
    loginRewards: 'English，English+English，English',
    backToEssence: 'English，English',
    agreement: 'English',
    userAgreement: '《English》',
    userPolicy: '《English》',
    and: 'and',
    personalLogin: 'English',
    teamLogin:'English',
    scanToLogIn:'English',
    mobileLogin: 'English',
    subHint: 'English',
    inviteLink: 'English',
    wechatScanLogin:'English English',
    mobilePhoneNumber:'English',
    enterPhoneNumber: 'English',
    captcha:'English',
    passwordLogin: 'English',
    enterTheVerificationCode: 'English',
    getVerificationCode: 'English',


  },
}

const detectInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return 'zh'
  const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null
  if (stored === 'zh' || stored === 'en') return stored
  return 'zh'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectInitialLocale(),
  fallbackLocale: 'zh',
  messages: { zh, en },
})

export const persistLocale = (locale: string) => {
  if (typeof window === 'undefined') return
  if (locale === 'zh' || locale === 'en') {
    window.localStorage.setItem(STORAGE_KEY, locale)
  }
}

