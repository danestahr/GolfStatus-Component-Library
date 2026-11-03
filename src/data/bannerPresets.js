// Preset banner images for Quick Start's gallery: 1680 x 840 (2:1) photos in
// assets/banners, sorted by file name. The gallery crops them to 3:1 for the
// picker, but the full 2:1 image is what's used on the event site, where the
// banner has more room as it reacts to the screen size.
const files = import.meta.glob('../assets/banners/*.jpg', { eager: true, import: 'default' })

export const BANNER_PRESETS = Object.keys(files)
  .sort()
  .map((path, i) => ({ id: `b${i + 1}`, name: `Banner ${i + 1}`, src: files[path] }))
