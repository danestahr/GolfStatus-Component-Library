import React, { useEffect, useState } from "react";

const screenSizes = [
  {
    minWidth: 3840,
    minHeight: 2160,
    category: "monitor",
    type: "UHD"
  },
  {
    minWidth: 1920,
    minHeight: 1080,
    maxWidth: 3840,
    maxHeight: 2160,
    category: "monitor",
    type: "FHD"
  },
  {
    minWidth: 1280,
    minHeight: 720,
    maxWidth: 1920,
    maxHeight: 1080,
    category: "monitor",
    type: "HD"
  },
  {
    minWidth: 1100,
    minHeight: 600,
    maxWidth: 1280,
    maxHeight: 720,
    category: "monitor",
    type: "HD"
  },
  {
    minWidth: 600,
    maxWidth: 1100,
    category: "tablet",
    type: "tablet"
  },
  {
    minWidth: 400,
    maxWidth: 600,
    category: "phone",
    type: "largePhone"
  },
 {
    minWidth: 0,
    maxWidth: 400,
    category: "phone",
    type: "smallPhone"
  }
]

export const useMediaQuery = props => {
  const [widthMatches, setWidthMatches] = useState([]);
  const [heightMatches, setHeightMatches] = useState([]);
  const [innerWidth, setInnerWidth] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);

  const getWidthMatches = width => {
    const matches = screenSizes.filter?.(option => {
      const maxWidth =  option?.maxWidth ?? 10000
      const minWidth = option?.minWidth ?? 0
      return width <= maxWidth && width >= minWidth;
    });
    return matches;
  };

  const getHeightMatches = height => {
    const matches = screenSizes.filter?.(option => {
      const maxHeight =  option?.maxHeight ?? 10000
      const minHeight = option?.minHeight ?? 0
      return height <= maxHeight && height >= minHeight;
    });
    return matches;
  };

  const getMaxZoom = (minWidth) => {
    const ratio = innerWidth / minWidth
    return Math.min(ratio, 1)
  }

  const windowRezized = e => {
    setWidthMatches(getWidthMatches(e?.target?.innerWidth));
    setHeightMatches(getHeightMatches(e?.target?.innerHeight));
    setInnerHeight(e?.target?.innerHeight)
    setInnerWidth(e?.target?.innerWidth)
  };

  useEffect(() => {
    setWidthMatches(getWidthMatches(window.innerWidth));
    setHeightMatches(getHeightMatches(window.innerHeight));
    setInnerHeight(window.innerHeight)
    setInnerWidth(window.innerWidth)
    window.addEventListener("resize", windowRezized);
    return () => window.removeEventListener("resize", windowRezized);
    // eslint-disable-next-line
  }, []);

  const isPhone = () => {
    return widthMatches.find(o => o.category === "phone")
  }
  const isTablet = () => {
    return widthMatches.find(o => o.category === "tablet")
  }
  const isMonitor = () => {
    return widthMatches.find(o => o.category === "monitor")
  }

  return {widthMatches, heightMatches, innerWidth, innerHeight, isPhone, isTablet, isMonitor, getMaxZoom};
};
