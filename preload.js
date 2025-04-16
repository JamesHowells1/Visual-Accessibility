const { ipcRenderer, contextBridge } = require('electron')

let isMouseOverInteractiveElement = false;

// bridge between renderer and main - for the colour picker functionality
contextBridge.exposeInMainWorld('electronAPI', {
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag)
});

// bridge between renderer and main - for the magnify text functionality 
contextBridge.exposeInMainWorld('magnifierBridge', {
  getScreenSource: () => ipcRenderer.invoke('get-screen-source')
});

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



  // set button event listeners

  const homeScreen = document.querySelector(".menu");
  const settingsScreen = document.querySelector(".settings");
  const editScreen = document.querySelector(".edit-view");
  const viewUIButton = document.querySelector(".view-ui-button");

  document.querySelector(".settings-button").addEventListener('click', () => {
    homeScreen.classList.add("hidden");
    settingsScreen.classList.remove("hidden");
  });

  document.querySelector(".settings .back-button").addEventListener('click', () => {
    homeScreen.classList.remove("hidden");
    settingsScreen.classList.add("hidden");
  });

  viewUIButton.addEventListener('click', () => {
    homeScreen.classList.remove("hidden");
    viewUIButton.classList.add("hidden");
  });

  // document.querySelector(".edit-button").addEventListener('click', () => {
  //   homeScreen.classList.add("hidden");
  //   editScreen.classList.remove("hidden");
  // });

  document.querySelector(".saved-slots-list-wrap .add-button").addEventListener('click', () => {
    homeScreen.classList.add("hidden");
    editScreen.classList.remove("hidden");
  });

  // document.querySelector(".edit-view .back-button").addEventListener('click', () => {
  //   homeScreen.classList.remove("hidden");
  //   editScreen.classList.add("hidden");
  // });

  document.querySelector(".close-button").addEventListener('click', () => {
    homeScreen.classList.add("hidden");
    viewUIButton.classList.remove("hidden");
  });

  document.querySelector(".close-app-button").addEventListener('click', () => {
    ipcRenderer.send('quit-app'); // quit app 
  });

  //ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });

  // document.querySelector(".click").addEventListener('click', () => {
  //   ipcRenderer.send('enable-disable-frame');
  // });
})