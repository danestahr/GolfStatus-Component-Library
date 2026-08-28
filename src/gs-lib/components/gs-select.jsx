import React, { Component } from 'react'
import Select, { components } from 'react-select';
import AsyncSelect from 'react-select/async'
import './gs-select.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { grey50 } from '../helpers/Theme';


/**
 * A drop down component that utilizes react-select
 *
 * @param {Properties} props options, selectedOption
 */





export default class GSSelect extends Component {

  constructor(props) {
    super(props);
    
    this.selectType = (props.isAsync) ? AsyncSelect : Select;
    this.isMultiSelect = props.isMulti;
  }

  render() {
    const {style, selectedOption, noOptionsMessage} = this.props
    const DropdownIndicator = ({ innerRef, innerProps}) => {
      return (
        <div className="select-dropdown-indicator" {...innerProps} ref={innerRef}>
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      );
    };
    
    const MultiValueLabel = props => {
      return (
        <components.MultiValueLabel {...props}>
          {props.data.label}
        </components.MultiValueLabel>
      );
    }

    const MultiValueRemove = props => {
      return (
        <components.MultiValueRemove {...props}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </components.MultiValueRemove>
      )
    }

    const ClearIndicator = ({ innerRef, innerProps}) => {
      return (
        <div className="select-clear-indicator" {...innerProps} ref={innerRef}>
          <FontAwesomeIcon icon={faTimesCircle} />
        </div>
      );
    };

    const Input = ({ ...rest }) => <components.Input {...rest} autoComplete={this.props?.autocomplete ?? "nope"} />;


    const IndicatorSeparator = props => {
      return <span class="select-indicator-seperator" {...props} />;
    };
  
    const formatOptionLabel = ({ innerRef, innerProps, label, subLabel }) => (
      <div className="custom-select-option">
        <div className="main-select-label">{label}</div>
        {subLabel ?
          <div className="sub-select-label">
            {subLabel}
          </div>
          : ''}
      </div>
    );

    return (
      <gs-select style={style} onClick={this.props.onClick}>
        <this.selectType
          classNamePrefix="gs-select"
          ref={this.props?.selectRef}
          {...this.props}
          value={selectedOption}
          noOptionsMessage={() => noOptionsMessage}
          formatOptionLabel={formatOptionLabel}
          styles={{
            menuPortal: base => ({ ...base, zIndex: 9999 }),
            ...(this.props.styles || {}),
            singleValue: base => ({}),
            // The menu renders in a portal on document.body (menuPortalTarget,
            // used by every caller here), which escapes gs-select.scss's
            // `gs-select .gs-select__option--is-focused` scoping — without an
            // ancestor <gs-select> to match, those rules never apply and
            // react-select falls back to its own default blue "click state"
            // theme colors instead. Setting the option's background directly
            // here works regardless of where the menu portals to.
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused || state.isSelected ? grey50 : 'transparent',
              color: 'inherit',
              ':active': { backgroundColor: grey50 },
            }),
          }}
          components={{ Input, MultiValueLabel, MultiValueRemove, ClearIndicator, DropdownIndicator }} 
          style={style}/>
      </gs-select>
    )
  }  

}