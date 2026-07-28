import "./gs-text-editor.scss";
import React, { useEffect, useRef, useState } from "react";
import "../styles/quill.scss";
import ReactQuill from "react-quill";
import { GSInput } from "..";
import GSButton from "./gs-button";
import { faCode, faEye, faPen } from "@fortawesome/free-solid-svg-icons";
import { HTMLViewer } from "../stories/controls/gs-html-viewer.stories";



const Parchment = ReactQuill.Quill.import("parchment");
const pixelLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const TAB_MULTIPLIER = 30;

class IndentAttributor extends Parchment.Attributor.Style {
  add(node, value) {
    return super.add(node, `${+value * TAB_MULTIPLIER}px`);
  }

  value(node) {
    return parseFloat(super.value(node)) / TAB_MULTIPLIER || undefined; // Don't return NaN
  }
}

/**
 * A WYSIWYG editor using QUILL 
 *
 * @param {Properties} props value, onChange, defaultState, placeholder, rows, onFocus
 */

//Compnonent function -----------------------------------------------------------------------


const GSTextEditor = props => {
  const { value, onChange, defaultState, placeholder, rows, onFocus, style } = props;

  const [quillText, setQuillText] = useState(value)

  const [state, setState] = useState(defaultState ?? "editor");

  useEffect(() => {
    if(quillText !== value){
      setQuillText(value)
    }
    
  }, [value])

  //size style
  const Size = ReactQuill.Quill.import("attributors/style/size");

  Size.whitelist = [
    "12px",
    "14px",
    "16px",
    "20px",
    "24px",
    "28px",
    "36px",
    "40px"
  ];

  ReactQuill.Quill.register(Size, true);

  var AlignStyle = ReactQuill.Quill.import("attributors/style/align");
  ReactQuill.Quill.register(AlignStyle, true);

  //tab style

  const IndentStyle = new IndentAttributor("indent", "margin-left", {
    scope: Parchment.Scope.BLOCK,
    whitelist: pixelLevels.map(value => `${value * TAB_MULTIPLIER}px`)
  });

  ReactQuill.Quill.register({ "formats/indent": IndentStyle }, true);

  var Block = ReactQuill.Quill.import("blots/block");
  Block.tagName = "DIV";
  ReactQuill.Quill.register(Block, true);

  const colorList = [
    "#232323",
    "#1B48A0",
    "#3C8BA3",
    "#2A6447",
    "#F19D41",
    "#B0351A",
    "#3D368E",
    "#7A7A7A",
    "#5E9AF8",
    "#50B6D5",
    "#5DAF82",
    "#F6C543",
    "#EC6140",
    "#6158BA",
    "#DCDCDC",
    "#B8D4FB",
    "#C0F3FD",
    "#BBF2D3",
    "#FCEFBA",
    "#F5C0B0",
    "#E9E6FD",
    "#000000",
    "#ffffff"
  ];

  const getEditorFormats = () => {
    return [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      "indent",
      "background",
      "color",
      "link",
      "image",
      "video",
      "align"
    ];
  };

  const getModules = () => {
    return {
      toolbar: [
        [{ header: "1" }, { header: "2" }],
        [{ size: Size.whitelist }, false],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { align: "" },
          { align: "center" },
          { align: "right" },
          { align: "justify" }
        ],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "+1" },
          { indent: "-1" }
        ],
        [{ background: colorList }, { color: colorList }],
        ["link", "image", "video"],
        ["clean"]
      ],
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false
      }
    };
  };

  const getEditor = () => {
    if (state === "preview") {
      return (
        <HTMLViewer html={value}/>
      );
    } else if (state === "code") {
      return (
        <GSInput
          type="text-area"
          rows={rows ?? 5}
          textValue={value}
          placeholder={placeholder}
          onChange={e => {
            onChange?.(e?.target?.value);
          }}
        />
      );
    } else {
      return (
        <ReactQuill
          modules={getModules()}
          formats={getEditorFormats()}
          theme="snow"
          value={quillText}
          placeholder={placeholder}
          onChange={e => {
            setQuillText(e)
          }}
          onBlur={
            () => {
              if(quillText == "<div><br></div>"){
                onChange("")
              }
              else{
                onChange(quillText)
              }
            }
          }
          onFocus={() => {
            onFocus?.()
          }}
        ></ReactQuill>
      );
    }
  };

  return (
    <gs-text-editor style={style}>
      <div className="type-selector" tabIndex={1}>
        <GSButton
          type={`secondary ${
            state === "editor" ? "black-border" : "transparent-border"
          }`}
          buttonIcon={faPen}
          onClick={e => {
            setState("editor");
            e?.stopPropagation?.();
          }}
        ></GSButton>
        <GSButton
          type={`secondary ${
            state === "code" ? "black-border" : "transparent-border"
          }`}
          buttonIcon={faCode}
          onClick={e => {
            setState("code");
            e?.stopPropagation?.();
          }}
        ></GSButton>
        <GSButton
          type={`secondary ${
            state === "preview" ? "black-border" : "transparent-border"
          }`}
          buttonIcon={faEye}
          onClick={e => {
            setState("preview");
            e?.stopPropagation?.();
          }}
        ></GSButton>
      </div>
      {getEditor()}
    </gs-text-editor>
  );
};

export default GSTextEditor;
