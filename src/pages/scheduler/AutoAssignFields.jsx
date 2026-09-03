import GSFormSection from '../../gs-lib/components/gs-form-section'
import GSSelect from '../../gs-lib/components/gs-select'
import GStoggle from '../../gs-lib/components/gs-toggle'

// Auto Assign Holes' own form fields — Assignment Type is always shown;
// the "distribute evenly" toggle only applies once the active round has
// other rounds linked to it (see roundNumberMates in TournamentSchedulerPage),
// since with nothing to split across there's nothing for it to do.
export default function AutoAssignFields({
  options,
  assignmentType,
  onChangeAssignmentType,
  showDistributeToggle,
  evenlyDistribute,
  onToggleEvenlyDistribute,
}) {
  return (
    <GSFormSection
      type="vertical xx-large-gap"
      fields={[
        {
          label: 'Assignment Type',
          required: true,
          isEditable: true,
          customView: true,
          value: (
            <GSSelect
              options={options}
              selectedOption={assignmentType}
              onChange={onChangeAssignmentType}
              placeholder="Select an Assignment Type…"
              isSearchable={false}
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          ),
        },
        ...(showDistributeToggle ? [{
          label: 'Balance Assignments',
          description: 'Evenly assign players and teams for a balanced spread across rounds.',
          isEditable: true,
          customView: true,
          value: (
            <GStoggle
              value={evenlyDistribute}
              onClick={onToggleEvenlyDistribute}
              trueDescription="Yes"
              falseDescription="No"
            />
          ),
        }] : []),
      ]}
    />
  )
}
