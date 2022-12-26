document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll();
});

onmessage = (event) => {
  const codeBox = document.querySelector('#code');

  event.data.pluginMessage.forEach((style) => {
    const codeBox = document.querySelector(`#${style.type}-code`);
    if (style.visible) {
      codeBox.className = `language-${style.lang}`;
      codeBox.textContent = style.code;
      hljs.highlightElement(codeBox);
    } else {
      codeBox.textContent = '';
    }
  });
};

document.querySelectorAll('input[type=checkbox]').forEach((el) => {
  el.addEventListener('click', () => {
    const container = el.closest('span');
    const id = container.id;

    parent.postMessage({ pluginMessage: { type: 'style', id: id } }, '*');
  });
});

const colorMode = document.querySelector('select.color-mode');

colorMode.addEventListener('change', () => {
  parent.postMessage(
    { pluginMessage: { type: 'paint-option', id: colorMode.value } },
    '*'
  );
});

document.querySelectorAll('select.mode').forEach((select) => {
  select.addEventListener('change', () => {
    changeMode(select.dataset.mode, select.value);
  });
});

function changeMode(id, value) {
  parent.postMessage(
    { pluginMessage: { type: 'mode', id: id, change: value } },
    '*'
  );
}

document.getElementById('copy').onclick = () => {
  copyTextToClipboard();
};

document.getElementById('cancel').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
};

function copyTextToClipboard() {
  const text = document.getElementById('code').innerText;
  const textArea = document.createElement('textarea');
  const toast = document.getElementById('toast');

  textArea.value = text;

  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);

  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successfully copied' : 'error occured';

    toast.style.opacity = 1;
    toast.innerHTML = msg;
    setTimeout(() => {
      toast.style.opacity = 0;
    }, 1000);
  } catch (err) {
    toast.style.opacity = 1;
    toast.innerHTML = 'error occured';

    console.error(err);
  }
  document.body.removeChild(textArea);
}
