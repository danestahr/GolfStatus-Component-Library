import './OrderFormSection.scss'

export default function OrderFormSection({ title, action, headerBordered, children }) {
  return (
    <div className="ord-form-section">
      {(title || action) && (
        <div className={`ord-form-section-header${headerBordered ? ' ord-form-section-header--bordered' : ''}`}>
          {title && <div className="ord-form-section-title">{title}</div>}
          {action}
        </div>
      )}
      <div className="ord-form-section-body">{children}</div>
    </div>
  )
}
