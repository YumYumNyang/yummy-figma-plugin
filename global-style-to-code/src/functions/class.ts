import { ExportMode, PaintOption } from "../@types/index";
import { parseEffectStyle } from "./effect";
import { parsePaintStyle } from "./paint";
import { parseTextStyle } from "./text";

export class Styling {
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
		this.getStyle();
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

export class TextStyling extends Styling {
	style: TextStyle[];
	constructor(style: TextStyle[]) {
		super();
		this.style = style;
	}
	getStyle() {
		this.code = parseTextStyle(this.style, this.mode);
	}
}

export class PaintStyling extends Styling {
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

export class EffectStyling extends Styling {
	style: EffectStyle[];
	constructor(style: EffectStyle[]) {
		super();
		this.style = style;
	}
	getStyle() {
		this.code = parseEffectStyle(this.style, this.mode);
	}
}
