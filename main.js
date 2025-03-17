const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const { screen } = require('electron/main')

const createWindow = () => {
  // Create a window that fills the screen's available work area.
  const primaryDisplay = screen.getPrimaryDisplay()
  const widthFull = primaryDisplay.workAreaSize.width;
  const heightFull = primaryDisplay.workAreaSize.height;
  let resizeMode = false;

  let win = new BrowserWindow({
    width: widthFull,
    height: heightFull,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    transparent: true,
    frame: false,
    focusable: true, // ?? not sure if we want this
    x: 0, 
    y: 0,
  })

  // ignore mouse events
  // win.setIgnoreMouseEvents(true)

  // log to node console
  ipcMain.on('lg', (event, message) => {
    console.log(message);
  })
 
  // keep elements with class "interactive" interactable
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    if (resizeMode) return;
    console.log("called set-ignore-mouse-events", ignore);
    //ignore ? document.body.style.backgroundColor = "#00FF00" : document.body.style.backgroundColor = "#FFFF00";
    const newWin = BrowserWindow.fromWebContents(event.sender)
    newWin.setIgnoreMouseEvents(ignore, options)
  })

  // enable/disable frame 
  ipcMain.on('enable-disable-frame', (event) => {
    console.log("called enable-disable-frame. resizeMode: ", resizeMode);
    //const win = BrowserWindow.fromWebContents(event.sender)
    if (resizeMode) {
      //disable frame...

      win.destroy();
      resizeMode = false;
      win = new BrowserWindow({
        width: widthFull,
        height: heightFull,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        },
        transparent: true,
        frame: false,
        focusable: true, // ??
        x: 0, 
        y: 0,
      });
      win.loadFile('index.html');
      // keep on top
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      win.setAlwaysOnTop(true, 'screen-saver', 1);
      
      // disable focus
      //win.setIgnoreMouseEvents(true, { forward: true });
    } else {
      //enable frame...

      win.destroy();
      resizeMode = true;
      win = new BrowserWindow({
        width: widthFull,
        height: heightFull,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        },
        transparent: false,
        frame: true,
        focusable: true,
        x: 0, 
        y: 0,
      });
      win.loadFile('index.html');
      // keep on top
      win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      win.setAlwaysOnTop(true, 'screen-saver', 1);

      // enable focus
      //win.setIgnoreMouseEvents(false);
    }
  })

  // keep on top
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, 'screen-saver', 1);

  win.loadFile('index.html')
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

