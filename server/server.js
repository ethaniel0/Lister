"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookieParser = require('cookie-parser');
const db_js_1 = require("./db.js");
const PORT = process.env.PORT || 3001;
const app = express_1.default();
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
    let user = await db_js_1.getUser({ '.id': uid }, false);
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
app.post('/api/login', async (req, res) => {
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
        return res.json({ success: "Your account was created! Check your inbox for a confirmation email." });
    }
    else {
        let resp = await db_js_1.checkUser(body.username, body.password);
        if (resp === 0)
            return res.send(JSON.stringify({ error: "No account exists with this email / username" }));
        else if (resp === false)
            return res.send(JSON.stringify({ error: "Incorrect password." }));
        let user = (await db_js_1.getUser({ email: body.username, name: body.username }, false))[0];
        let session = await db_js_1.getSession(user.id, body.password);
        if (session.length > 0) {
            res.cookie('id', session, { httpOnly: true });
            res.cookie('uid', user.id, { httpOnly: true });
        }
        return res.json({ success: "/profile/" + user.id });
    }
});
app.get('/api/profile/:uid', async (req, res) => {
    let { uid } = req.params;
    let id = req.cookies['id'];
    let user = await db_js_1.getUserProfile(uid);
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
        let list = await db_js_1.getList(l.id, l.viewable, false);
        if (list === null)
            continue;
        filtered.personalLists.push({
            id: l.id,
            name: list.name,
            image: list.image
        });
    }
    res.json(filtered);
});
app.get('/api/list/:listid', async (req, res) => {
    let { listid } = req.params;
    let id = req.cookies['id'];
    let list = await db_js_1.getList(listid, true, false);
    if (!list)
        list = await db_js_1.getList(listid, false, false);
    let user = await db_js_1.getUserProfile(list.owner);
    let session = (user === null) ? "" : user.session;
    res.json({
        name: list.name,
        sections: list.sections,
        profPic: user?.profPic,
        topPic: list.topImage,
        owner: session === id
    });
});
app.get('/logout', (req, res) => {
});
app.post('/api/newList/:uid', async (req, res) => {
    let id = req.cookies['id'];
    let { uid } = req.params;
    let user = await db_js_1.getUser({ '.id': uid }, false);
    if (user.length > 0 && user[0].user.session == id) {
        let resp = await db_js_1.saveList("New List", uid, "");
        return res.json({ success: resp.id });
    }
    res.json({ 'error': '/' });
});
function getListFromUser(user, listid) {
    return user.personalLists.find(e => e.id === listid);
}
async function checkList(req, res, uid, listid) {
    let id = req.cookies['id'];
    let userD = await db_js_1.checkUserCookie(uid, id);
    if (userD === false)
        return { session: 'error', user: 'User not found or not allowed to edit', list: null, ul: null };
    let user = userD.user;
    let ul = getListFromUser(user, listid);
    if (ul === undefined)
        return { session: 'error', user: 'List not found', list: null, ul: null };
    let list = await db_js_1.getList(listid, ul.viewable, false);
    if (list === null)
        return { session: 'error', user: 'List not found', list: null, ul: null };
    return { session: id, user: user, list, ul };
}
app.post('/api/edit/:uid/:listid/editListName', async (req, res) => {
    let { uid, listid } = req.params;
    let { name } = req.body;
    let { session, user, ul } = await checkList(req, res, uid, listid);
    console.log(name, session);
    if (session === 'error')
        return res.json({ 'error': user });
    db_js_1.changeListName(ul, listid, name);
    return res.json({ 'success': true });
});
app.post('/api/edit/:uid/:listid/addSection', async (req, res) => {
    let { uid, listid } = req.params;
    let { color } = req.body;
    let { session, user, list, ul } = await checkList(req, res, uid, listid);
    if (session === 'error')
        return res.json({ 'error': user });
    let ids = await db_js_1.newSection(ul, listid, Object.keys(list.sections).length, color);
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
    let worked = await db_js_1.editSection(ul, listid, sid, field, value);
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
    let worked = await db_js_1.deleteSection(ul, list, listid, sid);
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
    let tid = await db_js_1.newItem(ul, list, listid, sid, ind);
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
    let worked = await db_js_1.editItem(uid, listid, sid, tid, value);
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
    let worked = await db_js_1.deleteItem(uid, listid, sid, tid);
    if (!worked)
        return res.json({ 'error': 'Error deleting section' });
    return res.json({ 'success': worked });
});
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
