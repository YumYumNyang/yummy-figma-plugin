import { Option, PaintOption, Stylings } from './@types/index';
import { TextStyling, EffectStyling, PaintStyling } from './functions/class';

// postMessage
function sendMessage(stylings: Stylings) {
  let stylingInfos = Object.keys(stylings).map((key) => {
    const styling = stylings[key as Option];
    return {
      type: key,
      visible: styling.show,
      lang:
        styling.mode === 'object'
          ? 'javascript'
          : styling.mode === 'css'
          ? 'css'
          : 'scss',
      code: styling.code,
    };
  });

  figma.ui.postMessage(stylingInfos);
}

if (figma.editorType === 'figma') {
  figma.showUI(__html__, { width: 400, height: 720 });

  const stylings: Stylings = {
    text: new TextStyling(figma.getLocalTextStyles()),
    paint: new PaintStyling(figma.getLocalPaintStyles()),
    effect: new EffectStyling(figma.getLocalEffectStyles()),
  };

  figma.ui.onmessage = (msg: any) => {
    switch (msg.type) {
      case 'style':
        const styleId = msg.id as Option;
        stylings[styleId].changeShow();
        sendMessage(stylings);
        break;
      case 'mode':
        const modeId = msg.id as Option;
        const change = msg.change;
        stylings[modeId].changeMode(change);
        sendMessage(stylings);
        break;

      case 'paint-option':
        const option = msg.id as PaintOption;
        stylings['paint'].changePaintOption(option);
        sendMessage(stylings);
        break;
      case 'cancel':
        figma.closePlugin();
        break;
    }
  };
}
