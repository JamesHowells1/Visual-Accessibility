const { app, BrowserWindow, ipcMain, desktopCapturer} = require('electron')
const path = require('node:path')
const { screen } = require('electron/main')

let win;

const createWindow = () => {
  // Create a window that fills the screen's available work area.
  const primaryDisplay = screen.getPrimaryDisplay()
  const widthFull = primaryDisplay.workAreaSize.width;
  const heightFull = primaryDisplay.workAreaSize.height;
  let resizeMode = false;

  win = new BrowserWindow({
    width: widthFull,
    height: heightFull,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    transparent: true,
    frame: false,
    focusable: true, // ?? not sure if we want this
    x: 0, 
    y: 0,
  })

  // ignore mouse events
  // win.setIgnoreMouseEvents(true)

  // Handle IPC for always-on-top
  ipcMain.on('set-always-on-top', (event, flag) => {
    win.setAlwaysOnTop(flag, 'screen-saver', 1);
  });

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

  // handle close app button press
  ipcMain.on('quit-app', (event) => {
    if (process.platform !== 'darwin') {
      app.quit();
    } else {
      win.destroy(); 
    }
  });

  // enable/disable frame 
  // ipcMain.on('enable-disable-frame', (event) => {
  //   console.log("called enable-disable-frame. resizeMode: ", resizeMode);
  //   //const win = BrowserWindow.fromWebContents(event.sender)
  //   if (resizeMode) {
  //     //disable frame...

  //     win.destroy();
  //     resizeMode = false;
  //     win = new BrowserWindow({
  //       width: widthFull,
  //       height: heightFull,
  //       webPreferences: {
  //         preload: path.join(__dirname, 'preload.js')
  //       },
  //       transparent: true,
  //       frame: false,
  //       focusable: true, // ??
  //       x: 0, 
  //       y: 0,
  //     });
  //     win.loadFile('index.html');
  //     // keep on top
  //     win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  //     win.setAlwaysOnTop(true, 'screen-saver', 1);
      
  //     // disable focus
  //     //win.setIgnoreMouseEvents(true, { forward: true });
  //   } else {
  //     //enable frame...

  //     win.destroy();
  //     resizeMode = true;
  //     win = new BrowserWindow({
  //       width: widthFull,
  //       height: heightFull,
  //       webPreferences: {
  //         preload: path.join(__dirname, 'preload.js')
  //       },
  //       transparent: false,
  //       frame: true,
  //       focusable: true,
  //       x: 0, 
  //       y: 0,
  //     });
  //     win.loadFile('index.html');
  //     // keep on top
  //     win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  //     win.setAlwaysOnTop(true, 'screen-saver', 1);

  //     // enable focus
  //     //win.setIgnoreMouseEvents(false);
  //   }
  // })

  // keep browser window on top
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); // side effect: this will prevent the app from having an app icon in the macos dock and will prevent it having a menu in the menu bar
  win.setAlwaysOnTop(true, 'screen-saver', 1); // required 

  // load the html onto the browser window 
  win.loadFile('index.html')
}

// quit the app when "close window" button is pressed except on mac 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// when ready...
app.whenReady().then(() => {
  createWindow(); // create the browser window

  // for cross-platform compatibility. Creates a new window if the app is active but windowless
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // place for any js that needs to execute once the page has fully loaded (placing it in the preload is not as reliable)
  win.webContents.once('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      console.log('Page fully loaded!');
    `);
  });
})

// get id of available screen source. used for getting video stream of screen 
ipcMain.handle('get-screen-source', async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  return sources[0].id;
});