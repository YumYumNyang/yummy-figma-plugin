import { TextStyling } from './class';
import {
  checkDuplicatedName,
  commentMapper,
  getDepthName,
  replaceToStyleCode,
} from './utils';
const textStyleMapper = {
  textDecoration: {
    ['UNDERLLINE']: 'underline',
    ['STRIKETHROUGH']: 'line-through',
  },
  fontStyle: {
    ['Thin']: 100,
    ['ExtraLight']: 200,
    ['Light']: 300,
    ['Regular']: 400,
    ['Medium']: 500,
    ['SemiBold']: 600,
    ['Bold']: 700,
    ['ExtraBold']: 800,
    ['Black']: 900,
  },
  textCase: {
    ['UPPER']: 'uppercase',
    ['LOWER']: 'lowercase',
    ['TITLE']: 'capitalize',
  },
};

// parse
export function parseTextStyle(arr: TextStyle[], mode: string) {
  let code = '';
  let codeObj = {} as { [key: string]: any };
  let dupCnt = {} as { [key: string]: number };

  arr.forEach((textStyle) => {
    let style: { [key: string]: any } = {};
    style['font-size'] = `${textStyle.fontSize}px`;
    if (textStyle.textDecoration !== 'NONE')
      style['text-decoration'] =
        textStyleMapper['textDecoration'][textStyle.textDecoration];
    style['font-family'] = textStyle.fontName.family;
    textStyle.fontName.style.split(' ').forEach((st: string) => {
      if (st === 'Italic') {
        style['font-style'] = 'italic';
      } else {
        const mappedWeight = textStyleMapper['fontStyle'][st];
        if (mappedWeight) style['font-weight'] = mappedWeight;
      }
    });
    /**
     * type LetterSpacing = {
     * readonly value: number
     * readonly unit: "PIXELS" | "PERCENT"
     */
    style['letter-spacing'] =
      textStyle.letterSpacing.unit === 'PIXELS'
        ? `${textStyle.letterSpacing.value}px` // Letter Spacing PIXEL
        : `${textStyle.letterSpacing.value / 100}em`; // Letter Spacing Percent
    /**
     * type LineHeight = {
     *  readonly value: number
     *  readonly unit: "PIXELS" | "PERCENT"
     *  } | {
     *  readonly unit: "AUTO"
     * }
     */
    if (textStyle.lineHeight.unit !== 'AUTO') {
      style['line-height'] =
        textStyle.lineHeight.unit === 'PIXELS'
          ? `${textStyle.lineHeight.value}px` // LineHeight PIXEL
          : `${textStyle.lineHeight.value}%`; // LineHeight Percent
    }

    if (textStyle.paragraphIndent != 0)
      style['text-indent'] = `${textStyle.paragraphIndent}px`;
    if (textStyle.textCase !== 'ORIGINAL')
      style['text-transform'] = textStyleMapper['textCase'][textStyle.textCase];

    const originKey = getDepthName(textStyle.name);
    const key = checkDuplicatedName(originKey, dupCnt);
    codeObj[key] = style;
  });

  if (mode === 'css') {
    code = Object.keys(codeObj).reduce((acc, key) => {
      acc += `.${key} ${replaceToStyleCode(
        JSON.stringify(codeObj[key], null, 2)
      )}\n`;
      return acc;
    }, ``);
  } else if (mode === 'scss') {
    code = Object.keys(codeObj).reduce((acc, key) => {
      acc += `@mixin ${key} ${replaceToStyleCode(
        JSON.stringify(codeObj[key], null, 2)
      )}\n`;
      return acc;
    }, ``);
  } else {
    code = JSON.stringify(codeObj, null, 2);
  }

  return arr.length
    ? `${commentMapper('text style', mode)} \n${code}\n`
    : `${commentMapper('no assigned global text code', mode)}\n`;
}
