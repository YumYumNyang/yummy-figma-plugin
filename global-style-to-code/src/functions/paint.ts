import { ExportMode, PaintOption } from "../@types/index";
import {
  checkEmptyObject,
  getVariableName,
  RGBAToHexA,
  RGBToHex,
  RGBToHSL,
  round,
} from "./utils";

export function getColor(obj: Paint, paintOption: PaintOption) {
  if (obj.type === "SOLID") {
    const { color, opacity } = obj;
    const r = Math.floor(color.r * 255);
    const b = Math.floor(color.b * 255);
    const g = Math.floor(color.g * 255);

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

//parse
export function parsePaintStyle(
  arr: PaintStyle[],
  mode: ExportMode,
  option: PaintOption
) {
  let codeObj = {} as { [key: string]: any };
  if (mode === "css") {
    arr.forEach((el) => {
      let key = getVariableName(el.name)
        .split("/")
        .reduce((acc: string, cur: string) => (acc += `-${cur}`), "-");
      el.paints.forEach((paint: any, idx: number) => {
        el.paints.length <= 1
          ? (codeObj[`${key}`] = getColor(paint, option))
          : (codeObj[`${key}-${idx}`] = getColor(paint, option));
      });
    });
  } else if (mode === "object") {
    arr.forEach((el) => {
      let path = getVariableName(el.name).split("/");
      let cur = codeObj;
      path.forEach((key: any, i: number) => {
        if (i === path.length - 1) {
          if (el.paints.length <= 1) {
            cur[key] = getColor(el.paints[0], option);
          } else {
            el.paints.forEach((paint: any, idx: number) => {
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
        .reduce((acc: string, cur: string) => (acc += `-${cur}`), "");
      el.paints.forEach((paint: any, idx: number) => {
        el.paints.length <= 1
          ? (codeObj[`$${key.slice(1)}`] = getColor(paint, option))
          : (codeObj[`$${key.slice(1)}-${idx}`] = getColor(paint, option));
      });
    });
  }
  let code = JSON.stringify(codeObj, null, 2);
  if (mode === "css" || mode === "scss") {
    code = code.replace(/"/g, "").replace(/,/g, ";").replace("\n}", ";\n}");
  }
  return Object.keys(codeObj).length
    ? `//paint style \n ${code}\n`
    : `//no assigned global paint code\n`; // space 2, replacer null
}
