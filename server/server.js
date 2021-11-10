"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const cookieParser = require('cookie-parser');
const db_js_1 = require("./db.js");
const PORT = process.env.PORT || 3001;
const app = (0, express_1.default)();
app.use(cookieParser(process.env.cookie_secret));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
function validateEmail(email) {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
}
app.get('/testsession', async (req, res) => {
    let session = req.cookies['id'];
    let uid = req.cookies['uid'];
    if (!session || !uid)
        return res.json({ error: false });
    let user = await (0, db_js_1.getUser)({ '.id': uid }, false);
    if (user.length == 0)
        return res.json({ error: false });
    let u = user[0].user;
    if (u.session !== session)
        return res.json({ error: false });
    res.json({ name: u.name, uid });
});
app.get('/api', (req, res) => {
    res.json({ message: "hello michael" });
});
// LOGIN / LOGOUT
app.post('/api/login', async (req, res) => {
    let body = req.body;
    if (!body.login) { // signing up
        // check for errors: not an email, no confirmation password, passwords don't match, password is less than 6 characters, user already exists
        if (!validateEmail(body.username))
            return res.json({ error: "You must enter a valid email address" });
        else if (body.pass2.length == 0)
            return res.json({ error: "Password confirmation must be filled" });
        else if (body.pass2 != body.password)
            return res.json({ error: "Passwords must match" });
        else if (body.password.length < 6)
            return res.json({ error: "Password must be at least 6 characters long" });
        else if (await (0, db_js_1.userExists)({ email: body.username }))
            return res.json({ error: "A user already exists with this email" });
        // save the user
        await (0, db_js_1.saveNewUser)(body.username, body.username.split('@')[0], body.password, 'free', false, { cvv: "", number: "" });
        return res.json({ success: "Your account was created! Check your inbox for a confirmation email." });
    }
    else {
        let resp = await (0, db_js_1.checkUser)(body.username, body.password);
        if (resp === 0)
            return res.json({ error: "No account exists with this email / username" });
        else if (resp === false)
            return res.json({ error: "Incorrect password." });
        let user = (await (0, db_js_1.getUser)({ email: body.username, name: body.username }, false))[0];
        let session = await (0, db_js_1.getSession)(user.id, body.password);
        if (session.length > 0) {
            res.cookie('id', session, { httpOnly: true });
            res.cookie('uid', user.id, { httpOnly: true });
        }
        return res.json({ success: "/profile/" + user.id });
    }
});
app.get('/logout', (req, res) => {
    res.clearCookie('id');
    res.clearCookie('uid');
    res.send("");
});
// PROFILE ACCESS / MODIFICATION
app.get('/api/profile/:uid', async (req, res) => {
    let { uid } = req.params;
    let id = req.cookies['id'];
    let user = await (0, db_js_1.getUserProfile)(uid);
    if (user === null)
        return res.json({ error: "User doesn't exist" });
    let filtered = {
        name: user.name,
        personalLists: [],
        profPic: user.profPic,
        topPic: user.topPic,
        owner: id === user.session
    };
    for (let l of user.personalLists) {
        let list = await (0, db_js_1.getList)(l.id, l.viewable, false);
        if (list === null)
            continue;
        if (id !== user.session && !list.public)
            continue;
        filtered.personalLists.push({
            id: l.id,
            name: list.name,
            image: list.image,
            public: list.public
        });
    }
    res.json(filtered);
});
app.get('/api/profile/:uid/settings', async (req, res) => {
    let { uid } = req.params;
    let id = req.cookies['id'];
    let user = await (0, db_js_1.getUserProfile)(uid);
    if (user === null)
        return res.json({ error: "User doesn't exist" });
    if (user.session != id)
        return res.json({ error: "User not logged in / not correct account" });
    let details = {
        name: user.name,
        profPic: user.profPic,
        topPic: user.topPic,
        email: user.email,
        plan: user.plan
    };
    res.json(details);
});
app.post('/api/edit/:uid/uploadMainImage', (0, express_fileupload_1.default)(), async function (req, res) {
    if (!req.files || !req.files.file)
        return res.json({ error: 'image not supplied' });
    let { uid } = req.params;
    let id = req.cookies['id'];
    let user = await (0, db_js_1.getUserProfile)(uid);
    if (user === null)
        return res.json({ error: "User doesn't exist" });
    if (user.session != id)
        return res.json({ error: "User not logged in / not correct account" });
    let file = req.files.file;
    let fileId = Math.round(Math.random() * 1e15);
    let parts = file.name.split('.');
    let name = fileId + '.' + parts[parts.length - 1];
    (0, db_js_1.uploadImage)(name, file, parts[parts.length - 1], (url) => {
        if (url.length > 0) {
            (0, db_js_1.editUserField)(uid, 'topPic', url);
        }
        res.json({ url });
    });
});
app.post('/api/profile/:uid/settings/setUsername', async function (req, res) {
    let { uid } = req.params;
    let { username } = req.body;
    let id = req.cookies['id'];
    let user = await (0, db_js_1.getUserProfile)(uid);
    if (user === null)
        return res.json({ error: "User doesn't exist" });
    if (user.session != id)
        return res.json({ error: "User not logged in / not correct account" });
    if (username.length == 0)
        return res.json({ error: "New username not entered" });
    if (username == user.name)
        return res.json({ error: "New username cannot be the same as the current username" });
    let us = await (0, db_js_1.getUser)({ name: username }, false);
    if (us.length > 0)
        return res.json({ error: "Username is taken" });
    (0, db_js_1.editUserField)(uid, 'name', username);
    res.json({ success: "Username changed successfully!" });
});
app.post('/api/profile/:uid/settings/setPassword', async function (req, res) {
    let { uid } = req.params;
    let { curPassword, newPassword, confPassword } = req.body;
    let id = req.cookies['id'];
    let user = await (0, db_js_1.getUserProfile)(uid);
    if (user === null)
        return res.json({ error: "User doesn't exist" });
    if (user.session != id)
        return res.json({ error: "User not logged in / not correct account" });
    if (curPassword.length == 0)
        return res.json({ error: "Nothing entered for current password" });
    if (newPassword.length == 0)
        return res.json({ error: "Nothing entered for new password" });
    if (confPassword.length == 0)
        return res.json({ error: "Nothing entered for confirm password" });
    if (newPassword !== confPassword)
        return res.json({ error: "New password and confirmation password don't match" });
    if (newPassword == curPassword)
        return res.json({ error: "New password cannot be the same as the current password" });
    let resp = await (0, db_js_1.checkUser)(user.email, curPassword);
    if (resp === 0)
        return res.json({ error: "Current account doesn't exist" });
    else if (resp === false)
        return res.json({ error: "Incorrect password" });
    (0, db_js_1.setUserPassword)(uid, newPassword);
    res.json({ success: 'Password changed!' });
});
app.post('/api/profile/:uid/settings/setEmail', async function (req, res) {
    let { uid } = req.params;
    let { email } = req.body;
    let id = req.cookies['id'];
    let user = await (0, db_js_1.getUserProfile)(uid);
    if (user === null)
        return res.json({ error: "User doesn't exist" });
    if (user.session != id)
        return res.json({ error: "User not logged in / not correct account" });
    if (email.length == 0)
        return res.json({ error: "New email not entered" });
    if (email == user.email)
        return res.json({ error: "New email cannot be the same as the current email" });
    if (!validateEmail(email))
        return res.json({ error: "New email must have a valid address" });
    let us = await (0, db_js_1.getUser)({ email }, false);
    if (us.length > 0)
        return res.json({ error: "email is currently in use" });
    (0, db_js_1.editUserField)(uid, 'email', email);
    res.json({ success: "Email changed successfully!" });
});
// LIST DATA
app.get('/api/list/:listid', async (req, res) => {
    let { listid } = req.params;
    let id = req.cookies['id'];
    let uid = req.cookies['uid'];
    let list = await (0, db_js_1.getList)(listid, true, false);
    if (!list)
        list = await (0, db_js_1.getList)(listid, false, false);
    if (!list)
        return res.json({ error: 'list not found' });
    let user = await (0, db_js_1.getUserProfile)(list.owner);
    let session = (user === null) ? "" : user.session;
    let ret = {
        name: list.name,
        sections: list.sections,
        profPic: user?.profPic,
        topPic: list.topImage,
        owner: session === id,
        checks: {}
    };
    if (user != null && session === id && id && uid)
        ret.checks = user.listProgress[listid];
    res.json(ret);
});
app.get('/api/viewer/:listid/getChecks', async (req, res) => {
    let session = req.cookies['id'];
    let uid = req.cookies['uid'];
    if (!session || !uid)
        return res.json({});
    let { listid } = req.params;
    let users = await (0, db_js_1.getUser)({ '.id': uid }, false);
    if (users.length == 0)
        return res.json({});
    let user = users[0].user;
    if (user.session != session)
        return res.json({});
    return res.json(user.listProgress[listid]);
});
app.post('/api/newList/:uid', async (req, res) => {
    let id = req.cookies['id'];
    let { uid } = req.params;
    let user = await (0, db_js_1.getUser)({ '.id': uid }, false);
    if (user.length > 0 && user[0].user.session == id) {
        let resp = await (0, db_js_1.saveList)("New List", uid, "");
        return res.json({ success: resp.id });
    }
    res.json({ 'error': '/' });
});
function getListFromUser(user, listid) {
    return user.personalLists.find(e => e.id === listid);
}
async function checkList(req, res, uid, listid) {
    let id = req.cookies['id'];
    let userD = await (0, db_js_1.checkUserCookie)(uid, id);
    if (userD === false)
        return { session: 'error', user: 'User not found or not allowed to edit', list: null, ul: null };
    let user = userD.user;
    let ul = getListFromUser(user, listid);
    if (ul === undefined)
        return { session: 'error', user: 'List not found', list: null, ul: null };
    let list = await (0, db_js_1.getList)(listid, ul.viewable, false);
    if (list === null)
        return { session: 'error', user: 'List not found', list: null, ul: null };
    return { session: id, user: user, list, ul };
}
app.post('/api/edit/:uid/:listid/editListName', async (req, res) => {
    let { uid, listid } = req.params;
    let { name } = req.body;
    let { session, user, ul } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    (0, db_js_1.changeListField)(listid, 'name', name);
    return res.json({ 'success': true });
});
app.post('/api/deleteList/:uid/:listid/', async (req, res) => {
    let { uid, listid } = req.params;
    let { session, user } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    (0, db_js_1.deleteList)(listid);
    return res.json({ 'success': true });
});
app.post('/api/edit/:uid/:listid/addSection', async (req, res) => {
    let { uid, listid } = req.params;
    let { color } = req.body;
    let { session, user, list, ul } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    let ids = await (0, db_js_1.newSection)(listid, Object.keys(list.sections).length, color);
    if (!ids.id)
        return res.json({ 'error': 'Error adding section' });
    return res.json(ids);
});
app.post('/api/edit/:uid/:listid/editSection', async (req, res) => {
    let { uid, listid } = req.params;
    let { sid, field, value } = req.body;
    let { session, user, ul } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    let worked = await (0, db_js_1.editSection)(listid, sid, field, value);
    if (!worked)
        return res.json({ 'error': 'Error adding section' });
    return res.json({ 'success': worked });
});
app.post('/api/edit/:uid/:listid/deleteSection', async (req, res) => {
    let { uid, listid } = req.params;
    let { sid } = req.body;
    let { session, user, list, ul } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    let worked = await (0, db_js_1.deleteSection)(list, listid, sid);
    if (!worked)
        return res.json({ 'error': 'Error deleting section' });
    return res.json({ 'success': worked });
});
app.post('/api/edit/:uid/:listid/addItem', async (req, res) => {
    let { uid, listid } = req.params;
    let { sid, ind } = req.body;
    let { session, user, ul, list } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    if (!(sid in list.sections))
        return res.json({ 'error': 'Error adding section' });
    let tid = await (0, db_js_1.newItem)(list, listid, sid, ind);
    if (!tid)
        return res.json({ 'error': 'Error adding section' });
    return res.json({ success: tid });
});
app.post('/api/edit/:uid/:listid/editItem', async (req, res) => {
    let { uid, listid } = req.params;
    let { sid, tid, value } = req.body;
    let { session, user } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    let worked = await (0, db_js_1.editItem)(uid, listid, sid, tid, value);
    if (!worked)
        return res.json({ 'error': 'Error adding section' });
    return res.json({ 'success': worked });
});
app.post('/api/edit/:uid/:listid/deleteItem', async (req, res) => {
    let { uid, listid } = req.params;
    let { sid, tid } = req.body;
    let { session, user } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    let worked = await (0, db_js_1.deleteItem)(uid, listid, sid, tid);
    if (!worked)
        return res.json({ 'error': 'Error deleting section' });
    return res.json({ 'success': worked });
});
app.post('/api/edit/:uid/:listid/uploadTopImage', (0, express_fileupload_1.default)(), async function (req, res) {
    if (!req.files || !req.files.file)
        return res.json({ error: 'image not supplied' });
    let { uid, listid } = req.params;
    let { session, user, ul } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    let file = req.files.file;
    let id = Math.round(Math.random() * 1e15);
    let parts = file.name.split('.');
    let name = id + '.' + parts[parts.length - 1];
    (0, db_js_1.uploadImage)(name, file, parts[parts.length - 1], (url) => {
        if (url.length > 0) {
            (0, db_js_1.changeListField)(listid, 'topImage', url);
        }
        res.json({ url });
    });
});
app.post('/api/edit/:uid/:listid/uploadCoverImage', (0, express_fileupload_1.default)(), async function (req, res) {
    if (!req.files || !req.files.file)
        return res.json({ error: 'image not supplied' });
    let { uid, listid } = req.params;
    let { session, user, ul } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    let file = req.files.file;
    let id = Math.round(Math.random() * 1e15);
    let parts = file.name.split('.');
    let name = id + '.' + parts[parts.length - 1];
    (0, db_js_1.uploadImage)(name, file, parts[parts.length - 1], (url) => {
        if (url.length > 0) {
            (0, db_js_1.changeListField)(listid, 'image', url);
        }
        res.json({ url });
    });
});
app.post('/api/edit/:uid/:listid/setPublic', async (req, res) => {
    let { uid, listid } = req.params;
    let { isPublic } = req.body;
    let { session, user, ul } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    (0, db_js_1.changeListField)(listid, 'public', isPublic);
    return res.json({ 'success': true });
});
app.post('/api/viewer/:listid/checkItem', async (req, res) => {
    let session = req.cookies['id'];
    let uid = req.cookies['uid'];
    if (!session || !uid)
        return res.json({ "error": '' });
    let { listid } = req.params;
    let { sid, tid, checked } = req.body;
    let users = await (0, db_js_1.getUser)({ '.id': uid }, false);
    if (users.length == 0)
        return res.json({ "error": '' });
    let user = users[0].user;
    if (user.session != session)
        return res.json({ "error": '' });
    await (0, db_js_1.updateUserProgress)(uid, listid, sid, tid, checked);
    return res.json({ 'success': '' });
});
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
