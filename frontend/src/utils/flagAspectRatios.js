/** Legal fly:hoist ratios (width / height). */
export const FLAG_ASPECT_RATIOS = {
  ar: 14 / 9,
  au: 2,
  bd: 5 / 3,
  br: 10 / 7,
  ca: 2,
  ch: 1,
  cn: 3 / 2,
  de: 5 / 3,
  es: 3 / 2,
  fr: 3 / 2,
  gb: 2,
  id: 3 / 2,
  il: 11 / 8,
  in: 3 / 2,
  ir: 3 / 2,
  it: 3 / 2,
  jp: 3 / 2,
  kr: 3 / 2,
  mx: 7 / 4,
  my: 2,
  nl: 3 / 2,
  ph: 2,
  pk: 3 / 2,
  ru: 3 / 2,
  sa: 3 / 2,
  se: 8 / 5,
  sg: 3 / 2,
  su: 2,
  th: 3 / 2,
  tr: 3 / 2,
  us: 19 / 10,
  vn: 3 / 2
}

export const DEFAULT_FLAG_ASPECT_RATIO = 3 / 2

export const FLAG_IMAGE_HEIGHT = 107

export function getFlagAspectRatio(code) {
  return FLAG_ASPECT_RATIOS[code] ?? DEFAULT_FLAG_ASPECT_RATIO
}
