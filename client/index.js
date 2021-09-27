"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// require('dotenv').config()
const cookieParser = require('cookie-parser');
// const express = require('express');
const express_1 = __importDefault(require("express"));
const cors = require('cors');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const db_js_1 = require("./db.js");
// const {db, bucket, userExists, saveNewUser} = require('./db.js');
const whitelist = ['https://whattobring.ethanhorowitz.repl.co', 'http://localhost:3000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1)
            callback(null, true);
        else
            callback(new Error('Not allowed by CORS'));
    }
};
const app = express_1.default();
app.engine('html', ejs.renderFile);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'html');
app.use(cookieParser(process.env.cookie_secret));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
app.get('/api', (req, res) => {
    res.send(JSON.stringify({
        something: 1,
        again: 2
    }))
})
app.post('/profile/:userid', async (req, res) => {
    let profile = {
        lists: [],
        templates: [],
        username: "",
        owner: false
    };
    let cookie = req.cookies['id'];
    let uid = req.params['userid'];
    let user = await db_js_1.getUserProfile(uid);
    if (user) {
        // username
        profile.username = user.name;
        // load lists
        for (let list in user.personalLists) {
            let data = await db_js_1.getList(list, user.personalLists[list].viewable, false);
            if (!data)
                continue;
            data.id = list;
            profile.lists.push(data);
        }
        // load templates
        for (let list in user.personalTemplates) {
            let data = await db_js_1.getList(list, user.personalTemplates[list].viewable, true);
            if (!data)
                continue;
            data.id = list;
            profile.templates.push(data);
        }
        if (cookie == user.session && user.session) {
            profile.owner = true;
            console.log(cookie);
        }
        // send the data
        res.render('profile.html', profile);
    }
    else
        res.render('index.html');
});
app.post('/:account/lists/:listid', async (req, res) => {
    let { account, listid } = req.params;
    let list = await db_js_1.getList(listid, true, false);
    if (!list)
        list = await db_js_1.getList(listid, false, false);
    res.render('listEdit.html', { name: list.name, sections: list.sections });
});
function validateEmail(email) {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
}
app.post('/logindummy', (req, res) => {
    res.send('');
});
app.post('/login', async (req, res) => {
    let body = req.body;
    if (!body.login) { // signing up
        // check for errors: not an email, no confirmation password, passwords don't match, password is less than 6 characters, user already exists
        if (!validateEmail(body.username))
            return res.send(JSON.stringify({ error: "You must enter a valid email address" }));
        else if (body.pass2.length == 0)
            return res.send(JSON.stringify({ error: "Password confirmation must be filled" }));
        else if (body.pass2 != body.password)
            return res.send(JSON.stringify({ error: "Passwords must match" }));
        else if (body.password.length < 6)
            return res.send(JSON.stringify({ error: "Password must be at least 6 characters long" }));
        else if (await db_js_1.userExists({ email: body.username }))
            return res.send(JSON.stringify({ error: "A user already exists with this email" }));
        // save the user
        await db_js_1.saveNewUser(body.username, body.username.split('@')[0], body.password, 'free', false, { cvv: "", number: "" });
        return res.send(JSON.stringify({ success: "Your account was created! Check your inbox for a confirmation email." }));
    }
    else {
        let resp = await db_js_1.checkUser(body.username, body.password);
        if (resp === 0)
            return res.send(JSON.stringify({ error: "No account exists with this email / username" }));
        else if (resp === false)
            return res.send(JSON.stringify({ error: "Incorrect password." }));
        let user = (await db_js_1.getUser({ email: body.username, name: body.username }, false))[0];
        let session = await db_js_1.getSession(user.id, body.password);
        if (session.length > 0)
            res.cookie('id', session, { httpOnly: true });
        return res.send(JSON.stringify({ success: "/profile/" + user.id }));
    }
});
app.post('/:account/:listid/addSection', cors(corsOptions), async (req, res) => {
    let { account, listid } = req.params;
    let session = req.cookies['id'];
    let user = await db_js_1.checkUserCookie(account, session);
    // check if the user is actually logged in
    if (user === false)
        return res.send(JSON.stringify({ 'error': '/' }));
    // check if the user owns the list
    if (listid in user.user.personalLists) {
        let ulist = user.user.personalLists[listid], id = db_js_1.makeID(8), list = await db_js_1.getList(listid, ulist.viewable, false);
        if (req.body.type == 'section') {
            if (!list)
                return res.send(JSON.stringify({ 'error': '/' }));
            while (id in list.sections)
                id = db_js_1.makeID(8);
            await db_js_1.updateList(listid, 'add', 'section', [id, 'New Section'], ulist.viewable);
            return res.send(JSON.stringify({ 'success': id }));
        }
        else if (req.body.type == 'option') {
            if (!list || !list.sections[req.body.sid])
                return res.send(JSON.stringify({ 'error': '/' }));
            while (id in list.sections[req.body.sid])
                id = db_js_1.makeID(8);
            return res.send(JSON.stringify({ 'success': id }));
        }
    }
    res.send(JSON.stringify({ 'error': '/' }));
});
app.post('/:account/:listid/deleteSection', cors(corsOptions), async (req, res) => {
    let { account, listid } = req.params;
    let session = req.cookies['id'];
    let user = await db_js_1.checkUserCookie(account, session);
    // check if the user is actually logged in
    if (user === false)
        return res.send(JSON.stringify({ 'error': '/' }));
    // check if the user owns the list
    if (listid in user.user.personalLists) {
        let ulist = user.user.personalLists[listid];
        await db_js_1.updateList(listid, 'delete', req.body.type, req.body.ids, ulist.viewable);
        return res.send(JSON.stringify({ 'success': '' }));
    }
    res.send(JSON.stringify({ 'error': '/' }));
});
app.post('/:account/:listid/updateSection', cors(corsOptions), async (req, res) => {
    let { account, listid } = req.params;
    let session = req.cookies['id'];
    let user = await db_js_1.checkUserCookie(account, session);
    // check if the user is actually logged in
    if (user === false)
        return res.send(JSON.stringify({ 'error': '/' }));
    // check if the user owns the list
    if (listid in user.user.personalLists) {
        let ulist = user.user.personalLists[listid];
        await db_js_1.updateList(listid, 'update', req.body.type, req.body.ids, ulist.viewable);
        return res.send(JSON.stringify({ 'success': '' }));
    }
    res.send(JSON.stringify({ 'error': '/' }));
});
app.post('/newList/:account', cors(corsOptions), async (req, res) => {
    let id = req.cookies['id'];
    let { account } = req.params;
    let user = await db_js_1.getUser({ '.id': account }, false);
    if (user.length > 0 && user[0].user.session == id) {
        let resp = await db_js_1.saveList("New List", account, "");
        return res.send(JSON.stringify({ success: resp.id }));
    }
    res.send(JSON.stringify({ 'error': '/' }));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT);
console.log('http://localhost:' + PORT);
