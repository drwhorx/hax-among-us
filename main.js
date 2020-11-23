(async() => {
    //module shit i need
    const { app, BrowserWindow, ipcMain } = require('electron');
    const { ConnectionBuilder } = require("electron-cgi");
    const websocket = require("websocket").server;
    const http = require("http");
    const path = require('path');
    const cap = require('cap').Cap;
    const decoders = require('cap').decoders;
    const PROTOCOL = decoders.PROTOCOL;

    //basic electron setup
    function createWindow() {
        const mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                preload: path.join(__dirname, 'src/js/preload.js'),
                nodeIntegration: true
            }
        })

        mainWindow.loadFile('index.html')
    }

    app.whenReady().then(() => {
        createWindow()

        app.on('activate', function() {
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    })

    app.on('window-all-closed', function() {
        if (process.platform !== 'darwin') app.quit()
    })

    //set up better discord server shit
    const server = http.createServer(function(rew, res) {
        res.writeHead(200);
        res.end();
    });
    server.listen(9998);
    const socket = new websocket({
        httpServer: server,

    });
    let conns = [];
    socket.on("request", (req) => {
        let conn = req.accept('echo-protocol', req.origin);
        conns.push(conn);
        conn.on('message', (data) => {
            if (data.type === 'utf8') {
                conns.forEach(e => e.send(data.utf8Data))
            }
        });
    });
    socket.on("close", (conn) => {
        conns = conns.filter(e => e != conn);
    })

    //set up cap listner
    const c = new cap();
    const device = cap.findDevice();
    const size = 10 * 1024 * 1024;
    const buffer = Buffer.alloc(65535)
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789".split("")
    const filter = (buf) => Array.from(buf).map(e => String.fromCharCode(e)).filter(e => alphabet.includes(e)).join("");

    const link = c.open(device, "udp and not port 53 and not port 137", size, buffer);
    c.setMinBytes && c.setMinBytes(0);

    const regex = {
        murdered: new RegExp(/001200055c2250800b000126..00b17d4388ff7fff7f/)
    }
    c.on('packet', (nbytes, trunc) => {
        if (link === "ETHERNET") {
            var eth = decoders.Ethernet(buffer);
            if (eth.info.type === PROTOCOL.ETHERNET.IPV4) {
                var ipv4 = decoders.IPV4(buffer, eth.offset);
                if (ipv4.info.protocol === PROTOCOL.IP.UDP) {
                    var udp = decoders.UDP(buffer, ipv4.offset);
                    var source = ipv4.info.srcaddr;
                    var dest = ipv4.info.dstaddr;

                    var chunk = buffer.slice(udp.offset, udp.offset + udp.info.length);
                    var data = filter(buffer.slice(udp.offset, udp.offset + udp.info.length))
                    var bytes = chunk.toString('hex');
                    if (regex.murdered.test(bytes)) console.log("murdered");
                    //console.log(data)
                }
            }
        }
    });
})();