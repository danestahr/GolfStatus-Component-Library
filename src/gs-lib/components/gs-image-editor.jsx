import React, { useEffect, useState, useRef } from "react";
import "./gs-image-editor.scss";
import {
  faAlignCenter,
  faArrowsAlt,
  faCompressArrowsAlt,
  faCrop,
  faExpandArrowsAlt,
  faEyeDropper,
  faFill,
  fas
} from "@fortawesome/free-solid-svg-icons";
import GSButton from "./gs-button";
import GSActionBar from "./gs-action-bar";

/**
 * A component to edit images before sending to the api
 * 
 * @typedef Properties
 * @type {object}
 * 
 * 
 * @property {string} source source of the image
 * 
 * @property {function} setCroppedDataURL set the cropped image as data url
 * 
 * @property {function} setCroppedBlob set the cropped data as blob
 * 
 * @property {number} startX x coordinate to start on
 * 
 * @property {number} startY y coordinate to start on
 * 
 * @property {number} croppedHeight height of cropped image
 * 
 * @property {number} croppedWidth width of cropped image
 * 
 * @property {number} maxheight maximum height that cropper can grow to
 * 
 * @property {number} maxWidth maximum width that cropper can grow to
 * 
 * @property {number} minHeight minimum height of cropped image
 * 
 * @property {number} minWidth minimum width of cropped image
 * 
 * @property {Boolean} resizeEnabled allow image to be resized
 * 
 * @property {number} ratio aspect ratio of image (width / height)
 * 
 * @property {object} style style object for component styling
 * 
 *
 * @param {Properties} props source,
    setCroppedDataURL,
    setCroppedBlob,
    startX,
    startY,
    croppedHeight,
    croppedWidth,
    maxheight,
    maxWidth,
    minHeight,
    minWidth,
    resizeEnabled,
    ratio,
    style
 */

