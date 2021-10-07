import express from "express";
const cookieParser = require('cookie-parser');
import {userExists, saveNewUser, User, List, UserList, checkUser, getUser, getUserProfile, getList, UserDoc, getSession, 
		saveList, checkUserCookie, makeID, getUserList, newSection, editSection, deleteSection} from "./db.js";



const PORT = process.env.PORT || 3001;

const app = express();
app.use(cookieParser(process.env.cookie_secret));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function validateEmail(email: string): boolean{
	return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
}

app.get('/api', (req, res) => {
    res.json({message: "hello michael"});
});
app.post('/api/login', async (req, res) => {
    let body = req.body;
    console.log(body);
	if (!body.login){ // signing up
		// check for errors: not an email, no confirmation password, passwords don't match, password is less than 6 characters, user already exists
		if (!validateEmail(body.username)) return res.send(JSON.stringify({ error: "You must enter a valid email address" }));
		else if (body.pass2.length == 0) return res.send(JSON.stringify({ error: "Password confirmation must be filled" }));
		else if (body.pass2 != body.password) return res.send(JSON.stringify({ error: "Passwords must match" }));
		else if (body.password.length < 6) return res.send(JSON.stringify({ error: "Password must be at least 6 characters long" }));
		else if (await userExists({email: body.username})) return res.send(JSON.stringify({ error: "A user already exists with this email" }));

		// save the user
		await saveNewUser(body.username, body.username.split('@')[0], body.password, 'free', false, {cvv: "", number: ""});	
		return res.json({ success: "Your account was created! Check your inbox for a confirmation email." });
	}
	else {
		let resp = await checkUser(body.username, body.password);
		if ( resp === 0 ) return res.send(JSON.stringify({ error: "No account exists with this email / username" }));
		else if (resp === false) return res.send(JSON.stringify({ error: "Incorrect password." }));
		let user: UserDoc = (await getUser({email: body.username, name: body.username}, false))[0];

		let session = await getSession(user.id, body.password);
		if (session.length > 0) res.cookie('id', session, {httpOnly: true});
		return res.json({ success: "/profile/" + user.id });
	}
});
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
	// console.log(user.personalLists);
	for (let l of user.personalLists){
		// console.log('L', l);
		let list: List | null = await getList(l.id, l.viewable, false);
		// console.log('LIST', list);
		if (list === null) continue;
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
	let list: List | null = await getList(listid, true, false);
	if (!list) list = await getList(listid, false, false) as List;
	let user: User | null = await getUserProfile(list.owner);
	let session = (user === null) ? "" : user.session;
	res.json({
		name: list.name, 
		sections: list.sections,
		owner: session === id
	});
});
app.get('/logout', (req, res) => {

});

app.post('/api/newList/:uid', async (req, res) => {
	let id = req.cookies['id'];
	let {uid} = req.params;
	let user: UserDoc[] = await getUser({'.id': uid}, false);
	if (user.length > 0 && user[0].user.session == id){
		let resp = await saveList("New List", uid, "");
		return res.json({success: resp.id});
	}
	console.log('user not found');
	res.json({'error': '/'});
});

async function checkList(req: any, res: any, uid: string, listid: string): Promise<{ session: string; user: User | string; list: List | null; }> {
	let id = req.cookies['id'];
	let user: UserDoc[] = await getUser({'.id': uid}, false);
	if (user.length == 0) return {session: 'error', user: 'User not found', list: null};
	if (user[0].user.session !== id) return {session: 'error', user: 'Other users are not allowed to edit this list', list: null};
	let ul: UserList | null = await getUserList(uid, listid);
	if (ul === null) return {session: 'error', user: 'List not found', list: null};
	let list: List | null = await getList(listid, ul.viewable, false);
	if (list === null) return {session: 'error', user: 'List not found', list: null};
	return {session: id, user: user[0].user, list}
}

app.post('/api/edit/:uid/:listid/addSection', async (req, res) => {
	let { uid, listid } = req.params;
	let { color } = req.body;
	let { session, user, list } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let ids = await newSection(uid, listid, Object.keys((list as List).sections).length, color);
	if (!ids.id) return res.json({'error': 'Error adding section'});
	return res.json(ids);
});
app.post('/api/edit/:uid/:listid/editSection', async (req, res) => {
	let { uid, listid } = req.params;
	let { sid, field, value } = req.body;
	let { session, user } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let worked = await editSection(uid, listid, sid, field, value);
	if (!worked) return res.json({'error': 'Error adding section'});
	return res.json({'success': worked});
})
app.post('/api/edit/:uid/:listid/deleteSection', async (req, res) => {
	let { uid, listid } = req.params;
	let { sid } = req.body;
	let { session, user } = await checkList(req, res, uid, listid);
	if (session === 'error') return res.json({'error': user});
	let worked = await deleteSection(uid, listid, sid);
	if (!worked) return res.json({'error': 'Error deleting section'});
	return res.json({'success': worked});
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});