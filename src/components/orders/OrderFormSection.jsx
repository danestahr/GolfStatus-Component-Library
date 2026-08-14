import './OrderFormSection.scss'

export default function OrderFormSection({ title, action, children }) {
  return (
    <div className="ord-form-section">
      {(title || action) && (
        <div className="ord-form-section-header">
          {title && <div className="ord-form-section-title">{title}</div>}
          {action}
        </div>
      )}
      <div className="ord-form-section-body">{children}</div>
    </div>
  )
}
