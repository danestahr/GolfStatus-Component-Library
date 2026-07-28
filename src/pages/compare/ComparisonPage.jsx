import { mockScorecards } from '../../data/mockScorecards'
import ScorecardListItemV1 from '../../components/scorecard/ScorecardListItemV1'
import ScorecardListItem from '../../components/scorecard/ScorecardListItem'
import './ComparisonPage.scss'

const SAMPLE_IDS = [1, 9, 17, 25, 36]
const samples = mockScorecards.filter(s => SAMPLE_IDS.includes(s.id))

export default function ComparisonPage() {
  return (
    <div className="comparison-page">
      <div className="comparison-column">
        <div className="column-header">Original</div>
        {samples.map(s => <ScorecardListItemV1 key={s.id} scorecard={s} />)}
      </div>
      <div className="comparison-divider" />
      <div className="comparison-column">
        <div className="column-header">Updated</div>
        {samples.map(s => <ScorecardListItem key={s.id} scorecard={s} />)}
      </div>
    </div>
  )
}
