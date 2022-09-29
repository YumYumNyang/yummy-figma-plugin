onmessage = (event) => {
	document.getElementById("code").value = event.data.pluginMessage;
};

document.querySelectorAll("#convert label").forEach((el) =>
	el.addEventListener("click", (e) => {
		const select = el.nextElementSibling;
		const input = el.querySelector("input");
		const id = el.closest("span").id;
		if (input.checked) {
			select.style.height = "100%";
			select.style.opacity = 1;
		} else {
			select.style.height = 0;
			select.style.opacity = 0;
		}
		parent.postMessage({ pluginMessage: { type: "style", id: id } }, "*");
	})
);

function changeMode(id, value) {
	parent.postMessage(
		{ pluginMessage: { type: "mode", id: id, change: value } },
		"*"
	);
}

document.getElementById("copy").onclick = () => {
	copyTextToClipboard();
};

document.getElementById("cancel").onclick = () => {
	parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
};

function copyTextToClipboard() {
	const text = document.getElementById("code").value;
	const textArea = document.createElement("textarea");
	const toast = document.getElementById("toast");

	textArea.value = text;

	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);

	textArea.focus();
	textArea.select();

	try {
		const successful = document.execCommand("copy");
		const msg = successful ? "successful" : "unsuccessful";
		console.log("copy" + msg);

		toast.style.opacity = 1;
		toast.innerHTML = "copy " + msg + " :)";
		setTimeout(() => {
			toast.style.opacity = 0;
		}, 1000);
	} catch (err) {
		toast.style.opacity = 1;
		toast.innerHTML = "copy error :(";

		console.error(err);
	}
	document.body.removeChild(textArea);
}