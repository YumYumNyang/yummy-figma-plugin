import { TextStyling } from "./class";
const mapper = {
  textDecoration: {
    ["UNDERLLINE"]: "underline",
    ["STRIKETHROUGH"]: "line-through",
  },
  fontStyle: {
    ["Thin"]: 100,
    ["ExtraLight"]: 200,
    ["Light"]: 300,
    ["Regular"]: 400,
    ["Medium"]: 500,
    ["SemiBold"]: 600,
    ["Bold"]: 700,
    ["ExtraBold"]: 800,
    ["Black"]: 900,
  },
  textCase: {
    ["UPPER"]: "uppercase",
    ["LOWER"]: "lowercase",
    ["TITLE"]: "capitalize",
  },
};

// parse
export function parseTextStyle(arr: TextStyle[], mode: string) {
  let code = "";
  let codeObj = {};

  arr.forEach((textStyle) => {
    let style: { [key: string]: any } = {};
    style["font-size"] = `${textStyle.fontSize}px`;
    if (textStyle.textDecoration !== "NONE")
      style["text-decoration"] =
        mapper["textDecoration"][textStyle.textDecoration];
    style["font-family"] = textStyle.fontName.family;
    textStyle.fontName.style.split(" ").forEach((st: string) => {
      if (st === "Italic") {
        style["font-style"] = "italic";
      } else {
        const mappedWeight = mapper["fontStyle"][st];
        if (mappedWeight) style["font-weight"] = mappedWeight;
      }
    });
    style["letter-spacing"] =
      textStyle.letterSpacing.unit === "PIXELS"
        ? `${textStyle.letterSpacing.value}px`
        : `${textStyle.letterSpacing.value / 100}em`;

    if (textStyle.lineHeight.unit !== "AUTO") {
      style["line-height"] =
        textStyle.letterSpacing.unit === "PIXELS"
          ? `${textStyle.letterSpacing.value}px`
          : `${textStyle.letterSpacing.value}px`;
    }

    if (textStyle.paragraphIndent != 0)
      style["text-indent"] = `${textStyle.paragraphIndent}px`;
    if (textStyle.textCase !== "ORIGINAL")
      style["text-transform"] = mapper["textCase"][textStyle.textCase];
    codeObj[
      textStyle.name
        .split("/")
        .reduce((acc: string, cur: string) => (acc += `-${cur}`), "")
        .slice(1)
    ] = style;
  });

  if (mode === "css") {
    code = Object.keys(codeObj).reduce((acc, key) => {
      acc += `.${key} ${JSON.stringify(codeObj[key], null, 2)}\n`;
      return acc;
    }, ``);
  } else if (mode === "scss") {
    code = Object.keys(codeObj).reduce((acc, key) => {
      acc += `@mixin ${key} ${JSON.stringify(codeObj[key], null, 2)}\n`;
      return acc;
    }, ``);
  } else {
    code = JSON.stringify(codeObj, null, 2);
  }

  return arr.length
    ? `//text style \n ${code}\n`
    : `//no assigned global text code\n`;
}
