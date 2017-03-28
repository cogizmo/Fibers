module.exports = (async function buildService() {

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    const __CONNECT__ = require('connect');
    let serveFiles = require('serve-static');

    const ArangoDB = require('arangojs');
    const HostRouter = require('./controller/HostRouter.js');
    let fibersRouter = await loadRouter(new HostRouter());

    try {
        var rApp = startRemoteServer(fibersRouter.route.bind(fibersRouter)).catch(LOG);
    }
    catch (ex) {
        console.log(ex);
        throw ex;
    }

    return rApp;
}) ();

async function startRemoteServer(router) {
    const Server = require('./ApplicationServer.js');

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

