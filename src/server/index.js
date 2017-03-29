"use strict";

const ArangoDB = require('arangojs');

let serveFiles = require('serve-static');
const HostRouter = require('./controller/HostRouter.js');
const StaticRoute = require('./model/StaticRoute.js');

const LOG = console.log.bind(console);

let fibersDatabase;
let fibersRouter = new HostRouter();
module.exports = (async function buildService() {

    fibersDatabase = await logInToDatabase('overseer', '#nf0rm@$!0n#$?0wr');
    await loadRouter(fibersDatabase, fibersRouter);

    try {
        var rApp = startRemoteServer(fibersRouter.route.bind(fibersRouter)).catch(LOG);
    }
    catch (ex) {
        LOG(ex);
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
        LOG(ex);
        throw ex;
    }

    return httpServer;
}

async function logInToDatabase(username, password) {
    const dbname = 'fibers-development';
    let port = 8529,
        host = 'localhost';
    let database = ArangoDB(`http://${host}:${port}`);
    database.useDatabase(dbname);
    database.useBasicAuth(username, password);

    return database;
}

async function loadRouter(database, base) {
    const Context = require('./model/Context.js');
    const ModelObject = require('./model/ModelObject.js');

    let hosts = await Context.getAll(database);
    let routers = hosts.map(createHostRouter);

    let cors = base.getRouter('components.fiber.dev');
    cors.use('/', enableCors);

    let endpoints = await Promise.all(hosts.map(async (host) => {
        LOG(`${host.hostname}: Getting routes`);
        let endpoints = [];
        endpoints = await host.getRoutes(database);

        endpoints = endpoints.filter((v) => {
            return typeof v === 'object';
        })

        endpoints.forEach(v => {
            LOG(`Static Route: ${v.route} => ${v.path}`);
        })
        return await endpoints;
    }));

    routers.map((router, idx) => {
        let routes = endpoints[idx];
        routes.forEach((route) => {
            if (router instanceof StaticRoute)
                router.use(route.route, serveFiles(route.path));
        })
    });

    return base;
}

function createHostRouter(host) {
    const __CONNECT__ = require('connect');

    let router = __CONNECT__();
    fibersRouter.use(host.hostname, router);
    return router;
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

