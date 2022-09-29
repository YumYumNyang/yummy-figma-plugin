// global variables

type ExportMode = "object" | "css" | "scss";
type Option = "text" | "paint" | "effect";
type Stylings = {
  text: TextStyling;
  paint: PaintStyling;
  effect: EffectStyling;
};
type PaintOption = "RGB" | "HSL" | "HEX" | "HSB";
class Styling {
  code: string;
  mode: ExportMode;
  show: boolean;
  constructor() {
    this.code = "";
    this.mode = "object";
    this.show = false;
  }
  getStyle() {}
  changeMode(mode: ExportMode) {
    this.mode = mode;
    this.getStyle(); // 모드 변경후, 코드 반영
  }
  changeShow() {
    if (!this.show) {
      this.show = true;
      this.getStyle();
    } else {
      this.show = false;
    }
  }
}

class TextStyling extends Styling {
  style: TextStyle[];
  constructor(style: TextStyle[]) {
    super();
    this.style = style;
  }
  getStyle() {
    this.code = parseTextStyle(this.style, this.mode);
  }
}

class PaintStyling extends Styling {
  style: PaintStyle[];
  paintOption: PaintOption;
  constructor(style: PaintStyle[]) {
    super();
    this.style = style;
    this.paintOption = "RGB";
  }
  getStyle() {
    this.code = parsePaintStyle(this.style, this.mode, this.paintOption);
  }
  changePaintOption(option: PaintOption) {
    this.paintOption = option;
    this.getStyle();
  }
}

class EffectStyling extends Styling {
  style: EffectStyle[];
  constructor(style: EffectStyle[]) {
    super();
    this.style = style;
  }
  getStyle() {
    this.code = parseEffectStyle(this.style, this.mode);
  }
}

// postMessage
function sendMessage(stylings: Stylings) {
  let code = Object.keys(stylings).reduce((acc, cur) => {
    const styling = stylings[cur as Option];
    if (styling.show) {
      acc += `${styling.code}`;
    }
    return acc;
  }, ``);
  figma.ui.postMessage(code);
}

if (figma.editorType === "figma") {
  figma.showUI(__html__, { width: 400, height: 760 });

  const stylings: Stylings = {
    text: new TextStyling(figma.getLocalTextStyles()),
    paint: new PaintStyling(figma.getLocalPaintStyles()),
    effect: new EffectStyling(figma.getLocalEffectStyles()),
  };

  figma.ui.onmessage = (msg) => {
    console.log(msg.type);
    switch (msg.type) {
      case "style":
        const styleId = msg.id as Option;
        console.log("style", stylings, styleId);
        stylings[styleId].changeShow();
        sendMessage(stylings);
        break;
      case "mode":
        const modeId = msg.id as Option;
        console.log("mode", stylings, modeId);
        const change = msg.change;
        stylings[modeId].changeMode(change);
        sendMessage(stylings);
        break;
      case "paint-option":
        const option = msg.id as PaintOption;
        stylings["paint"].changePaintOption(option);
        sendMessage(stylings);
        break;
      case "cancel":
        figma.closePlugin();
        break;
    }
  };
}

// parse
function parseTextStyle(arr: TextStyle[], mode: string) {
  let codeObj = {} as { [key: string]: any };
  let code = JSON.stringify(codeObj, null, 2);
  return Object.keys(codeObj).length
    ? `//text style \n ${code}\n`
    : `//no assigned global text code\n`;
}

