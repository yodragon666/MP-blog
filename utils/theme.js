export const blogTheme = {
  // --- 基础文本 (语雀标准深灰，摒弃刺眼的纯黑) ---
  p: 'font-size: 32rpx; line-height: 1.8; color: #262626; margin-bottom: 32rpx; text-align: justify; word-wrap: break-word;',

  // --- 标题系列 (Typora 风格：去繁就简，层次分明) ---
  h1: 'font-size: 44rpx; font-weight: bold; color: #1c1c1c; margin: 60rpx 0 40rpx; line-height: 1.4;',
  h2: 'font-size: 38rpx; font-weight: bold; color: #1c1c1c; margin: 50rpx 0 30rpx; line-height: 1.4; border-bottom: 1px solid #eaecef; padding-bottom: 16rpx;',
  h3: 'font-size: 34rpx; font-weight: bold; color: #262626; margin: 40rpx 0 20rpx; line-height: 1.5;',
  h4: 'font-size: 32rpx; font-weight: bold; color: #262626; margin: 30rpx 0 20rpx; line-height: 1.5;',
  h5: 'font-size: 30rpx; font-weight: bold; color: #595959; margin: 24rpx 0 16rpx; line-height: 1.5;',
  h6: 'font-size: 28rpx; font-weight: bold; color: #8c8c8c; margin: 20rpx 0 16rpx; line-height: 1.5;',

  // --- 强调文本 ---
  strong: 'font-weight: bold; color: #1c1c1c;',
  em: 'font-style: italic; color: #595959;',
  del: 'text-decoration: line-through; color: #bfbfbf;',

  // --- 图片 (去掉了厚重的阴影，改为极简微描边和圆角) ---
  img: 'max-width: 100%; border-radius: 8rpx; margin: 32rpx auto; display: block; border: 1rpx solid #f0f0f0;',

  // --- ⭐ 代码块：Typora/GitHub 浅灰极简风 ---
  pre: `
    background: #f6f8fa; 
    color: #24292e; 
    padding: 32rpx; 
    border-radius: 12rpx; 
    margin: 32rpx 0; 
    font-size: 28rpx; 
    line-height: 1.6; 
    white-space: pre !important;
    overflow-x: auto;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace !important;
    border: 1rpx solid #e1e4e8;
  `,

  // --- ⭐ 代码高亮：强制黑白灰克制配色 ---
  '.token': 'color: #333 !important;',
  '.token.comment': 'color: #8c8c8c !important; font-style: italic;', // 注释浅灰
  '.token.keyword': 'color: #262626 !important; font-weight: bold;', // 关键字加粗，深黑
  '.token.string': 'color: #595959 !important;', // 字符串中灰
  '.token.operator': 'color: #595959 !important;',
  '.token.punctuation': 'color: #8c8c8c !important;', // 标点浅灰
  '.token.function': 'color: #1c1c1c !important; font-weight: bold;', // 函数名强调

  // --- 行内代码 (淡灰底色，深灰文字，不抢视觉焦点) ---
  code: 'font-family: "SFMono-Regular", Consolas, monospace; background: #f2f4f5; padding: 6rpx 12rpx; border-radius: 6rpx; color: #262626; margin: 0 4rpx; font-size: 28rpx; border: 1rpx solid #eaeaef;',

  // --- 引用块 (语雀风格的左侧淡灰条) ---
  blockquote: 'border-left: 8rpx solid #e5e6eb; padding: 20rpx 30rpx; color: #595959; background: #f7f8fa; margin: 40rpx 0; border-radius: 0 8rpx 8rpx 0;',

  // --- 列表 ---
  ul: 'padding-left: 40rpx; margin: 32rpx 0; list-style-type: disc;',
  ol: 'padding-left: 40rpx; margin: 32rpx 0; list-style-type: decimal;',
  li: 'font-size: 32rpx; color: #262626; line-height: 1.8; margin-bottom: 16rpx;',

  // --- 表格 (干净的浅灰表头) ---
  table: 'width: 100%; border-collapse: collapse; margin: 40rpx 0; font-size: 28rpx;',
  th: 'background: #f6f8fa; padding: 20rpx 24rpx; font-weight: bold; border: 1rpx solid #dfe2e5; color: #262626; text-align: left;',
  td: 'padding: 20rpx 24rpx; border: 1rpx solid #dfe2e5; color: #262626;',

  // --- 链接 (克制的下划线) ---
  a: 'color: #262626; text-decoration: none; border-bottom: 1px solid #8c8c8c; padding-bottom: 2rpx; margin: 0 4rpx;',

  // --- 分割线 ---
  hr: 'height: 1px; background: #eaecef; border: none; margin: 60rpx 0;',

  // --- ⭐ 补充常用标签 ---
  figure: 'margin: 0; padding: 0;',
  // 荧光笔高亮 (如果你不喜欢黄色，可以换成 #e5e6eb)
  mark: 'background: #fdf5ce; color: #262626; padding: 2rpx 6rpx; border-radius: 4rpx;', 
  // 键盘按键样式 (如 Ctrl + C)
  kbd: 'padding: 4rpx 12rpx; font-size: 26rpx; font-family: monospace; color: #262626; background: #fafafa; border: 1rpx solid #d9d9d9; border-radius: 6rpx; box-shadow: 0 2rpx 0 #d9d9d9;', 
  // 上标和下标 (如 H₂O, 2²)
  sub: 'font-size: 24rpx; vertical-align: sub;', 
  sup: 'font-size: 24rpx; vertical-align: super;', 
  // 折叠块 (如果有支持 HTML 渲染的话)
  details: 'margin: 32rpx 0; padding: 20rpx; border: 1rpx solid #e5e6eb; border-radius: 8rpx; background: #fafafa;', 
  summary: 'font-size: 30rpx; font-weight: bold; color: #262626; outline: none; cursor: pointer;'
}