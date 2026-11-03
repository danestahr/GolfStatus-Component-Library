import { useEffect, useState } from 'react'
import GSImageEditor, { CROP_IMAGE } from '../../../gs-lib/components/gs-image-editor'
import './ImageCropStep.scss'

// Quick Start's crop screen: positions and sizes a crop over an uploaded image,
// locked to `ratio` (e.g. 2 for 2:1) or free when there isn't one. The editor reports the cropped result as a
// blob each time it changes (`onCrop`); QuickStartPanel's Save turns the latest
// one into the new file.
export default function ImageCropStep({ file, ratio, onCrop }) {
  // The object URL is made (and revoked) inside the effect so React's dev-mode
  // double mount can't revoke a URL the editor is still loading.
  const [source, setSource] = useState(null)
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSource(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!source) return null

  return (
    <div className="qs-crop">
      <GSImageEditor
        source={source}
        ratio={ratio}
        resizeEnabled
        defaultImageFit={CROP_IMAGE}
        minWidth={0}
        minHeight={0}
        setCroppedBlob={onCrop}
      />
    </div>
  )
}
