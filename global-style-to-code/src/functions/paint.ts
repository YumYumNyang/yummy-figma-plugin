import { ExportMode, PaintOption } from '../@types/index';
import {
  checkDuplicatedName,
  checkEmptyObject,
  commentMapper,
  getDepthName,
  getRGBA,
  getVariableName,
  replaceToStyleCode,
  RGBAToHexA,
  RGBToHex,
  RGBToHSL,
} from './utils';

export function getColor(obj: Paint, paintOption: PaintOption) {
  if (obj.type === 'SOLID') {
    const { color, opacity } = obj;

    const [r, g, b, a] = getRGBA(color, opacity);
    if (paintOption === 'RGB') {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else if (paintOption === 'HEX') {
      if (a === 1) {
        return RGBToHex(r, g, b);
      } else {
        return RGBAToHexA(r, g, b, a);
      }
    } else if (paintOption === 'HSL') {
      return RGBToHSL(r, g, b, a);
    }
  } else {
    return 'support only solid color';
  }
}

//parse
export function parsePaintStyle(
  arr: PaintStyle[],
  mode: ExportMode,
  option: PaintOption
) {
  let codeObj = {} as { [key: string]: any };
  let dupCnt = {} as { [key: string]: number };
  if (mode === 'css') {
    arr.forEach((el) => {
      let originKey = getDepthName(el.name);
      let key = checkDuplicatedName(originKey, dupCnt);

      el.paints.forEach((paint: any, idx: number) => {
        el.paints.length <= 1
          ? (codeObj[`--${key}`] = getColor(paint, option))
          : (codeObj[`--${key}-${idx}`] = getColor(paint, option));
      });
    });
  } else if (mode === 'object') {
    arr.forEach((el) => {
      let path = getVariableName(el.name).split('/');
      let cur = codeObj;
      path.forEach((originKey: any, i: number) => {
        let key = checkDuplicatedName(originKey, dupCnt);
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
  } else if (mode === 'scss') {
    arr.forEach((el) => {
      let originKey = getDepthName(el.name);
      let key = checkDuplicatedName(originKey, dupCnt);
      el.paints.forEach((paint: any, idx: number) => {
        el.paints.length <= 1
          ? (codeObj[`$${key}`] = getColor(paint, option))
          : (codeObj[`$${key}-${idx}`] = getColor(paint, option));
      });
    });
  }
  let code = JSON.stringify(codeObj, null, 2);
  if (mode === 'css') {
    code = ':root' + replaceToStyleCode(code);
  } else if (mode === 'scss') {
    code = replaceToStyleCode(code).replace(/[{}]/g, '');
  }
  return arr.length
    ? `${commentMapper('paint style', mode)} \n ${code}\n`
    : `${commentMapper('no assigned global paint code', mode)}\n`;
}
