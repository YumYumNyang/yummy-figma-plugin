import { Option, PaintOption, Stylings } from "./@types/index";
import { TextStyling, EffectStyling, PaintStyling } from "./functions/class";

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

	figma.ui.onmessage = (msg: any) => {
		console.log(msg);
		switch (msg.type) {
			case "style":
				const styleId = msg.id as Option;
				stylings[styleId].changeShow();
				console.log("style", stylings[styleId]);
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
