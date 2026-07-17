/**
 * 全系统国旗显示规范（与 Flags by Region 页面一致）
 *
 * - 法定比例：width / height（横宽 ÷ 竖高），与 Wikimedia / normalize_flag.py 一致
 * - 显示规则：固定高度 baseHeight，宽度 = round(baseHeight × aspect)
 * - PNG 资源：scripts/normalize_flag.py 按 FLAG_ASPECT_RATIOS 缩放到 FLAG_IMAGE_HEIGHT
 * - 新增任何国旗展示（图表、页面、组件）请调用 getFlagDisplaySize / toFlagCssSize
 */

/** Legal fly:hoist ratios (width / height). */
export const FLAG_ASPECT_RATIOS = {
  af: 2,
  ar: 14 / 9,
  au: 2,
  bd: 5 / 3,
  bn: 2,
  br: 10 / 7,
  bt: 3 / 2,
  ca: 2,
  ch: 1,
  cn: 3 / 2,
  de: 5 / 3,
  es: 3 / 2,
  fr: 3 / 2,
  gb: 2,
  hk: 3 / 2,
  id: 3 / 2,
  il: 11 / 8,
  in: 3 / 2,
  ir: 3 / 2,
  it: 3 / 2,
  jp: 3 / 2,
  kh: 25 / 16,
  kr: 3 / 2,
  la: 3 / 2,
  lk: 3 / 2,
  mv: 3 / 2,
  mx: 7 / 4,
  mm: 3 / 2,
  mn: 2,
  mo: 2,
  my: 2,
  nl: 3 / 2,
  np: 3 / 4,
  ph: 2,
  pg: 4 / 3,
  pk: 3 / 2,
  ru: 3 / 2,
  sa: 3 / 2,
  se: 8 / 5,
  sg: 3 / 2,
  su: 2,
  th: 3 / 2,
  tr: 3 / 2,
  tw: 3 / 2,
  us: 19 / 10,
  vn: 3 / 2,
  tl: 2
}

export const DEFAULT_FLAG_ASPECT_RATIO = 3 / 2

/** normalize_flag.py 输出 PNG 的统一高度 */
export const FLAG_IMAGE_HEIGHT = 107

/** 各场景显示高度（宽度由 getFlagDisplaySize 推算） */
export const FLAG_DISPLAY_HEIGHT_REFERENCE = 44
export const FLAG_DISPLAY_HEIGHT_BAR = 36
/** 手机竖屏录制画布（1080×1920）柱状竞赛国旗高度 */
export const FLAG_DISPLAY_HEIGHT_BAR_MOBILE = 58
export const FLAG_DISPLAY_HEIGHT_LINE = 28
export const FLAG_DISPLAY_HEIGHT_LINE_FEATURED = 32
export const FLAG_DISPLAY_HEIGHT_TREEMAP = 20

export function getFlagAspectRatio(code) {
  return FLAG_ASPECT_RATIOS[code] ?? DEFAULT_FLAG_ASPECT_RATIO
}

/** @returns {{ width: number, height: number }} 像素尺寸 */
export function getFlagDisplaySize(code, baseHeight) {
  const aspect = getFlagAspectRatio(code)
  const height = baseHeight
  const width = Math.round(height * aspect)
  return { width, height }
}

/** Vue <img :style> 等场景 */
export function toFlagCssSize(code, baseHeight) {
  const { width, height } = getFlagDisplaySize(code, baseHeight)
  return {
    width: `${width}px`,
    height: `${height}px`
  }
}
