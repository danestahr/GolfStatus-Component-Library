import React from "react";
import "./gs-date-filter.scss";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import GSField from "./gs-field";

/**
 * date filter
 * 
 *
 * @param {Properties} props startDate, startDateChanged, clearStartDate, endDate, endDateChanged, clearEndDate, style
 */

export default function GSDateFilter(props) {
  const {startDate, startDateChanged, clearStartDate, endDate, endDateChanged, clearEndDate, style, fieldStyle} = props
  return (
    <gs-date-filter style={style}>
      <GSField
        label="From"
        value={startDate}
        onChange={startDateChanged}
        rightIcon={faTimesCircle}
        rightIconClick={clearStartDate}
        isEditable={true}
        type="date"
        style={fieldStyle}
      ></GSField>
      <GSField
        label="To"
        type="date"
        value={endDate}
        onChange={endDateChanged}
        rightIcon={faTimesCircle}
        rightIconClick={clearEndDate}
        isEditable={true}
        style={fieldStyle}
      ></GSField>
    </gs-date-filter>
  );
}
