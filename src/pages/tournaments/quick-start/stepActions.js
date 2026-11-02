import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

// Action drawer shared by Quick Start steps 1-3 (tournament, rounds,
// website): an icon-only light-grey Back arrow beside a black "Save & Continue".
// Pair with the `qs-panel--steps` class (QuickStartPanel.scss), which sizes
// the two buttons.
export const stepActions = ({ onBack, onContinue, isDisabled }) => [
  { type: 'light-grey', buttonIcon: faArrowLeft, action: onBack },
  { name: 'Save & Continue', type: 'black', isDisabled, action: onContinue },
]
