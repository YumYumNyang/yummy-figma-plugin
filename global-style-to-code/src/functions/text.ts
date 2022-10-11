// parse
export function parseTextStyle(arr: TextStyle[], mode: string) {
	let codeObj = {} as { [key: string]: any };
	console.log(arr);

	if (mode === "css") {
	} else if (mode === "object") {
	} else if (mode === "scss") {
	}
	let code = JSON.stringify(codeObj, null, 2);
	return Object.keys(codeObj).length
		? `//text style \n ${code}\n`
		: `//no assigned global text code\n`;
}
