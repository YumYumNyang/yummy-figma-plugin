import { parseEffectStyle } from "../functions/effect";
import { parsePaintStyle } from "../functions/paint";
import { parseTextStyle } from "../functions/text";

export type ExportMode = "object" | "css" | "scss";

export type Option = "text" | "paint" | "effect";

export type Stylings = {
	text: TextStyling;
	paint: PaintStyling;
	effect: EffectStyling;
};

export type PaintOption = "RGB" | "HSL" | "HEX" | "HSB";

export class Styling {
	code: string;
	mode: ExportMode;
	show: boolean;
	constructor();
	getStyle(): void;
	changeMode(mode: ExportMode): void;
	changeShow(): void;
}

export class TextStyling extends Styling {
	style: TextStyle[];
	constructor(style: TextStyle[]);
	getStyle(): void;
}

export class PaintStyling extends Styling {
	style: PaintStyle[];
	paintOption: PaintOption;
	constructor(style: PaintStyle[]);
	getStyle(): void;
	changePaintOption(option: PaintOption): void;
}

export class EffectStyling extends Styling {
	style: EffectStyle[];
	constructor(style: EffectStyle[]);
	getStyle(): void;
}
