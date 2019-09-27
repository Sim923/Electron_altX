/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, session, ipcMain, Menu } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import * as keytar from "keytar";
import open from "open";
import * as Sentry from '@sentry/node';
import * as taskBot from "./utils/taskBot";
import profile_converter from "./utils/profile-conveter";
import { setTestUrl } from "./utils/checkProxy";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  Sentry.init({
    dsn: 'https://4913edfb068f40e1ae5647ec32e60ad4@sentry.io/1724986'
  });
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    // autoUpdater.checkForUpdatesAndNotify();
  }
}


// spawn("../scripts/./scripts");
let mainWindow = null;

if (isProd) {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  require("electron-debug")();
}

/* const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
}; */

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.commandLine.appendSwitch("disable-web-security");
app.disableHardwareAcceleration();
app.on("ready", async () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": ["default-src 'none'"]
      }
    });
  });
  // if (
  //   process.env.NODE_ENV === "development" ||
  //   process.env.DEBUG_PROD === "true"
  // ) {
  //   await installExtensions();
  // }

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 450,
    minHeight: 200,
    width: 450,
    height: 200,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    },
  });

  mainWindow.setResizable(false);

  mainWindow.loadURL(`file://${__dirname}/app.html`);
  mainWindow.setMenu(null);
  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // mainWindow.webContents.openDevTools();

  mainWindow.webContents.on("new-window", (event, url) => {
    event.preventDefault();
    open(url);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const template = [
    {
      label: "Application",
      submenu: [
        {
          label: "About Application",
          selector: "orderFrontStandardAboutPanel:"
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:"
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  taskBot.setSender(mainWindow.webContents);

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});

/**
 * Add iPC events
 */
// eslint-disable-next-line no-unused-vars
const browsers = [];
ipcMain.on("runCommand", async () => {});

ipcMain.on("startTask", async (event, task) => {
  taskBot.addTask(task);
});

ipcMain.on("stopTask", async (event, task) => {
  taskBot.stopTask(task);
});

ipcMain.on("showTask", async (event, task) => {
  taskBot.showTask(task);
});

ipcMain.on("hideTask", async (event, task) => {
  taskBot.hideTask(task);
});

ipcMain.on("changeSetting", async (event, data) => {
  taskBot.changeSetting(
    data.duration,
    data.maxProfile,
    data.gsearch,
    data.youtube
  );
});

ipcMain.on("closeWindow", () => {
  mainWindow.webContents.send("saveAccounts");
  app.exit();
});

ipcMain.on("miniWindow", () => {
  mainWindow.minimize();
});

ipcMain.on("convertProfile", (event, data) => {
  const { src_path, dst_path, src_format, dst_format } = data;
  console.log(src_path, dst_path, src_format, dst_format);
  profile_converter(src_path, dst_path, src_format, dst_format);
  // eslint-disable-next-line
  event.returnValue = "converted";
});

ipcMain.on("setTestUrl", (event, data) => {
  setTestUrl(data.url);
});

ipcMain.on("activated", (event, data) => {
  console.log("activated");
  mainWindow.setSize(1366, 768);
  mainWindow.setMinimumSize(1366, 768);
  mainWindow.setPosition(200, 100);
  if (data && data.apiKey) keytar.setPassword("apiKey", "OCIO", data.apiKey);
});

ipcMain.on("getApiKey", async (event) => {
  const key = await keytar.getPassword("apiKey", "OCIO");
  // keytar.deletePassword("apiKey", "OCIO");
  // eslint-disable-next-line
  event.returnValue = key;
});

ipcMain.on("resetApiKey", async () => {
  mainWindow.setSize(450, 200);
  mainWindow.setContentSize(450, 200);
  mainWindow.center();
  return keytar.deletePassword("apiKey", "OCIO");
});

ipcMain.on("startOneClick", async (event, task) => {
  taskBot.startOneClick(task);
});

ipcMain.on('windowError', (event, error) => {
  if (!isProd) {
    console.error(error);
  }
  Sentry.captureException(error);
});