function parsePaintStyle(
  arr: PaintStyle[],
  mode: ExportMode,
  option: PaintOption
) {
  let codeObj = {} as { [key: string]: any };
  if (mode === "css") {
    arr.forEach((el) => {
      let key = getVariableName(el.name)
        .split("/")
        .reduce((acc, cur) => (acc += `-${cur}`), "-");
      el.paints.forEach((paint, idx) => {
        el.paints.length <= 1
          ? (codeObj[`${key}`] = getColor(paint, option))
          : (codeObj[`${key}-${idx}`] = getColor(paint, option));
      });
    });
  } else if (mode === "object") {
    arr.forEach((el) => {
      let path = getVariableName(el.name).split("/");
      let cur = codeObj;
      path.forEach((key, i) => {
        if (i === path.length - 1) {
          if (el.paints.length <= 1) {
            cur[key] = getColor(el.paints[0], option);
          } else {
            el.paints.forEach((paint, idx) => {
              checkEmptyObject(cur, key);
              cur[key][idx] = getColor(paint, option);
            });
          }
        } else {
          checkEmptyObject(cur, key);
          cur = cur[key];
        }
      });
    });
  } else if (mode === "scss") {
    arr.forEach((el) => {
      let key = getVariableName(el.name)
        .split("/")
        .reduce((acc, cur) => (acc += `-${cur}`), "");
      el.paints.forEach((paint, idx) => {
        el.paints.length <= 1
          ? (codeObj[`$${key.slice(1)}`] = getColor(paint, option))
          : (codeObj[`$${key.slice(1)}-${idx}`] = getColor(paint, option));
      });
    });
  }
  let code = JSON.stringify(codeObj, null, 2);
  return Object.keys(codeObj).length
    ? `//paint style \n ${code}\n`
    : `//no assigned global paint code\n`; // space 2, replacer null
}

function parseEffectStyle(arr: EffectStyle[], mode: string) {
  let codeObj = {} as { [key: string]: any };
  let code = JSON.stringify(codeObj, null, 2);

  return Object.keys(codeObj).length
    ? `//effect style \n ${code}\n`
    : `//no assigned global effect code\n`;
}
// utils
function getColor(obj: Paint, paintOption: PaintOption) {
  if (obj.type === "SOLID") {
    const { color, opacity } = obj;
    const r = round(color.r);
    const g = round(color.g);
    const b = round(color.b);
    const a = opacity ? round(opacity) : 1;

    if (paintOption === "RGB") {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else if (paintOption === "HEX") {
      if (a === 1) {
        return RGBToHex(r, g, b);
      } else {
        return RGBAToHexA(r, g, b, a);
      }
    } else if (paintOption === "HSL") {
      return RGBToHSL(r, g, b, a);
    }
  } else {
    return "support only solid color";
  }
}

function checkEmptyObject(obj: { [key: string]: any }, key: string) {
  if (!obj[key]) obj[key] = {} as { [key: string]: any };
}

function getVariableName(name: string) {
  return name.replace(/[ ][ ]*/g, "-").toLocaleLowerCase(); // temporary only use lower case
}

function RGBToHex(r: number, g: number, b: number) {
  let arr = [r.toString(16), g.toString(16), b.toString(16)];

  arr.forEach((el) => {
    if (el.length == 1) el = "0" + el;
  });
  return "#" + arr.reduce((acc, cur) => (acc += cur), "");
}

function RGBAToHexA(r: number, g: number, b: number, a: number) {
  let arr = [
    r.toString(16),
    g.toString(16),
    b.toString(16),
    Math.round(round(a) * 255).toString(16),
  ];
  arr.forEach((el) => {
    if (el.length == 1) el = "0" + el;
  });
  return "#" + arr.reduce((acc, cur) => (acc += cur), "");
}

function RGBToHSL(r: number, g: number, b: number, a: number) {
  // Make r, g, and b fractions of 1
  r = r / 255;
  g = g / 255;
  b = b / 255;

  // Find greatest and smallest channel values
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  // Calculate hue
  // No difference
  if (delta == 0) h = 0;
  // Red is max
  else if (cmax == r) h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax == g) h = (b - r) / delta + 2;
  // Blue is max
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0) h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return "hsla(" + h + "," + s + "%," + l + "%," + a + ")";
}
function round(number: Number) {
  let roundedNumber;
  // Shift
  roundedNumber = number.toString().split("e");
  roundedNumber = Math.round(
    +(roundedNumber[0] + "e" + (roundedNumber[1] ? +roundedNumber[1] + 1 : 1))
  );
  // Shift back
  roundedNumber = roundedNumber.toString().split("e");
  return +(
    roundedNumber[0] +
    "e" +
    (roundedNumber[1] ? +roundedNumber[1] - 1 : -1)
  );
}
