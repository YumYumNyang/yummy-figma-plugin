import { getDepthName, getRGBA, replaceToStyleCode } from "./utils";

export function parseEffectStyle(arr: EffectStyle[], mode: string) {
  let codeObj = {} as { [key: string]: any };
  let code = JSON.stringify(codeObj, null, 2);

  arr.forEach((effectStyle) => {
    let style = {};

    effectStyle.effects.forEach((ef) => {
      if (ef.visible) {
        if (ef.type === "BACKGROUND_BLUR") {
          style["backdrop-filter"] = `blur(${ef.radius / 2}px)`;
        } else if (ef.type === "LAYER_BLUR") {
          style["filter"] = `blur(${ef.radius / 2}px)`;
        } else if (ef.type === "INNER_SHADOW" || ef.type === "DROP_SHADOW") {
          const [r, g, b, a] = getRGBA(ef.color, ef.color.a);
          const value = `${ef.type === "INNER_SHADOW" ? "inset " : ""}${
            ef.offset.x
          }px ${ef.offset.y}px ${ef.radius}px rgba(${r}, ${g}, ${b}, ${a})`;
          if (!style["box-shadow"]) {
            style["box-shadow"] = [];
          }
          style["box-shadow"].push(value);
        }
      }
    });

    style["box-shadow"] = style["box-shadow"].join(", ");

    codeObj[getDepthName(effectStyle.name)] = style;
  });

  if (mode === "css") {
    code = Object.keys(codeObj).reduce((acc, key) => {
      acc += `.${key} ${replaceToStyleCode(
        JSON.stringify(codeObj[key], null, 2)
      )}\n`;
      return acc;
    }, ``);
  } else if (mode === "scss") {
    code = Object.keys(codeObj).reduce((acc, key) => {
      acc += `@mixin ${key}${replaceToStyleCode(
        JSON.stringify(codeObj[key], null, 2)
      )}\n`;
      return acc;
    }, ``);
  } else {
    code = JSON.stringify(codeObj, null, 2);
  }

  return arr.length
    ? `//effect style \n ${code}\n`
    : `//no assigned global effect code\n`;
}
