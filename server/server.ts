import express from "express";
import fileUpload from 'express-fileupload';
const cookieParser = require('cookie-parser');
import {userExists, saveNewUser, User, List, UserList, checkUser, getUser, getUserProfile, getList, editUserField, setUserPassword, UserDoc, getSession, 
		saveList, checkUserCookie, changeListField, newSection, editSection, deleteSection, newItem, editItem, deleteItem,
		updateUserProgress, uploadImage, deleteList} from "./db.js";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cookieParser(process.env.cookie_secret));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function validateEmail(email: string): boolean{
	return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
}

app.get('/testsession', async (req, res) => {
	let session = req.cookies['id'];
	let uid = req.cookies['uid'];
	if (!session || !uid) return res.json({error: false});
	let user: UserDoc[] = await getUser({'.id': uid}, false);
	if (user.length == 0) return res.json({error: false});
	let u: User = user[0].user;
	if (u.session !== session) return res.json({error: false});
	res.json({name: u.name, uid});
});

app.get('/api', (req, res) => {
    res.json({message: "hello michael"});
});

// LOGIN / LOGOUT
app.post('/api/login', async (req, res) => {
    let body = req.body;
	if (!body.login){ // signing up
		// check for errors: not an email, no confirmation password, passwords don't match, password is less than 6 characters, user already exists
		if (!validateEmail(body.username)) return res.json({ error: "You must enter a valid email address" });
		else if (body.pass2.length == 0) return res.json({ error: "Password confirmation must be filled" });
		else if (body.pass2 != body.password) return res.json({ error: "Passwords must match" });
		else if (body.password.length < 6) return res.json({ error: "Password must be at least 6 characters long" });
		else if (await userExists({email: body.username})) return res.json({ error: "A user already exists with this email" });

		// save the user
		await saveNewUser(body.username, body.username.split('@')[0], body.password, 'free', false, {cvv: "", number: ""});	
		return res.json({ success: "Your account was created! Check your inbox for a confirmation email." });
	}
	else {
		let resp = await checkUser(body.username, body.password);
		if ( resp === 0 ) return res.json({ error: "No account exists with this email / username" });
		else if (resp === false) return res.json({ error: "Incorrect password." });
		let user: UserDoc = (await getUser({email: body.username, name: body.username}, false))[0];

		let session = await getSession(user.id, body.password);
		if (session.length > 0){
			res.cookie('id', session, {httpOnly: true});
			res.cookie('uid', user.id, {httpOnly: true});
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
    let user: User | null = await getUserProfile(uid);
    if (user === null) return res.json({error: "User doesn't exist"});
    let filtered: any = {
        name: user.name,
        personalLists: [],
        profPic: user.profPic,
        topPic: user.topPic,
        owner: id === user.session
    }

	for (let l of user.personalLists){
		let list: List | null = await getList(l.id, l.viewable, false);
		if (list === null) continue;
		if (id !== user.session && !list.public) continue;
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
    let user: User | null = await getUserProfile(uid);
    if (user === null) return res.json({error: "User doesn't exist"});
	if (user.session != id) return res.json({error: "User not logged in / not correct account"});
    let details: any = {
        name: user.name,
        profPic: user.profPic,
        topPic: user.topPic,
		email: user.email,
		plan: user.plan
    }

    res.json(details);
});
app.post('/api/edit/:uid/uploadMainImage', fileUpload(), async function(req, res) {
	if (!req.files || !req.files.file) return res.json({error: 'image not supplied'});
	let { uid } = req.params;
    let id = req.cookies['id'];
    let user: User | null = await getUserProfile(uid);
    if (user === null) return res.json({error: "User doesn't exist"});
	if (user.session != id) return res.json({error: "User not logged in / not correct account"});

	let file = req.files.file as fileUpload.UploadedFile;

	let fileId = Math.round(Math.random()*1e15);
	let parts = file.name.split('.');
	let name = fileId + '.' + parts[parts.length - 1];
	uploadImage(name, file, parts[parts.length - 1], (url: string) => {
		if (url.length > 0){
			editUserField(uid, 'topPic', url);
		}
		res.json({ url });
	});
})
app.post('/api/profile/:uid/settings/setUsername', async function(req, res) {
	let { uid } = req.params;
	let { username } = req.body;
    let id = req.cookies['id'];
    let user: User | null = await getUserProfile(uid);
    if (user === null) return res.json({error: "User doesn't exist"});
	if (user.session != id) return res.json({error: "User not logged in / not correct account"});

	if (username.length == 0) return res.json({ error: "New username not entered" });
	if (username == user.name) return res.json({ error: "New username cannot be the same as the current username" });
	let us: UserDoc[] = await getUser({name: username}, false);
	if (us.length > 0) return res.json({ error: "Username is taken" });

	editUserField(uid, 'name', username);
	res.json({ success: "Username changed successfully!" });
})
app.post('/api/profile/:uid/settings/setPassword', async function(req, res) {
	let { uid } = req.params;
	let { curPassword, newPassword, confPassword } = req.body;
    let id = req.cookies['id'];
    let user: User | null = await getUserProfile(uid);
    if (user === null) return res.json({error: "User doesn't exist"});
	if (user.session != id) return res.json({error: "User not logged in / not correct account"});

	if (curPassword.length == 0) return res.json({ error: "Nothing entered for current password" });
	if (newPassword.length == 0) return res.json({ error: "Nothing entered for new password" });
	if (confPassword.length == 0) return res.json({ error: "Nothing entered for confirm password" });
	if (newPassword !== confPassword) return res.json({ error: "New password and confirmation password don't match" });
	if (newPassword == curPassword) return res.json({ error: "New password cannot be the same as the current password" });
	let resp = await checkUser(user.email, curPassword);
	if ( resp === 0 ) return res.json({ error: "Current account doesn't exist" });
	else if (resp === false) return res.json({ error: "Incorrect password" });

	setUserPassword(uid, newPassword);
	res.json({success: 'Password changed!'});
	
})

// LIST DATA
app.get('/api/list/:listid', async (req, res) => {
	let { listid } = req.params;
	let id = req.cookies['id'];
	let uid = req.cookies['uid'];
	let list: List | null = await getList(listid, true, false);
	if (!list) list = await getList(listid, false, false) as List;
	if (!list) return res.json({error: 'list not found'});
	let user: User | null = await getUserProfile(list.owner);
	let session = (user === null) ? "" : user.session;
	let ret = {
		name: list.name, 
		sections: list.sections,
		profPic: user?.profPic,
		topPic: list.topImage,
		owner: session === id,
		checks: {}
	};
	if (user != null && session === id && id && uid) ret.checks = (user as User).listProgress[listid];
	
	res.json(ret);
});
app.get('/api/viewer/:listid/getChecks', async (req, res) => {
	let session = req.cookies['id'];
	let uid = req.cookies['uid'];
	
	if (!session || !uid) return res.json({});
	let { listid } = req.params;

	let users: UserDoc[] = await getUser({'.id': uid}, false);
	if (users.length == 0) return res.json({});
	let user = users[0].user;
	if (user.session != session) return res.json({});
	return res.json(user.listProgress[listid]);
})

app.post('/api/newList/:uid', async (req, res) => {
	let id = req.cookies['id'];
	let {uid} = req.params;
	let user: UserDoc[] = await getUser({'.id': uid}, false);
	if (user.length > 0 && user[0].user.session == id){
		let resp = await saveList("New List", uid, "");
		return res.json({success: resp.id});
	}
	res.json({'error': '/'});
});

function getListFromUser(user: User, listid: string): UserList | undefined{
	return user.personalLists.find(e => e.id === listid);
}

async function checkList(req: any, res: any, uid: string, listid: string): Promise<{ session: string; user: User | string; list: List | null; ul: UserList | null}> {
	let id = req.cookies['id'];
	let userD: UserDoc | false = await checkUserCookie(uid, id);
	if (userD === false) return {session: 'error', user: 'User not found or not allowed to edit', list: null, ul: null};
	let user = userD.user;
	let ul: UserList | undefined = getListFromUser(user, listid);
	if (ul === undefined) return {session: 'error', user: 'List not found', list: null, ul: null};
	let list: List | null = await getList(listid, ul.viewable, false);
	if (list === null) return {session: 'error', user: 'List not found', list: null, ul: null};
	return {session: id, user: user, list, ul};
}

app.post('/api/edit/:uid/:listid/editListName', async (req, res) => {
	let { uid, listid } = req.params;
	let { name } = req.body;
	let { session, user, ul } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	changeListField(listid, 'name', name);
	return res.json({'success': true});
});
app.post('/api/deleteList/:uid/:listid/', async (req, res) => {
	let { uid, listid } = req.params;
	let { session, user } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	deleteList(listid);
	return res.json({'success': true});
});
app.post('/api/edit/:uid/:listid/addSection', async (req, res) => {
	let { uid, listid } = req.params;
	let { color } = req.body;
	let { session, user, list, ul } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let ids = await newSection(listid, Object.keys((list as List).sections).length, color);
	if (!ids.id) return res.json({'error': 'Error adding section'});
	return res.json(ids);
});
app.post('/api/edit/:uid/:listid/editSection', async (req, res) => {
	let { uid, listid } = req.params;
	let { sid, field, value } = req.body;
	let { session, user, ul } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let worked = await editSection(listid, sid, field, value);
	if (!worked) return res.json({'error': 'Error adding section'});
	return res.json({'success': worked});
});
app.post('/api/edit/:uid/:listid/deleteSection', async (req, res) => {
	let { uid, listid } = req.params;
	let { sid } = req.body;
	let { session, user, list, ul } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let worked = await deleteSection(list, listid, sid);
	if (!worked) return res.json({'error': 'Error deleting section'});
	return res.json({'success': worked});
});
app.post('/api/edit/:uid/:listid/addItem', async (req, res) => {
	let { uid, listid } = req.params;
	let { sid, ind } = req.body;  
	let { session, user, ul, list } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	if (!(sid in (list as List).sections)) return res.json({'error': 'Error adding section'});
	let tid = await newItem(list, listid, sid, ind);
	if (!tid) return res.json({'error': 'Error adding section'});
	return res.json({ success: tid });
});
app.post('/api/edit/:uid/:listid/editItem', async (req, res) => {
	let { uid, listid } = req.params;
	let { sid, tid, value } = req.body;
	let { session, user } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let worked = await editItem(uid, listid, sid, tid, value);
	if (!worked) return res.json({'error': 'Error adding section'});
	return res.json({'success': worked});
});
app.post('/api/edit/:uid/:listid/deleteItem', async (req, res) => {
	let { uid, listid } = req.params;
	let { sid, tid } = req.body;
	let { session, user } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let worked = await deleteItem(uid, listid, sid, tid);
	if (!worked) return res.json({'error': 'Error deleting section'});
	return res.json({'success': worked});
});
app.post('/api/edit/:uid/:listid/uploadTopImage', fileUpload(), async function(req, res) {
	if (!req.files || !req.files.file) return res.json({error: 'image not supplied'});
	let { uid, listid } = req.params;
	let { session, user, ul } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let file = req.files.file as fileUpload.UploadedFile;

	let id = Math.round(Math.random()*1e15);
	let parts = file.name.split('.');
	let name = id + '.' + parts[parts.length - 1];
	uploadImage(name, file, parts[parts.length - 1], (url: string) => {
		if (url.length > 0){
			changeListField(listid, 'topImage', url);
		}
		res.json({ url });
	});
});
app.post('/api/edit/:uid/:listid/uploadCoverImage', fileUpload(), async function(req, res) {
	if (!req.files || !req.files.file) return res.json({error: 'image not supplied'});
	let { uid, listid } = req.params;
	let { session, user, ul } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let file = req.files.file as fileUpload.UploadedFile;

	let id = Math.round(Math.random()*1e15);
	let parts = file.name.split('.');
	let name = id + '.' + parts[parts.length - 1];
	uploadImage(name, file, parts[parts.length - 1], (url: string) => {
		if (url.length > 0){
			changeListField(listid, 'image', url);
		}
		res.json({ url });
	});
});
app.post('/api/edit/:uid/:listid/setPublic', async (req, res) => {
	let { uid, listid } = req.params;
	let { isPublic } = req.body;
	let { session, user, ul } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	changeListField(listid, 'public', isPublic);
	return res.json({'success': true});
});
app.post('/api/viewer/:listid/checkItem', async (req, res) => {
	let session = req.cookies['id'];
	let uid = req.cookies['uid'];

	if (!session || !uid) return res.json({"error": ''});
	let { listid } = req.params;
	let { sid, tid, checked } = req.body;

	let users: UserDoc[] = await getUser({'.id': uid}, false);
	if (users.length == 0) return res.json({"error": ''});
	let user = users[0].user;
	if (user.session != session) return res.json({"error": ''});

	await updateUserProgress(uid, listid, sid, tid, checked);
	return res.json({'success': ''});
});




app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});