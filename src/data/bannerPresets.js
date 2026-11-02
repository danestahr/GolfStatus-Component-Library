// Preset banner images for Quick Start's gallery. Generated as inline SVG
// landscapes (2:1, matching the banner upload's 600 x 300) so there are no
// image assets to ship yet — swap `src` for real photos later.
const landscape = ({ sky, sun, far, mid, near }) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
<rect width="1200" height="600" fill="url(#s)"/>
<circle cx="880" cy="250" r="70" fill="${sun}" opacity=".9"/>
<path d="M0 330 Q200 250 420 320 T820 310 T1200 300 V600 H0Z" fill="${far}"/>
<path d="M0 380 Q260 320 520 375 T1200 360 V600 H0Z" fill="${mid}"/>
<path d="M0 450 Q300 400 640 450 T1200 440 V600 H0Z" fill="${near}"/>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const BANNER_PRESETS = [
  { id: 'b1', name: 'Morning Fairway', src: landscape({ sky: ['#9fd3f2', '#e8f6ff'], sun: '#fff3b0', far: '#7fb685', mid: '#4f9d5d', near: '#2f7d43' }) },
  { id: 'b2', name: 'Sunset Links', src: landscape({ sky: ['#f6a35b', '#ffe3b8'], sun: '#fff0c4', far: '#8aa36a', mid: '#5e8a4e', near: '#3a6b3a' }) },
  { id: 'b3', name: 'Clear Sky', src: landscape({ sky: ['#4a90d9', '#bfe3ff'], sun: '#ffffff', far: '#6fb27b', mid: '#3f9255', near: '#237a3b' }) },
  { id: 'b4', name: 'Dusk', src: landscape({ sky: ['#5b5b9a', '#e6b8d8'], sun: '#ffe9f3', far: '#6a8f7a', mid: '#46745f', near: '#2c5444' }) },
  { id: 'b5', name: 'Overcast', src: landscape({ sky: ['#aab4bd', '#e3e8ec'], sun: '#f4f6f8', far: '#86a28c', mid: '#5f8a6c', near: '#436e53' }) },
  { id: 'b6', name: 'Desert Course', src: landscape({ sky: ['#f2c27a', '#fff1d6'], sun: '#fffaf0', far: '#c9a36b', mid: '#8fb06a', near: '#5f9a4a' }) },
]
