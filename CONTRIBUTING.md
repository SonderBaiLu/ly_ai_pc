# Git 提交规范

为保证提交历史清晰可追溯，统一使用以下提交类型。

## 提交类型

- `feat`: 新功能
- `fix`: 修复 Bug
- `perf`: 性能优化
- `refactor`: 重构（不改变业务行为）
- `i18n`: 国际化文案
- `style`: 样式 / 格式调整
- `test`: 测试相关
- `chore`: 构建 / 工具 / 依赖 / 工程配置

## 推荐格式

使用如下格式：

`type(scope): subject`

说明：

- `type`: 上面的提交类型之一
- `scope`: 可选，建议填写模块名，如 `home`、`header`、`i18n`、`ai-fashion-studio`
- `subject`: 简洁说明本次变更目的（建议 50 字以内）

## 示例

- `feat(home): add async loading for non-hero sections`
- `fix(ai-fashion-studio): fallback to local rail icons when api icon is empty`
- `perf(home): lazy load gallery and model section images`
- `i18n(modal): align modal locale with user preference`
- `refactor(header): simplify language switch flow`
- `chore(build): optimize vite split chunks`

## 建议

- 一次提交只做一类主变更（如 `i18n` 与 `perf` 尽量拆分）
- 优先写“为什么改”，而不是仅写“改了什么”
