# ly_pc

基于 **Vue 3 + TypeScript + Vite** 的 PC 端项目，集成 **Vue Router / Pinia / Vue I18n / Element Plus**，并通过 Vite Proxy 在开发环境转发 `/api` 请求。

## 技术栈

- **框架**: Vue 3（SFC + `<script setup>`）
- **构建**: Vite
- **语言**: TypeScript
- **路由**: Vue Router
- **状态管理**: Pinia
- **多语言**: Vue I18n
- **UI**: Element Plus（自动按需导入 API / 组件）
- **请求**: Axios
- **样式**: SCSS（全局变量自动注入）

## 运行环境

- **Node.js**: 建议 18+（或与你本机 `npm`/依赖兼容的版本）
- **包管理器**: npm

## 快速开始

安装依赖：

```bash
npm install
```

启动开发环境（默认端口 **9004**，严格占用）：

```bash
npm run dev
```

构建生产包（输出到 `dist/`）：

```bash
npm run build
```

本地预览生产包：

```bash
npm run preview
```

代码格式化与自动修复：

```bash
npm run format
npm run lint
```

## 接口与环境配置

本项目通过 `vite.config.ts` 根据 `mode` 选择环境配置：

- 开发：`env.development.ts`
- 生产：`env.production.ts`

同时支持通过系统环境变量覆盖：

- **`VITE_API_PROXY_TARGET`**：开发环境代理目标域名（不带 `/api`）
- **`VITE_API_BASE_URL`**：接口 baseURL（生产环境建议带 `/api`）

### 开发环境（proxy）

- **端口**：`9004`
- **代理规则**：将 **`/api`** 转发到 `VITE_API_PROXY_TARGET`
- **适用**：本地前端不跨域直连后端，通过代理访问

### 生产环境（baseURL）

- **直连规则**：使用 `VITE_API_BASE_URL` 作为 Axios baseURL（默认值见 `env.production.ts`）
- **建议**：生产环境 `VITE_API_BASE_URL` 包含 `/api`

## 目录结构

```text
.
├─ public/                  # 静态资源（原样拷贝）
├─ src/
│  ├─ api/                   # API 封装入口
│  ├─ assets/                # 图片/静态资源
│  ├─ components/            # 通用组件（如 Header/Footer）
│  ├─ router/                # 路由配置
│  ├─ sections/              # 页面分区组件（如 home 各模块）
│  ├─ services/              # 服务层（如 api 实例封装）
│  ├─ stores/                # Pinia stores（含 i18n store 等）
│  ├─ styles/                # 全局样式/变量（SCSS）
│  ├─ views/                 # 页面
│  ├─ App.vue
│  └─ main.ts
├─ env.development.ts        # 开发环境配置
├─ env.production.ts         # 生产环境配置
├─ vite.config.ts            # Vite 配置（alias/proxy/自动导入等）
└─ dist/                     # 构建产物（build 生成）
```

## 约定与说明

- **路径别名**：`@` 指向 `src/`（见 `vite.config.ts`）
- **Element Plus**：通过 `unplugin-auto-import` + `unplugin-vue-components` 自动导入（根目录会生成 `auto-imports.d.ts`、`components.d.ts`）
- **SCSS 全局变量**：所有 `lang="scss"` 自动注入 `src/styles/_variables.scss`（见 `vite.config.ts` 的 `additionalData`）

## 常见问题（FAQ）

- **端口被占用**
  - 本项目 `strictPort: true`，端口 `9004` 被占用会直接启动失败；请释放端口或修改 `vite.config.ts` 的 `server.port`。
- **接口请求失败 / 代理不生效**
  - 检查 `VITE_API_PROXY_TARGET` 是否可访问（开发环境），以及请求路径是否以 `/api` 开头。
- **生产环境接口地址不对**
  - 修改 `env.production.ts` 的 `VITE_API_BASE_URL`，或在构建/运行时注入环境变量 `VITE_API_BASE_URL` 覆盖。

## 许可证

如需添加许可证（MIT/Apache-2.0 等），请补充 `LICENSE` 文件并在此处说明。
