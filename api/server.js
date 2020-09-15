const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcryptjs = require("bcryptjs");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const connection = require("../database/connection.js");
const usersRouter = require("../users/users-router.js");
const authRouter = require("../auth/auth-router.js");


const server = express();

const sessionConfig = {
    name: "monster",
    secret: process.env.SESSION_SECRET || "keep it secret, keep it safe!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: process.env.USE_SECURE_COOKIES || false, 
        httpOnly: true, 
    },
    store: new KnexSessionStore({
        knex: connection, 
        tablename: "sessions",
        sidfieldname: "sid",
        createtable: true,
        clearInterval: 1000 * 60 * 60,
    }),
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use("/api/users", protected, usersRouter);
server.use("/api/auth", authRouter);


function protected(req, res, next) {
    req.session.username ? next() : res.status(401).json({ you: "cannot pass!" })
}

module.exports = server;