import React, { useState, useEffect, useRef } from "react";
import "./gs-address-form.scss";

import { states } from "../helpers/States";
import { countries } from "../helpers/Countries";
import GSInput from "./gs-input";
import GSSelect from "./gs-select";
/**
 * Address form that can be used to collect address information
 *
 * @typedef Properties
 *
 * @type {object}
 *
 * @property {string} country
 *
 * @property {JSX.Element} onChange function to run when any part of the address changes
 *
 * @property {Array} requiredFields array of fields that will be required
 *
 * @property {string} address
 *
 * @property {string} address2
 *
 * @property {string} city
 *
 * @property {string} state
 *
 * @property {string} postal
 *
 * @property {object} style style for the form
 *
 *
 * @param {Properties} props style, country, onChange, address2, requiredFields, address, city, state, postal
 */

export default function AddressForm(props) {
  const [availableStates, setAvailableStates] = useState([]);
  const {
    style,
    country,
    onChange,
    address2,
    requiredFields,
    address,
    city,
    state,
    postal
  } = props;

  useEffect(() => {
    if (country === "USA" || country === "CA") {
      setAvailableStates(states[country]);
    }
  }, [country]);

  const selectOption = (option, action, property) => {
    if (action === "select-option") {
      onChange(option.value, property);
    }
  };

  const hasAddress2 = () => {
    return address2 !== undefined;
  };

  const getAsterisk = field => {
    if (requiredFields?.findIndex?.(f => field === f) >= 0) {
      return "*";
    }
    return "";
  };

  const isUSAOrCanada = () => {
    return country === "USA" || country === "CA";
  };

  const inputTouched = () => {
    props.inputTouched?.();
  };

  const stateFilter = (option, input) => {
    const isAbbrev = availableStates?.find?.(
      s => s.value === input?.toUpperCase?.()
    );
    if (isAbbrev) {
      return option.value === input.toUpperCase?.();
    } else {
      return option?.label?.toLowerCase?.()?.includes?.(input?.toLowerCase?.());
    }
  };

  return (
    <gs-address-form style={style}>
      <div className="country">
        <GSSelect
          placeholder={`Select Country${getAsterisk("country")}`}
          options={countries.filter(country => country.available)}
          selectedOption={countries.find(c => c.value === country)}
          onChange={(inputValue, { action }) =>
            selectOption(inputValue, action, "country")
          }
          style={style}
        ></GSSelect>
      </div>
      <div className="address">
        <GSInput
          placeholder={`Address Line 1${getAsterisk("address")}`}
          textValue={address}
          onBlur={inputTouched}
          onChange={e => {
            onChange(e.target.value, "address");
          }}
          style={style}
        ></GSInput>
        {hasAddress2() && (
          <GSInput
            placeholder={`Address Line 2${getAsterisk("address2")}`}
            textValue={address2}
            onChange={e => {
              onChange(e.target.value, "address2");
            }}
            style={style}
          ></GSInput>
        )}
      </div>
      <div className={`city-state-zip`}>
        <GSInput
          placeholder={`City${getAsterisk("city")}`}
          textValue={city}
          onBlur={inputTouched}
          onChange={e => {
            onChange(e.target.value, "city");
          }}
          style={style}
        ></GSInput>
        {isUSAOrCanada() ? (
          <GSSelect
            placeholder={`State/Province${getAsterisk("state")}`}
            options={availableStates}
            selectedOption={
              availableStates.find(s => s?.value === state || s?.label?.toLowerCase?.() === state?.toLowerCase()) || null
            }
            onChange={(inputValue, { action }) =>
              selectOption(inputValue, action, "state")
            }
            style={style}
            filterOption={stateFilter}
          ></GSSelect>
        ) : (
          <GSInput
            placeholder={`State/Province`}
            textValue={state}
            onBlur={inputTouched}
            onChange={e => {
              onChange(e.target.value, "state");
            }}
            style={style}
          ></GSInput>
        )}
        <GSInput
          placeholder={`Postal Code${getAsterisk("postal")}`}
          textValue={postal}
          onBlur={inputTouched}
          onChange={e => {
            onChange(e.target.value, "postal");
          }}
          style={style}
        ></GSInput>
      </div>
    </gs-address-form>
  );
}
