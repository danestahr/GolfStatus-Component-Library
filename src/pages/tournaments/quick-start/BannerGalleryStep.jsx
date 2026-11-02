import { BANNER_PRESETS } from '../../../data/bannerPresets'
import './BannerGalleryStep.scss'

// Quick Start step 3a: pick a preset banner for the event website. Tapping a
// tile selects it; QuickStartPanel then returns to Website Setup.
export default function BannerGalleryStep({ selected, onSelect }) {
  return (
    <div className="qs-gallery">
      {BANNER_PRESETS.map(preset => (
        <button
          key={preset.id}
          type="button"
          className={`qs-gallery-tile${selected === preset.src ? ' qs-gallery-tile--selected' : ''}`}
          onClick={() => onSelect(preset)}
          aria-label={preset.name}
        >
          <img src={preset.src} alt="" />
        </button>
      ))}
    </div>
  )
}
