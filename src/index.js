"use strict";
process.on('error', (err) => {
    console.log(err);
    throw err;
});
process.on('unhandledRejection', (reason, promise) => {
    console.log(promise);
    throw new Error(reason);
});


(async() => {
    const __APP__ = require('./class/electron/Application.js');

    const path = require('path');
    const url = require('url');

    const Splash = require('./class/electron/SplashWindow.js');
    const Main = require('./class/electron/AsyncWindow.js');

    const LOG = console.log.bind(console);

    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.
    let intro, win;

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    const __CONNECT__ = require('connect');
    let serveFiles = require('serve-static');

    const ArangoDB = require('arangojs');
    const HostRouter = require('./class/server/controller/HostRouter.js');
    let fibersRouter = await loadRouter(new HostRouter());

    try {
        var rApp = startRemoteServer(fibersRouter.route.bind(fibersRouter)).catch(LOG);
    }
    catch (ex) {
        console.log(ex);
        throw ex;
    }

    (async function openWindows() {
        try {
            let start = await Promise.all([__APP__.ready, rApp]).then(([app, server]) => {
                return {
                    app: app,
                    server: server
                }
            });
            let splash = await Promise.resolve(showSplash(start.server));
            let main = await Promise.resolve(showMain(start.server));
            splash.focus();

            await linkIPC(splash, main);
        }
        catch (ex) {
            console.log(ex);
            throw ex;
        }
    }) ();

    function showSplash(server) {
    // Create the browser window.
        intro = new Splash({
            width: 800,
            height: 600,
            closable: true,
            minimizable: false,
            maximizable: false,
            frame:false,
            //movable: false,
            //resizable: false
        });
    // and load the index.html of the app.
        intro.loadURL(url.format({
            pathname: path.join(__dirname, 'fibers/splash.html'),
            protocol: 'file:',
            slashes: true
        }));

        console.log(server);
        return intro;
    }

    function showMain(server) {
    // Create the browser window.
        win = new Main({
            show: false,
            width: 800,
            height: 600,
            frame: false
        });
    // and load the index.html of the app.
        win.loadURL(url.format({
            pathname: 'index.html',
            hostname: 'admin.fiber.dev',
            port: 80,
            protocol: 'http:',
            slashes: true
        }));

    // Emitted when the window is closed.
        //win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
            //win = null;
        //});

        return win;
    }

    async function linkIPC(intro, win) {
        const {ipcMain} = require('electron');
        let intro2 = intro;

        ipcMain.once('application-ready', (event, arg) => {
            intro2.close();
            win.show();
            // Open the DevTools.
            win.webContents.openDevTools();
        });
        ipcMain.on('components', (event, arg) => {
            if (!intro2 || !intro2.webContents)
                return;

            if (arg === 'loading')
                intro2.webContents.send('components', 'loading');
            else
                intro2.webContents.send('components', 'loaded');
        });

        intro2.once('closed', () => {
            intro2 = null;
        })

        return true;
    }


    // Quit when all windows are closed.
    __APP__.once('window-all-closed', onWindowsClosed);

    function onWindowsClosed() {
        console.log('All windows are closed...');
        rApp.then((serve) => {
            try {
                console.log('Closing Application HTTP Server');
                serve.close();
            }
            catch (ex) {
                console.log(ex);
                throw ex;
            }

            if (process.platform !== 'darwin') {
                __APP__.quit();
            }
        })
    }

    __APP__.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });

    async function startRemoteServer(router) {
        const Server = require('./fibers/ApplicationServer.js');

        let httpServer;
        let port = await Server.findPort();
        try {
            httpServer = await new Server(router);
            httpServer.listen(80, '127.0.100.100', 511, ()=>{})
        }
        catch(ex) {
            console.log(ex);
            throw ex;
        }

        return httpServer;
    }


    __APP__.on('before-quit', () => {
        console.log('Application is quitting...');
        rApp.then((serve) => {
            console.log('Closing Application HTTP Server');
            //serve.close();
        }).catch(LOG);
    });

    async function logInToDatabase(username, password) {
        const database = 'fibers-development';
        let port = 8529,
            host = 'localhost';
        let db = ArangoDB(`http://${host}:${port}`);
        db.useDatabase(database);
        db.useBasicAuth(username, password);

        return db;
    }

    async function loadRouter(base) {
        let fibers = await logInToDatabase('overseer', '#nf0rm@$!0n#$?0wr');

        const Context = require('./class/server/model/Context.js');
        const ModelObject = require('./class/server/model/ModelObject.js');
        let hosts = await Context.getAll(fibers);

        let routers = hosts.map((host) => {
            let router = __CONNECT__();
            base.use(host.hostname, router);
            return router;
        });
        hosts.forEach((host, idx) => {
            if (host.hostname === 'components.fiber.dev')
                routers[idx].use('/', enableCors);
        })

        let endpoints = await Promise.all(hosts.map(async (host) => {
            console.log(`${host.hostname}: Getting routes`);
            let endpoints = [];
            endpoints = await host.getRoutes(fibers);

            endpoints = endpoints.filter((v) => {
                return typeof v === 'object';
            })

            endpoints.forEach(v => {
                console.log(`Static Route: ${v.route} => ${v.path}`);
            })
            return await endpoints;
        }));

        routers.map((router, idx) => {
            let routes = endpoints[idx];
            routes.forEach((route) => {
                router.use(route.route, serveFiles(route.path));
            })
        });

        return base;
    }

    function enableCors(request, response, next) {
        let {headers, method} = request;
        let {origin, host, referrer} = headers;
        let [hostname] = host.split(':');

        switch (method) {
        case 'HEAD':
        case 'GET':
        case 'OPTIONS':
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader('Access-Control-Allow-Credentials', true);
            response.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, OPTIONS, PUT');
            response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            //response.statusCode = 200;
            //response.end('<html><head><title>Some Data</title></head><body>Random Content</body></html>');
            next();
            break;
        case 'POST':
            response.statusCode = 403;
            response.end('<html><head><title>Some Data</title></head><body>Random Post Content</body></html>');
            break;
        case 'PATCH':
        case 'PUT':
            response.statusCode = 405;
            response.end('<html><head><title>Some Data</title></head><body>Random Put Content</body></html>');
            break;
        }
    }

}) ();
