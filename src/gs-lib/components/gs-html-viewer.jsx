import React from "react";
import "./gs-html-viewer.scss";

/**
 * View to display html.
 * 
 * @typedef Properties
 * @type {object}
 * 
 * @property {string} [html = ""] the html string to display
 * 
 * @property {object} style the style for this component
 * 
 * @property {object} htmlContainerStyle the style for the container setting the html
 *
 * @param {Properties} props html, style
 */

const GSHTMLViewer = (props) => {
  const { html, style, htmlContainerStyle } = props ?? {};

  return (
    <gs-html-viewer style={style}>
      <div
        style={htmlContainerStyle}
        dangerouslySetInnerHTML={{
          __html: html
        }}
      ></div>
    </gs-html-viewer>
  );
};

export default GSHTMLViewer;
