import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './InfoCallout.scss'

// Soft cyan info callout: an icon on the left, a bold title and a line or two of
// explanation. Matches the "Something Changed?" component in the Tournament
// Overview design.
//
//   <InfoCallout icon={faUserPen} title="Something Changed?">
//     Tournament information can be edited at anytime…
//   </InfoCallout>
export default function InfoCallout({ icon, title, children }) {
  return (
    <div className="info-callout">
      {icon && <FontAwesomeIcon icon={icon} className="info-callout-icon" />}
      <div className="info-callout-text">
        {title && <div className="info-callout-title">{title}</div>}
        <div className="info-callout-body">{children}</div>
      </div>
    </div>
  )
}