export default function GSImageEditor(props) {
  const {
    source,
    setCroppedDataURL,
    setCroppedBlob,
    startX,
    startY,
    croppedHeight,
    croppedWidth,
    maxheight,
    maxWidth,
    minHeight,
    minWidth,
    resizeEnabled,
    ratio,
    style
  } = props;

  const [canvasX, setCanvasX] = useState(startX ? startX : 0);
  const [canvasY, setCanvasY] = useState(startY ? startY : 0);

  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const [canMove, setCanMove] = useState(false);
  const [canResize, setCanResize] = useState(false);

  const [touchEvent, setTouchEvent] = useState({ x: 0, y: 0 });

  const [ready, setReady] = useState(false);
  const [sourceRatio, setSourceRatio] = useState(0);

  const [fit, setFit] = useState("crop");
  const [dropperEnabled, setDropperEnabled] = useState(false);
  const [padding, setPadding] = useState(0);

  const [background, setBackground] = useState("transparent");

  const editor = useRef();
  const fullImageCanvas = useRef();
  const editorCanvas = useRef();
  const xyResize = useRef();
  const sourceEditImage = useRef();

  const drawOnCanvas = (cWidth, cHeight, cx, cy) => {
    const resize = xyResize.current;
    const canvas = editorCanvas.current;
    const fullcanvas = fullImageCanvas.current;
    const image = sourceEditImage.current;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const fullctx = fullcanvas.getContext("2d");

    const widthImageRatio = image.naturalWidth / image.width;
    const heightImageRatio = image.naturalHeight / image.height;

    canvas.width = cWidth;
    canvas.height = cHeight;
    canvas.style.top = `${cy}px`;
    canvas.style.left = `${cx}px`;

    const fullScaleWidth = cWidth * widthImageRatio;
    const fullScaleHeight = cHeight * heightImageRatio;
    fullcanvas.width = fullScaleWidth > minWidth ? fullScaleWidth : minWidth;
    fullcanvas.height =
      fullScaleHeight > minHeight ? fullScaleHeight : minHeight;

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    fullctx.fillStyle = background;
    fullctx.fillRect(0, 0, fullcanvas.width, fullcanvas.height);

    drawImage(image, widthImageRatio, heightImageRatio, canvas, ctx, cx, cy);

    drawFullImage(
      image,
      widthImageRatio,
      heightImageRatio,
      fullcanvas,
      fullctx,
      cx,
      cy
    );

    if (resize) {
      const resizeTop = cy + cHeight - (resize.clientHeight + 8);
      const resizeLeft = cx + cWidth - (resize.clientWidth + 8);
      resize.style.top = `${resizeTop}px`;
      resize.style.left = `${resizeLeft}px`;
    }

    if (fullScaleHeight !== 0 && fullScaleHeight !== 0 && !ready) {
      setReady(true);
    }
  };

  const getImageScale = () => {
    const image = sourceEditImage.current;
    const widthImageScale = image.naturalWidth / image.width;
    const heightImageScale = image.naturalHeight / image.height;
    return { width: widthImageScale, height: heightImageScale };
  };

  const drawImage = (
    image,
    widthImageRatio,
    heightImageRatio,
    canvas,
    ctx,
    cx,
    cy
  ) => {
    if (fit === "crop") {
      let x = cx * widthImageRatio
      let y = cy * heightImageRatio
      let width = canvas.clientWidth * widthImageRatio
      let height = canvas.clientHeight * heightImageRatio

      ctx.drawImage(
        image,
        x ,
        y ,
        width ,
        height ,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else if (fit === "fill") {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    } else if (fit === "center") {
      const natW = image.naturalWidth;
      const natH = image.naturalHeight;
      const natRatio = natW / natH
      const widthCenterImageRatio = natW / canvas.width;
      const heightCenterImageRatio = natH / canvas.height;
      if (widthCenterImageRatio > heightCenterImageRatio) {
        let canvWidth = image.naturalWidth / widthCenterImageRatio;

        let doublepad = padding * 2;

        let paddedLeft = 0 + padding
        let paddedWidth = canvWidth - doublepad
        let canvHeight = paddedWidth / natRatio
        let paddedHeight = canvHeight;
        let paddedTop  = ((canvas.height - paddedHeight) / 2)
        
        ctx.drawImage(
          image,
          0,
          0,
          image.naturalWidth,
          image.naturalHeight,
          paddedLeft,
          paddedTop,
          paddedWidth,
          paddedHeight
        );
      } else {
        let canvHeight = image.naturalHeight / heightCenterImageRatio

        let doublepad = padding * 2;

        let paddedHeight = canvHeight - doublepad;
        let paddedTop  = 0 + padding
        const canvWidth = paddedHeight * natRatio
        let paddedWidth = canvWidth;
        let paddedLeft = ((canvas.width - paddedWidth) / 2)
        

        ctx.drawImage(
          image,
          0,
          0,
          image.naturalWidth,
          image.naturalHeight,
          paddedLeft,
          paddedTop,
          paddedWidth,
          paddedHeight
        );
      }
    }
  };

  const drawFullImage = (
    image,
    widthImageRatio,
    heightImageRatio,
    canvas,
    ctx,
    cx,
    cy
  ) => {
    const x = cx * widthImageRatio;
    const y = cy * heightImageRatio;
    let width =
      canvas.clientWidth < image.naturalWidth
        ? canvas.clientWidth
        : image.naturalWidth;
    let height =
      canvas.clientHeight < image.naturalHeight
        ? canvas.clientHeight
        : image.naturalHeight;

    if (fit === "crop") {
      if (canvas.clientHeight > image.naturalHeight) {
        let r = image.naturalHeight / canvas.clientHeight;
        width = width * r;
      }
      ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else if (fit === "fill") {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    } else if (fit === "center") {
      const natW = image.naturalWidth;
      const natH = image.naturalHeight;
      const natRatio = natW / natH
      const widthCenterImageRatio = natW / canvas.width;
      const heightCenterImageRatio = natH / canvas.height;
      if (widthCenterImageRatio > heightCenterImageRatio) {
        let canvWidth = image.naturalWidth / widthCenterImageRatio;

        let doublepad = padding * 2;

        let paddedLeft = 0 + padding
        let paddedWidth = canvWidth - doublepad
        let canvHeight = paddedWidth / natRatio
        let paddedHeight = canvHeight;
        let paddedTop  = ((canvas.height - paddedHeight) / 2)
        
        ctx.drawImage(
          image,
          0,
          0,
          image.naturalWidth,
          image.naturalHeight,
          paddedLeft,
          paddedTop,
          paddedWidth,
          paddedHeight
        );
      } else {
        let canvHeight = image.naturalHeight / heightCenterImageRatio

        let doublepad = padding * 2;

        let paddedHeight = canvHeight - doublepad;
        let paddedTop  = 0 + padding
        const canvWidth = paddedHeight * natRatio
        let paddedWidth = canvWidth;
        let paddedLeft = ((canvas.width - paddedWidth) / 2)
        

        ctx.drawImage(
          image,
          0,
          0,
          image.naturalWidth,
          image.naturalHeight,
          paddedLeft,
          paddedTop,
          paddedWidth,
          paddedHeight
        );
      }
    }
  };

  const mouseDown = e => {
    if (dropperEnabled) {
      let c = editorCanvas.current.getContext("2d", {
        willReadFrequently: true
      });
      try {
        let p = c.getImageData(
          e.nativeEvent.layerX,
          e.nativeEvent.layerY,
          1,
          1
        );
        var data = p.data;
        setBackground(
          `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`
        );
      } catch (error) {
        console.log(error);
      }
      return;
    }
    setCanMove(true);
    if (e.touches) {
      setTouchEvent(e.touches[0]);
      e.preventDefault();
    }
  };

  const mouseUp = e => {
    setCanMove(false);
    setCanResize(false);
    setReady(false);
  };

  const resizeMouseDown = e => {
    setCanResize(true);
    if (e.touches) {
      setTouchEvent(e.touches[0]);
      e.preventDefault();
    }
  };

  const resizeMouseUp = e => {
    setCanResize(false);
    setReady(false);
  };

  const getCropData = () => {
    const canvas = fullImageCanvas.current;
    if (setCroppedDataURL && canvas) {
      setCroppedDataURL(canvas?.toDataURL?.());
    }
    if (setCroppedBlob && canvas) {
      canvas.toBlob(function(b) {
        setCroppedBlob(b);
      });
    }
  };

  const mouseMove = e => {
    if (canMove) {
      if (e.movementX || e.movementY) {
        moveCanvas(e.movementX, e.movementY);
      } else if (e.touches) {
        const touch = e.touches[0];
        moveCanvas(
          touch.pageX - touchEvent.pageX,
          touch.pageY - touchEvent.pageY
        );
        setTouchEvent(touch);
        e.preventDefault();
      }
    }
    if (canResize) {
      if (e.movementX || e.movementY) {
        resizeCanvas(e.movementX, e.movementY);
      } else if (e.touches) {
        const touch = e.touches[0];
        resizeCanvas(
          touch.pageX - touchEvent.pageX,
          touch.pageY - touchEvent.pageY
        );
        setTouchEvent(touch);
      }
    }
  };

  const moveCanvas = (movementX, movementY) => {
    const image = sourceEditImage.current;
    const moveToX = canvasX + movementX;
    const moveToY = canvasY + movementY;
    const maxX = image.width - canvasWidth;
    const maxY = image.height - canvasHeight;
    if (moveToX >= 0 && moveToX <= maxX) {
      setCanvasX(moveToX);
    }
    if (moveToY >= 0 && moveToY <= maxY) {
      setCanvasY(moveToY);
    }
  };

  const resizeCanvas = (movementX, movementY) => {
    const image = sourceEditImage.current;
    let newHeight = canvasHeight + movementY;
    let newWidth = canvasWidth + movementX;
    if (ratio) {
      if (sourceRatio < ratio) {
        newHeight = newWidth / ratio;
      } else {
        newWidth = newHeight * ratio;
      }
    }
    const scale = getImageScale();
    if (
      (newHeight * scale.height >= minHeight || minHeight === undefined) &&
      newHeight + canvasY < image.height
    ) {
      setCanvasHeight(newHeight);
    }
    if (
      (newWidth * scale.height >= minWidth || minWidth === undefined) &&
      newWidth + canvasX < image.width
    ) {
      setCanvasWidth(newWidth);
    }
  };

  const mouseLeave = e => {
    setCanMove(false);
    setCanResize(false);
  };

  const getImageSize = () => {
    const fullcanvas = fullImageCanvas.current;
    if (fullcanvas) {
      return {
        width: fullcanvas.width,
        height: fullcanvas.height,
        ratio:
          fullcanvas.height > 0
            ? (fullcanvas.width / fullcanvas.height).toFixed(2)
            : 0
      };
    }
    return { width: 0, height: 0, ratio: 0 };
  };

  useEffect(() => {
    drawOnCanvas(canvasWidth, canvasHeight, canvasX, canvasY);
  }, [canvasHeight, canvasWidth, canvasX, canvasY, background, fit, ready]);

  useEffect(() => {
    if (ready) {
      getCropData();
    }
  }, [ready]);

  const imageLoaded = e => {
    const scale = getImageScale();
    let initialWidth = croppedWidth
      ? croppedWidth / scale.width
      : e.currentTarget.width;
    let initialHeight = croppedHeight
      ? croppedHeight / scale.height
      : e.currentTarget.height;
    if (ratio) {
      const currentRatio = initialWidth / initialHeight;
      setSourceRatio(currentRatio);
      if (currentRatio > ratio) {
        const newWidth = initialHeight * ratio;
        const offset = (initialWidth - newWidth) / 2;
        initialWidth = newWidth;
        if (offset > 0) {
          setCanvasX(offset);
        }
      } else {
        const newHeight = initialWidth / ratio;
        const offset = (initialHeight - newHeight) / 2;
        initialHeight = newHeight;
        if (offset > 0) {
          setCanvasY(offset);
        }
      }
    }
    setCanvasWidth(initialWidth);
    setCanvasHeight(initialHeight);
  };

  const imageSize = getImageSize();

  const setImageBackground = color => {
    setBackground(color);
    setReady(false);
  };

  const setImageFit = fit => {
    if (fit === "crop") {
      sourceEditImage.current.src = source;
    } else {
      let initialWidth = editor?.current?.clientWidth;
      let initialHeight = initialWidth / ratio;
      setCanvasWidth(initialWidth);
      setCanvasHeight(initialHeight);
      setCanvasX(0);
      setCanvasY(0);
    }
    setFit(fit);
    setReady(false);
  };

  const resizeable = () => {
    return resizeEnabled && fit === "crop";
  };

  const getBackgrounds = () => {
    let backgrounds = [
      {
        actionIcon: faFill,
        type: "transparent-pattern ",
        actionClick: () => {
          setImageBackground("rgba(0,0,0,0)");
        }
      },
      {
        actionIcon: faFill,
        type: "fill-black ",
        actionClick: () => {
          setImageBackground("#000");
        }
      },
      {
        actionIcon: faFill,
        type: "black-border fill-white ",
        actionClick: () => {
          setImageBackground("#fff");
        }
      },
      {
        actionIcon: faEyeDropper,
        type: ` ${
          dropperEnabled ? "black-border" : "white transparent-border"
        }`,
        actionClick: () => {
          setDropperEnabled(prevValue => !prevValue);
        }
      }
    ];
    return backgrounds;
  };

  const padOptions = [{pad: 16, label: "S"},{pad: 36, label: "M"},{pad: 56, label: "L"}, {pad: 0, label: "None"}]

  const getPaddingActions = () => {
    return padOptions.map?.((option, index) => {
      return {
        title: padOptions[index]?.label,
        type: ` ${padding === padOptions[index].pad ? "black-border" : "white transparent-border"}`,
        actionClick: () => {
          setPadding(padOptions[index].pad);
          setReady(false);
        }
      }
    });
  };

  const getFitOptions = () => {
    let options = [
      {
        title: "Crop",
        type: ` mobile-icon ${fit === "crop" ? "black-border" : "white"}`,
        actionClick: () => {
          setImageFit("crop");
        },
        actionIcon: faCrop
      },
      {
        title: "Fill",
        type: ` mobile-icon ${
          fit === "fill" ? "black-border" : "white transparent-border"
        }`,
        actionClick: () => {
          setImageFit("fill");
        },
        actionIcon: faExpandArrowsAlt
      },
      {
        title: "Center",
        type: ` mobile-icon ${
          fit === "center" ? "black-border" : "white transparent-border"
        }`,
        actionClick: () => {
          setImageFit("center");
        },
        actionIcon: faCompressArrowsAlt
      }
    ];
    return options;
  };

  return (
    <gs-image-editor style={style} ref={editor}>
      <div
        id="image-container"
        className="image"
        onMouseMove={mouseMove}
        onMouseUp={resizeMouseUp}
        onMouseLeave={mouseLeave}
        onTouchMove={mouseMove}
        onTouchEnd={resizeMouseUp}
      >
        <img
          className={fit}
          draggable={false}
          id="source-edit-image"
          src={source}
          onLoad={imageLoaded}
          ref={sourceEditImage}
        ></img>
        <canvas
          className={`${fit} ${dropperEnabled ? "dropper" : ""}`}
          onMouseDown={mouseDown}
          onMouseUp={mouseUp}
          onTouchStart={mouseDown}
          onTouchEnd={mouseUp}
          id="editor-canvas"
          ref={editorCanvas}
        />
        {resizeable() && (
          <div
            id="xy-resize"
            ref={xyResize}
            className="resize"
            onMouseDown={resizeMouseDown}
            onTouchStart={resizeMouseDown}
          >
            <GSButton type="white" buttonIcon={faArrowsAlt}></GSButton>
          </div>
        )}
      </div>
      {imageSize.ratio ? (
        <div className="image-info">
          <div>{`${imageSize.width} x ${imageSize.height}px / ${imageSize.ratio}:1`}</div>
        </div>
      ) : (
        <div></div>
      )}
      <div className="background-colors">
        <GSActionBar header="Background Color" pageActions={getBackgrounds()} />
      </div>

      {ratio ? (
        <div className="background-colors">
          <GSActionBar header="Image Fit" pageActions={getFitOptions()} />
        </div>
      ) : null}
      {fit === "center" ? (
        <div className="background-colors">
          <GSActionBar header="Spacing" pageActions={getPaddingActions()} />
        </div>
      ) : null}

      <canvas id="full-image-canvas" ref={fullImageCanvas}></canvas>
    </gs-image-editor>
  );
}
