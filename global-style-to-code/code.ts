// global variables
let textCode = ``;
let paintCode = ``;
let effectCode = ``;
let mode = "object";
let showTextStyles = false;
let showPaintStyles = false;
let showEffectStyles = false;

if (figma.editorType === "figma") {
	figma.showUI(__html__, { width: 400, height: 600 });

	const textStyles = figma.getLocalTextStyles();
	const paintStyles = figma.getLocalPaintStyles();
	const effectStyles = figma.getLocalEffectStyles();

	figma.ui.onmessage = (msg) => {
		switch (msg.type) {
			case "object":
			case "css":
				mode = msg.type;
				getPaintStyle(paintStyles);
			case "text-style":
			// parsing text style array

			case "paint-style":
				getPaintStyle(paintStyles);
			case "effect-style":
				// parsing effect style array

				let code = `${textCode} ${paintCode} ${effectCode}`;
				figma.ui.postMessage(code);
				break;

			case "copy":
				break;

			case "cancel":
				figma.closePlugin();
				break;
		}
	};
}

function getTextStyle(textStyles: TextStyle[]) {
	if (!showTextStyles) {
		showTextStyles = true;
		textCode = `//text style \n${parseTextStyle(textStyles, mode)};\n`;
	} else {
		showTextStyles = false;
		textCode = "";
	}
}

function getPaintStyle(paintStyles: PaintStyle[]) {
	if (!showPaintStyles) {
		showPaintStyles = true;
		paintCode = `//paint style \n${parsePaintStyle(paintStyles, mode)};\n`;
	} else {
		showPaintStyles = false;
		paintCode = "";
	}
}

function parseTextStyle(arr: TextStyle[], mode: string) {
	let codeObj = {} as { [key: string]: any };

	return JSON.stringify(codeObj, null, 2);
}

function parsePaintStyle(arr: PaintStyle[], mode: string) {
	let codeObj = {} as { [key: string]: any };
	if (mode === "css") {
		arr.forEach((el) => {
			let key = getVariableName(el.name)
				.split("/")
				.reduce((acc, cur) => (acc += `-${cur}`), "-");
			el.paints.forEach((paint, idx) => {
				el.paints.length <= 1
					? (codeObj[`${key}`] = getColor(paint))
					: (codeObj[`${key}-${idx}`] = getColor(paint));
			});
		});
	} else if (mode === "object") {
		arr.forEach((el) => {
			let path = getVariableName(el.name).split("/");
			let cur = codeObj;
			path.forEach((key, i) => {
				if (i === path.length - 1) {
					if (el.paints.length <= 1) {
						cur[key] = getColor(el.paints[0]);
					} else {
						el.paints.forEach((paint, idx) => {
							checkEmptyObject(cur, key);
							cur[key][idx] = getColor(paint);
						});
					}
				} else {
					checkEmptyObject(cur, key);
					cur = cur[key];
				}
			});
		});
	}
	return JSON.stringify(codeObj, null, 2); // space 2, replacer null
}

function parseEffectStyle(arr: EffectStyle[], mode: string) {
	let codeObj = {} as { [key: string]: any };

	return JSON.stringify(codeObj, null, 2);
}

function getColor(obj: Paint) {
	if (obj.type === "SOLID") {
		return `rgba(${round(obj.color.r)},${round(obj.color.g)},${round(
			obj.color.r
		)},${round(obj.opacity ? obj.opacity : 1)})`;
	} else {
		return "support only solid color";
	}
}

function round(number: Number) {
	let roundedNumber;
	// Shift
	roundedNumber = number.toString().split("e");
	roundedNumber = Math.round(
		+(
			roundedNumber[0] +
			"e" +
			(roundedNumber[1] ? +roundedNumber[1] + 1 : 1)
		)
	);
	// Shift back
	roundedNumber = roundedNumber.toString().split("e");
	return +(
		roundedNumber[0] +
		"e" +
		(roundedNumber[1] ? +roundedNumber[1] - 1 : -1)
	);
}

function checkEmptyObject(obj: { [key: string]: any }, key: string) {
	if (!obj[key]) obj[key] = {} as { [key: string]: any };
}

function getVariableName(name: string) {
	return name.replace(/[ ][ ]*/g, "-");
}