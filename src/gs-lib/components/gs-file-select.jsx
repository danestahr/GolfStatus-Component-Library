import React, { useEffect, useState } from "react";
import "./gs-file-Select.scss";

import GSItemList from "./gs-item-list";
import GSFileSelectItem from "./gs-file-select-item";
import GSItemInfo from "./gs-item-info";
import {
  faExclamationCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

/**
 * a component that will allow you to select a file from your file system
 * 
 * @typedef Properties
 * @type {object}
 * 
 * 
 * @property {string} id id for the element for DOM
 * 
 * @property {JSX.Element} title title in the select box
 * 
 * @property {string} description description for selection
 * 
 * @property {Boolean} multiple allow multiple files
 * 
 * @property {string} accept files to accept for selection
 * 
 * @property {Array} sourceList list of source files
 * 
 * @property {function} removeSourceItem function to remove file
 * 
 * @property {function} setSelectedFiles function to set files for the selector
 * 
 * @property {function} failedValidation function that runs when file validation fails
 * 
 * @property {Boolean} required selection required
 * 
 * @property {object} style style object for component styling
 *
 * @param {Properties} props
    id,
    title,
    description,
    multiple,
    accept,
    sourceList,
    removeSourceItem,
    setSelectedFiles,
    failedValidation,
    required,
    style,
 */

export default function GSFileSelect(props) {
  const [valid, setValid] = useState(true);
  const {
    id,
    title,
    description,
    multiple,
    accept,
    sourceList,
    removeSourceItem,
    setSelectedFiles,
    failedValidation,
    required,
    style,
    ...rest
  } = props;

  const [fileList, setFileList] = useState([]);
  const keyPress = e => {
    const key = e.key;
    if (key === "Enter") {
      elementClicked();
    }
  };
  const onChange = e => {
    const selectedFiles = Array.from?.(e.target.files)
    const accepted = mimeTypes?.filter?.(t => accept?.includes?.(t.ext))?.map?.(a => a.type)
    const files = selectedFiles?.filter?.(f => accepted?.find?.(a => a === f.type))
    setFileList(files);
    setValid(true);
    if (setSelectedFiles) {
      setSelectedFiles(files);
    }
  };
  const hasItems = () => {
    if (sourceList) {
      return sourceList.length > 0;
    }
    return fileList.length > 0;
  };
  const removeItem = item => {
    const newList = fileList.filter(file => file !== item);
    setFileList(newList);
    if (removeSourceItem) {
      removeSourceItem(item);
    }
  };
  const getFileList = () => {
    if (sourceList) {
      return sourceList;
    }
    return fileList;
  };

  const imageFailedValidation = warn => {
    if (valid) {
      setValid(false);
    }
    if (failedValidation) {
      failedValidation(warn);
    }
  };

  useEffect(() => {
    if (!valid) {
      failedValidation?.();
    }
  })

  const inValid = () => {
    if (required) {
      return fileList.length === 0;
    }
    return required;
  };

  const elementClicked = e => {
    const input = document.getElementById(
      `file-input-select-target-${id ?? ""}`
    );
    if (input && input.click) {
      input.click();
    }
    e?.stopPropagation?.();
  };

  return (
    <gs-file-select
      style={style}
      tabIndex={0}
      onKeyDown={keyPress}
      class={`${valid ? "valid" : "invalid"}`}
    >
      <div
        className={`select-input-container ${required ? "required" : ""}`}
        onClick={elementClicked}
      >
        {!hasItems() ? (
          <div className="title">
            {title ? title : "Select a file or drag files here"}
          </div>
        ) : null}

        {hasItems() && (
          <GSItemList
            items={getFileList()}
            listItem={item => (
              <GSFileSelectItem
                item={item}
                removeItem={removeItem}
                failedValidation={imageFailedValidation}
                {...rest}
              ></GSFileSelectItem>
            )}
            type="grid"
          ></GSItemList>
        )}
        {description && <div className="description">{description}</div>}
        <input
          id={`file-input-select-target-${id ?? ""}`}
          type="file"
          accept={accept}
          multiple={multiple}
          onClick={e => {
            e?.stopPropagation?.();
          }}
          onChange={onChange}
        ></input>
      </div>
      {inValid() && (
        <GSItemInfo
          icon={faExclamationCircle}
          description="This file is required"
        ></GSItemInfo>
      )}
    </gs-file-select>
  );
}

//add MIME types here when needed... full list at https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types

export const mimeTypes = [
  {
    ext: ".apng",
    type: "image/apng",
  },
  {
    ext: ".aac",
    type: "audio/aac",
  },
  {
    ext: ".avif",
    type: "image/avif",
  },
  {
    ext: ".avi",
    type: "video/x-msvideo",
  },
  {
    ext: ".bmp",
    type: "image/bmp",
  },
  {
    ext: ".csv",
    type: "text/csv",
  },
  {
    ext: ".doc",
    type: "application/msword",
  },
  {
    ext: ".docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    ext: ".gif",
    type: "image/gif",
  },
  {
    ext: ".htm",
    type: "text/html",
  },
  {
    ext: ".html",
    type: "text/html",
  },
  {
    ext: ".ico",
    type: "image/vnd.microsoft.icon",
  },
  {
    ext: ".jpeg",
    type: "image/jpeg",
  },
  {
    ext: ".jpg",
    type: "image/jpeg",
  },
  {
    ext: ".mp3",
    type: "audio/mpeg",
  },
  {
    ext: ".mp4",
    type: "video/mp4",
  },
  {
    ext: ".mpeg",
    type: "video/mpeg",
  },
  {
    ext: ".odp",
    type: "application/vnd.oasis.opendocument.presentation",
  },
  {
    ext: ".ods",
    type: "application/vnd.oasis.opendocument.spreadsheet",
  },
  {
    ext: ".odt",
    type: "application/vnd.oasis.opendocument.text",
  },
  {
    ext: ".oga",
    type: "audio/ogg",
  },
  {
    ext: ".ogv",
    type: "video/ogg",
  },
  {
    ext: ".ogx",
    type: "application/ogg",
  },
  {
    ext: ".png",
    type: "image/png",
  },
  {
    ext: ".pdf",
    type: "application/pdf",
  },
  {
    ext: ".ppt",
    type: "application/vnd.ms-powerpoint",
  },
  {
    ext: ".pptx",
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  {
    ext: ".rar",
    type: "application/vnd.rar",
  },
  {
    ext: ".rtf",
    type: "application/rtf",
  },
  {
    ext: ".svg",
    type: "image/svg+xml",
  },
  {
    ext: ".tif",
    type: "image/tiff",
  },
  {
    ext: ".tiff",
    type: "image/tiff",
  },
  {
    ext: ".ts",
    type: "video/mp2t",
  },
  {
    ext: ".ttf",
    type: "font/ttf",
  },
  {
    ext: ".txt",
    type: "text/plain",
  },
  {
    ext: ".wav",
    type: "audio/wav",
  },
  {
    ext: ".weba",
    type: "audio/webm",
  },
  {
    ext: ".webm",
    type: "video/webm",
  },
  {
    ext: ".webp",
    type: "image/webp",
  },
  {
    ext: ".woff",
    type: "font/woff",
  },
  {
    ext: ".woff2",
    type: "font/woff2",
  },
  {
    ext: ".xls",
    type: "application/vnd.ms-excel",
  },
  {
    ext: ".xlsx",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  {
    ext: ".xml",
    type: "application/xml",
  },
  {
    ext: ".zip",
    type: "application/zip",
  },
  {
    ext: ".3gp",
    type: "video/3gpp",
  },
  {
    ext: ".3gp",
    type: "audio/3gpp",
  },
  {
    ext: ".3g2",
    type: "video/3gpp2",
  },
  {
    ext: ".3g2",
    type: "audio/3gpp2",
  },
  {
    ext: ".7z",
    type: "application/x-7z-compressed",
  },
  
]