const { ipcRenderer } = require('electron')

let isMouseOverInteractiveElement = false;

window.addEventListener('DOMContentLoaded', () => {
  // const replaceText = (selector, text) => {
  //   const element = document.getElementById(selector)
  //   if (element) element.innerText = text
  // }

  // for (const dependency of ['chrome', 'node', 'electron']) {
  //   replaceText(`${dependency}-version`, process.versions[dependency])
  // }

  // necessary to ignore mouse events initially
  setTimeout(() => {
    ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });
  }, 500);

  const interactiveElements = document.querySelectorAll('.interactive');

  interactiveElements.forEach((element) => {
    console.log("adding EventListener");
    ipcRenderer.send('lg', "adding EventListener");
      element.addEventListener('mouseenter', () => {
          isMouseOverInteractiveElement = true;
          ipcRenderer.send('set-ignore-mouse-events', false);
      });

      element.addEventListener('mouseleave', () => {
          isMouseOverInteractiveElement = false;
          ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });
      });
  });

  //ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });

  document.querySelector(".click").addEventListener('click', () => {
    ipcRenderer.send('enable-disable-frame');
  });
})