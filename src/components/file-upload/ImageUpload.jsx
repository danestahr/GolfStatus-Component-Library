import { useEffect, useMemo, useRef, useState } from 'react'
import { faCircleArrowUp, faImages, faTrash } from '@fortawesome/free-solid-svg-icons'
import GSButton from '../../gs-lib/components/gs-button'
import './ImageUpload.scss'

const ACCEPT = '.jpg,.jpeg,.png,.gif'
const ACCEPT_TYPES = /^image\/(jpeg|png|gif)$/

const gcd = (a, b) => (b ? gcd(b, a % b) : a)

// "600 x 300 px / 2:1" — the ratio is reduced when it's a tidy one, else
// shown as a decimal (e.g. "1.78:1").
const describe = ({ width, height }) => {
  const d = gcd(width, height)
  const [rw, rh] = [width / d, height / d]
  const ratio = rw <= 21 && rh <= 21 ? `${rw}:${rh}` : `${(width / height).toFixed(2)}:1`
  return `${width} x ${height} px / ${ratio}`
}

// Single-image file select, per the cl_input_file-upload Figma spec:
//  - no file: dashed drop zone with a light-grey Upload button + hint
//  - hover / dragging a file over: dashed border swaps for a faint fill
//  - with file: a white card holding the image (2:1 crop), its dimensions and
//    ratio, and a trash button; the Upload button and hint go away until it's removed
// Controlled: `image` is a File, an image URL string (e.g. a preset), or null;
// `onChange(file | null)`. `onGallery` adds a "Gallery" button beside Upload
// for choosing from a preset list instead of uploading; `hint` overrides the
// text under the empty drop zone.
// `actions` adds per-image buttons ahead of the trash, each
// { icon, onClick(file), key? } (e.g. crop, replace) — the tile's action row
// grows with them.
export default function ImageUpload({ image, onChange, actions = [], onGallery, hint = 'Tap or drag a file to upload. The image ratio is 2:1. Accepted file types are .JPG, .PNG, .GIF under 25MB.' }) {
  const inputRef = useRef(null)
  const [hover, setHover] = useState(false)
  const [size, setSize] = useState(null)

  const isFile = image instanceof File
  const previewUrl = useMemo(() => (isFile ? URL.createObjectURL(image) : image || null), [image, isFile])
  useEffect(() => () => { if (isFile && previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl, isFile])
  useEffect(() => { if (!image) setSize(null) }, [image])

  // Browsers downscale big photos in one jump, which aliases fine detail. Halve
  // it step by step on a canvas to a thumbnail ~2x the tile width instead.
  const [thumb, setThumb] = useState(null)
  useEffect(() => {
    setThumb(null)
    if (!previewUrl) return
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      setSize({ width: img.naturalWidth, height: img.naturalHeight })
      const targetW = 720
      if (img.naturalWidth <= targetW * 1.5) return
      let source = img
      let w = img.naturalWidth
      let h = img.naturalHeight
      while (w > targetW) {
        const nw = Math.max(targetW, Math.round(w / 2))
        const nh = Math.round(h * (nw / w))
        const canvas = document.createElement('canvas')
        canvas.width = nw
        canvas.height = nh
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(source, 0, 0, nw, nh)
        source = canvas
        w = nw
        h = nh
      }
      setThumb(source.toDataURL('image/png'))
    }
    img.src = previewUrl
    return () => { cancelled = true }
  }, [previewUrl])

  const pick = file => {
    if (file && ACCEPT_TYPES.test(file.type)) onChange(file)
  }

  return (
    <div
      className={`image-upload${hover ? ' image-upload--hover' : ''}${image ? ' image-upload--has-file' : ''}`}
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragOver={e => { e.preventDefault(); setHover(true) }}
      onDragLeave={() => setHover(false)}
      onDrop={e => { e.preventDefault(); setHover(false); pick(e.dataTransfer.files?.[0]) }}
    >
      {image ? (
        <div className="image-upload-card">
          <div className="image-upload-frame">
            <img
              src={thumb ?? previewUrl}
              alt=""
            />
          </div>
          <div className="image-upload-details">
            <span>{size ? describe(size) : isFile ? image.name : ''}</span>
            <div className="image-upload-actions">
              {actions.map((action, i) => (
                <GSButton
                  key={action.key ?? i}
                  buttonIcon={action.icon}
                  type="transparent"
                  onClick={e => { e?.stopPropagation?.(); action.onClick?.(image) }}
                  isFocusable
                />
              ))}
              <GSButton
                buttonIcon={faTrash}
                type="transparent"
                onClick={e => { e?.stopPropagation?.(); onChange(null) }}
                isFocusable
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="image-upload-buttons">
          <GSButton title="Upload" buttonIcon={faCircleArrowUp} type="light-grey" isFocusable />
          {onGallery && (
            <GSButton
              title="Gallery"
              buttonIcon={faImages}
              type="light-grey"
              onClick={e => { e?.stopPropagation?.(); onGallery() }}
              isFocusable
            />
          )}
        </div>
      )}

      {!image && <div className="image-upload-hint">{hint}</div>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onClick={e => e.stopPropagation()}
        onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }}
      />
    </div>
  )
}
