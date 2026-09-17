import React, { useEffect, useRef, useState } from "react";
import "./gs-file-select-item.scss";
import {
  faExclamationCircle,
  faFileExcel,
  faFilePdf,
  faFileWord,
  faFile,
  faPen,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GSActionBar from "./gs-action-bar";
import GSItemInfo from "./gs-item-info";

/**
 * a component that will be displayed in a GSFileSelect to represent a file.
 * 
 *
 * @param {Properties} props item,
    removeItem,
    minWidth,
    minHeight,
    minDimension,
    ratio,
    editImage,
    warningClicked,
    failedValidation, 
    style
 */

export default function GSFileSelectItem(props) {
  const {
    item,
    removeItem,
    minWidth,
    minHeight,
    minDimension,
    ratio,
    editImage,
    warningClicked,
    failedValidation,
    disabled,
    style,
    fieldValid, 
    imageFailed
  } = props;

  const [image, setImage] = useState({
    width: 0,
    height: 0,
    aspect: 0,
    valid: true
  });

  const isVideo = item => {
    if (item.type) {
      return item.type === "video/mp4";
    }
    return false;
  };

  const isPhoto = item => {
    if (item && item.type) {
      return item?.type?.startsWith?.("image");
    }
    return false;
  };

  const isXL = item => {
    if (item.type) {
      return (
        item.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    }
    return false;
  };

  const isPDF = item => {
    if (item.type) {
      return item.type === "application/pdf";
    }
    return false;
  };

  const isDoc = item => {
    if (item.type) {
      return (
        item.type === "application/msword" ||
        item.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    }
    return false;
  };

  const isOther = item => {
    return (
      !isXL(item) &&
      !isPDF(item) &&
      !isDoc(item) &&
      !isPhoto(item) &&
      !isVideo(item)
    );
  };

  const getThumb = file => {
    if (file.url) {
      return file.url;
    }
    if (typeof file === "File" || file instanceof File) {
      return URL.createObjectURL(file);
    }
  };

  const warnings = useRef([]);

  useEffect(() => {
    if(fieldValid){
      if(!image.valid){
        failedValidation();
      }
    }
  },[fieldValid])

  const ImageLoaded = e => {
    const { naturalHeight, naturalWidth } = e.target;

    console.log(`image loaded ${naturalHeight} ${naturalWidth}`);
    const validation = checkValidation(naturalWidth, naturalHeight);
    let isValid = image.valid;
    if (validation.length > 0) {
      if (image.valid) {
        isValid = false;
        if (failedValidation) {
          failedValidation(validation);
        }
      }
    } else {
      isValid = true;
    }
    if (
      image.height !== naturalHeight ||
      image.width !== naturalWidth ||
      image.valid !== isValid
    ) {
      setImage({
        width: naturalWidth,
        height: naturalHeight,
        aspect: naturalWidth / naturalHeight,
        valid: isValid
      });
    }
  };

  const getImage = () => {
    return (
      <div className="file-select-image">
        <img onLoad={ImageLoaded} onError={() => {imageFailed?.()}} src={getThumb(item)}></img>
      </div>
    );
  };

  const checkValidation = (width, height) => {
    const warn = [];
    if (isPhoto(item)) {
      const aspectRatio = width / height;
      if (minWidth && width < minWidth) {
        warn.push(
          `Image does not meet minimum width requirement of ${minWidth}`
        );
      }
      if (minHeight && height < minHeight) {
        warn.push(
          `Image does not meet minimum height requirement of ${minHeight}`
        );
      }
      if (minDimension && height < minDimension && width < minDimension) {
        warn.push(
          `Image does not meet minimum height or width requirement of ${minDimension}`
        );
      }
      if (ratio && aspectRatio && ratio.toFixed(1) !== aspectRatio.toFixed(1)) {
        warn.push(`Image ratio does not meet requirement of ${ratio}:1`);
      }
    } else {
      warnings.current = [];
      return [];
    }
    warnings.current = warn;
    return warn;
  };

  const canEdit = () => {
    if (editImage) {
      if (isPhoto(item)) {
        if (item.url) {
          return true;
        }
      }
    }
    return false;
  };

  const checkWarning = e => {
    if (warningClicked) {
      warningClicked(e, checkValidation(image.width, image.height));
    }
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
  };

  const getActions = () => {
    let actions = [];

    if (disabled) {
      return actions;
    }

    const photo = isPhoto(item);

    if (!image.valid && photo) {
      actions.push({
        type: "orange",
        buttonTitle: "Fix",
        actionClick: checkWarning
      });
    } else if (canEdit() && photo) {
      actions.push({
        type: "transparent",
        actionIcon: faPen,
        actionClick: e => {
          editImage(image);
          e.stopPropagation();
        }
      });
    }

    actions.push({
      type: "transparent",
      actionIcon: faTrash,
      actionClick: e => {
        removeItem(item);
        e.stopPropagation();
      }
    });

    return actions;
  };

  const getFileHeader = () => {
    const imageInfo = (
      <div className="image-resolution">{`${image.width} x ${
        image.height
      }px / ${image.aspect.toFixed(2)}:1`}</div>
    );

    const error = (
      <div className="warning">
        {checkValidation(image.width, image.height).join(", ")}
      </div>
    );

    if (isPhoto(item)) {
      return (
        <GSItemInfo
          icon={!image.valid ? faExclamationCircle : undefined}
          value={image.valid ? imageInfo : error}
        ></GSItemInfo>
      );
    }

    return <GSItemInfo value={item.name}></GSItemInfo>;
  };

  return (
    <gs-file-select-item style={style}>
      <div className="file-select-item">
        {isVideo(item) && <video controls src={getThumb(item)}></video>}
        {isPhoto(item) && getImage()}
        {isXL(item) && (
          <div className="select-document excel">
            <div className="icon">
              <FontAwesomeIcon icon={faFileExcel}></FontAwesomeIcon>
            </div>
          </div>
        )}
        {isPDF(item) && (
          <div className="select-document pdf">
            <div className="icon">
              <FontAwesomeIcon icon={faFilePdf}></FontAwesomeIcon>
            </div>
          </div>
        )}
        {isDoc(item) && (
          <div className="select-document doc">
            <div className="icon">
              <FontAwesomeIcon icon={faFileWord}></FontAwesomeIcon>
            </div>
          </div>
        )}
        {isOther(item) && (
          <div className="select-document">
            <div className="icon">
              <FontAwesomeIcon icon={faFile}></FontAwesomeIcon>
            </div>
          </div>
        )}
        <GSActionBar
          header={getFileHeader()}
          pageActions={getActions()}
        ></GSActionBar>
      </div>
    </gs-file-select-item>
  );
}
