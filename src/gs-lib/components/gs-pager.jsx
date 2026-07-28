import React, { useState } from "react";
import "./gs-pager.scss";

import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import GSButton from "./gs-button";

/**
 * Pager view that allows you to add multiple views that will show one at a time and allow you to page through them.
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {Array.<JSX.Element>} items :an array the JSX Views to display
 * 
 * @property {function} listItem :the function that returns a view for each item
 * 
 * @property {function} nextButton :the function that returns a title for the next button
 * 
 * @property {function} PreviousButton :the function that returns a title for the previous button
 * 
 * @property {object} style :the style for this component
 *
 * @param {Properties} props :items, listItem, nextButton, previousButton, style
 */

const GSPager = (props) => {
  const { items, listItem, nextButton, previousButton, style } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <gs-pager style={style}>
      <div className="content">
        {items?.map((item, index) => {
          const position =
            index > currentIndex
              ? "right"
              : index < currentIndex
              ? "left"
              : "center";
          return <div key={index} className={`item page-${position}`}>{listItem(item)}</div>;
        })}
      </div>

      <div className="pager">
        {currentIndex > 0 ? (
          <GSButton
            type="grey"
            buttonIcon={faChevronLeft}
            title={previousButton?.(items?.[currentIndex - 1])}
            onClick={() => {
              setCurrentIndex(currentIndex - 1);
            }}
          />
        ) : (
          <div />
        )}

        {currentIndex < items?.length - 1 ? (
          <GSButton
            type="grey"
            rightIcon={faChevronRight}
            title={nextButton?.(items?.[currentIndex + 1])}
            onClick={() => {
              setCurrentIndex(currentIndex + 1);
            }}
          />
        ) : null}
      </div>
    </gs-pager>
  );
};

export default GSPager;
