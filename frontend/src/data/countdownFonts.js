/** 倒计时可选字体 — 见 styles/countdown-fonts.css */
export const COUNTDOWN_FONTS = [
  {
    id: 'roboto-mono',
    label: 'Roboto Mono',
    family: "'Roboto Mono', monospace"
  },
  {
    id: 'geist-pixel',
    label: 'Geist Pixel',
    family: "'Geist Pixel', monospace"
  },
  {
    id: 'oswald',
    label: 'Oswald',
    family: "'Oswald', sans-serif"
  },
  {
    id: 'bebas-neue',
    label: 'Bebas Neue',
    family: "'Bebas Neue', sans-serif"
  },
  {
    id: 'orbitron',
    label: 'Orbitron',
    family: "'Orbitron', sans-serif"
  },
  {
    id: 'share-tech-mono',
    label: 'Share Tech Mono',
    family: "'Share Tech Mono', monospace"
  },
  {
    id: 'rajdhani',
    label: 'Rajdhani',
    family: "'Rajdhani', sans-serif"
  },
  {
    id: 'anton',
    label: 'Anton',
    family: "'Anton', sans-serif"
  },
  {
    id: 'noto-sans-sc',
    label: 'Noto Sans SC',
    family: "'Noto Sans SC', sans-serif"
  }
]

export const DEFAULT_COUNTDOWN_FONT_ID = 'roboto-mono'

export function getCountdownFontById(id) {
  return COUNTDOWN_FONTS.find((font) => font.id === id) ?? COUNTDOWN_FONTS[0]
}
