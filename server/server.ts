import express from "express";
// import {userExists, saveNewUser, User, List, UserList, checkUser, getUser, getUserProfile, getList, UserDoc, getSession, saveList, checkUserCookie, makeID, updateList} from "./db.js";



const PORT = process.env.PORT || 3001;

const app = express();

function validateEmail(email: string): boolean{
	return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
}

app.get('/api', (req, res) => {
    res.json({message: "hello michael"});
})
// app.post('/api:login', async (req, res) => {
//     let body = req.body;
// 	if (!body.login){ // signing up
// 		// check for errors: not an email, no confirmation password, passwords don't match, password is less than 6 characters, user already exists
// 		if (!validateEmail(body.username)) return res.send(JSON.stringify({ error: "You must enter a valid email address" }));
// 		else if (body.pass2.length == 0) return res.send(JSON.stringify({ error: "Password confirmation must be filled" }));
// 		else if (body.pass2 != body.password) return res.send(JSON.stringify({ error: "Passwords must match" }));
// 		else if (body.password.length < 6) return res.send(JSON.stringify({ error: "Password must be at least 6 characters long" }));
// 		else if (await userExists({email: body.username})) return res.send(JSON.stringify({ error: "A user already exists with this email" }));

// 		// save the user
// 		await saveNewUser(body.username, body.username.split('@')[0], body.password, 'free', false, {cvv: "", number: ""});	
// 		return res.send(JSON.stringify({ success: "Your account was created! Check your inbox for a confirmation email." }))
// 	}
// 	else {
// 		let resp = await checkUser(body.username, body.password);
// 		if ( resp === 0 ) return res.send(JSON.stringify({ error: "No account exists with this email / username" }));
// 		else if (resp === false) return res.send(JSON.stringify({ error: "Incorrect password." }));
// 		let user: UserDoc = (await getUser({email: body.username, name: body.username}, false))[0];

// 		let session = await getSession(user.id, body.password);
// 		if (session.length > 0) res.cookie('id', session, {httpOnly: true});
// 		return res.send(JSON.stringify({ success: "/profile/" + user.id }));
// 	}
// })
// app.post('/api/:account/lists/:listid', async (req, res) => {
// 	let { account, listid } = req.params;
// 	let list: List | null = await getList(listid, true, false);
// 	if (!list) list = await getList(listid, false, false) as List;
// 	res.render('listEdit.html', {name: list.name, sections: list.sections});
// });

// app.post('/api//:account/:listid/addSection', async (req, res) => {
// 	let { account, listid } = req.params;
// 	let session: string = req.cookies['id'];
// 	let user: UserDoc | boolean = await checkUserCookie(account, session);
// 	// check if the user is actually logged in
// 	if (user === false) return res.send(JSON.stringify({'error': '/'}));
// 	// check if the user owns the list
// 	if (listid in (user as UserDoc).user.personalLists){
// 		let ulist: UserList = (user as UserDoc).user.personalLists[listid],
// 			id = makeID(8),
// 			list: List | null = await getList(listid, ulist.viewable, false);
// 		if (req.body.type == 'section'){
// 			if (!list) return res.send(JSON.stringify({'error': '/'}));
// 			while (id in (list as List).sections) id = makeID(8);
// 			await updateList(listid, 'add', 'section', [id, 'New Section'], ulist.viewable);
// 			return res.send(JSON.stringify({'success': id}));
// 		}
// 		else if (req.body.type == 'option') {
// 			if (!list || !(list as List).sections[req.body.sid]) return res.send(JSON.stringify({'error': '/'}));
// 			while (id in (list as List).sections[req.body.sid]) id = makeID(8);
// 			return res.send(JSON.stringify({'success': id}));
// 		}
// 	}
// 	res.send(JSON.stringify({'error': '/'}));
// });



app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});