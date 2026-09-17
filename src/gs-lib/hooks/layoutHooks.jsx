import React, { useEffect, useRef, useState } from "react"

import { faChevronDown, faChevronUp, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"


export const useCollapsable = (collapsed = false, animate = true) => {
  const [hide, setHide] = useState(collapsed);
  const element = useRef();
  const [height, setHeight] = useState(
    animate ? element?.current?.firstChild?.clientHeight : "auto",
  );

  useEffect(() => {
    const el = element?.current?.firstChild;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const h = element?.current?.firstChild?.clientHeight;
      if (h != 0) {
        setHeight(h);
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const defaultStyle = {
    overflow: "hidden",
    flexGrow: 0,
    flexShrink: 0,
    transition: "height .3s ease-in-out",
  };

  const style = hide
    ? { ...defaultStyle, height: 0 }
    : { ...defaultStyle, height: height ?? "auto" };

  const toggleLabel = hide ? "Show" : "Hide";

  const toggleIcon = hide ? faEye : faEyeSlash;

  const toggleArrow = hide ? faChevronDown : faChevronUp;

  const animated = (child) => {
    return (
      <div ref={element} style={style}>
        {!hide || animate ? child : null}
      </div>
    );
  };

  const toggleHide = () => {
    setHide(!hide);
  };

  return [
    style,
    toggleHide,
    toggleLabel,
    toggleIcon,
    toggleArrow,
    setHide,
    hide,
    animated,
    element,
  ];
};