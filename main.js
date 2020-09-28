// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const cap = require('cap').Cap;
const decoders = require('cap').decoders;
const udp_decode = require('udp-packet');
const PROTOCOL = decoders.PROTOCOL;

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'js/preload.js'),
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//ipcMain.on("test", () => console.log("test"))
const c = new cap();
const device = cap.findDevice();
const size = 10 * 1024 * 1024;
const buffer = Buffer.alloc(65535)

const link = c.open(device, "udp and not port 53 and not port 137", size, buffer);
c.setMinBytes && c.setMinBytes(0);

c.on('packet', (nbytes, trunc) => {
    if (link === "ETHERNET") {
        var eth = decoders.Ethernet(buffer);
        if (eth.info.type === PROTOCOL.ETHERNET.IPV4) {
            var ipv4 = decoders.IPV4(buffer, eth.offset);
            if (ipv4.info.protocol === PROTOCOL.IP.UDP) {
                var udp = decoders.UDP(buffer, ipv4.offset);
                var source = ipv4.info.srcaddr;
                var dest = ipv4.info.dstaddr;
                var data = udp_decode.decode(buffer).data;
                console.log(udp_decode.decode(buffer).length + " - " + data.length);
            }
        }
    }
});