import './ConfirmationCard.scss'

// Reused confirmation element: an intro line above a bordered card that
// recaps what we have so far. Each group is a stack of lines (an optional
// bold `title` first, then muted `lines`); `note` is the faint footnote.
//
//   <ConfirmationCard
//     intro="Pat, here’s what we’ve gathered so far:"
//     groups={[{ title: 'Pat Open', lines: ['Pat Open'] }, { lines: ['Thu, Nov 5, 2026', 'Pine Valley'] }]}
//     note="Tournament information can be edited at any time"
//   />
export default function ConfirmationCard({ intro, groups = [], note }) {
  return (
    <div className="confirmation">
      {intro && <p className="confirmation-intro">{intro}</p>}
      <div className="confirmation-card">
        {groups.map((group, i) => (
          <div key={i} className="confirmation-group">
            {group.title && <div className="confirmation-title">{group.title}</div>}
            {group.lines?.map(line => <div key={line} className="confirmation-line">{line}</div>)}
          </div>
        ))}
        {note && <div className="confirmation-note">{note}</div>}
      </div>
    </div>
  )
}
