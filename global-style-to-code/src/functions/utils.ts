// utils

export function getDepthName(name: string) {
  return getVariableName(name)
    .split('/')
    .reduce((acc: string, cur: string) => (acc += `-${cur}`), '')
    .slice(1);
}
export function replaceToStyleCode(code: string) {
  return code.replace(/"/g, '').replace(/,\n/g, ';\n').replace('\n}', ';\n}');
}

export function getRGBA(color: RGB | RGBA, opacity?: number) {
  const r = Math.floor(color.r * 255);
  const g = Math.floor(color.g * 255);
  const b = Math.floor(color.b * 255);
  const a = opacity ? round(opacity) : 1;
  return [r, g, b, a];
}

export function round(number: Number) {
  let roundedNumber;
  // Shift
  roundedNumber = number.toString().split('e');
  roundedNumber = Math.round(
    +(roundedNumber[0] + 'e' + (roundedNumber[1] ? +roundedNumber[1] + 1 : 1))
  );
  // Shift back
  roundedNumber = roundedNumber.toString().split('e');
  return +(
    roundedNumber[0] +
    'e' +
    (roundedNumber[1] ? +roundedNumber[1] - 1 : -1)
  );
}

export function checkEmptyObject(obj: { [key: string]: any }, key: string) {
  if (!obj[key]) obj[key] = {} as { [key: string]: any };
}

export function getVariableName(name: string) {
  return name.replace(/[ ][ ]*/g, '-').toLocaleLowerCase(); // temporary only use lower case
}

export function RGBToHex(r: number, g: number, b: number) {
  let arr = [
    round(r).toString(16),
    round(g).toString(16),
    round(b).toString(16),
  ];
  arr = arr.map((el) => {
    if (el.length < 2) {
      return '0' + el;
    }
    return el;
  });
  return '#' + arr.join('');
}

export function RGBAToHexA(r: number, g: number, b: number, a: number) {
  let arr = [
    round(r).toString(16),
    round(g).toString(16),
    round(b).toString(16),
    Math.round(round(a) * 255).toString(16),
  ];
  arr = arr.map((el) => {
    if (el.length < 2) {
      return '0' + el;
    }
    return el;
  });
  return '#' + arr.join('');
}

export function RGBToHSL(r: number, g: number, b: number, a: number) {
  // Make r, g, and b fractions of 1
  r = round(r) / 255;
  g = round(g) / 255;
  b = round(b) / 255;

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

  return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
}
