"use strict";
/**
 * Things to do:
 * Set up firebase or firestore (not sure which one)
 * Algolia for search capabilities
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserCookie = exports.getSession = exports.saveList = exports.saveTemplate = exports.saveNewUser = exports.updateList = exports.getList = exports.getUserProfile = exports.getUser = exports.makeID = exports.checkUser = exports.hashPassword = exports.userExists = void 0;
// const admin = require('firebase-admin');
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
// const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert('./credentials.json'),
    storageBucket: `bringit-a32a6.appspot.com`
});
const Db = admin.firestore();
const Bucket = admin.storage().bucket();
const FieldValue = admin.firestore.FieldValue;
const Users = Db.collection('Users');
const Organizations = Db.collection('Organizations');
const PvLists = Db.collection('Private Lists');
const PbLists = Db.collection('Public Lists');
const PvTemplates = Db.collection('Private Templates');
const PbTemplates = Db.collection('Public Templates');
async function userExists(anyOf) {
    for (let x in anyOf) {
        let snapshot = await Users.where(x, '==', anyOf[x]).get();
        if (!snapshot.empty)
            return true;
    }
    return false;
}
exports.userExists = userExists;
function hashPassword(password, salt) {
    if (!salt)
        salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return [hash, salt];
}
exports.hashPassword = hashPassword;
async function checkUser(username, password) {
    if (!(await userExists({ email: username, name: username })))
        return 0; // username doesn't exist
    let user = (await getUser({ email: username, name: username }, false))[0];
    let [hash, salt] = hashPassword(password, user.user.salt);
    return hash == user.user.password; // true: success, false: wrong password
}
exports.checkUser = checkUser;
function makeUser(email, name, password, payType, acctType, creditcard) {
    let [hash, salt] = hashPassword(password);
    return {
        creditDetails: {
            cvv: creditcard.cvv || '',
            number: creditcard.number || ''
        },
        email: email,
        listProgress: {},
        name: name,
        password: hash,
        personalLists: {},
        personalTemplates: {},
        plan: payType,
        profPic: "",
        salt: salt,
        savedLists: {},
        savedTemplates: {},
        timeLastPaid: admin.firestore.Timestamp.fromDate(new Date()),
        topPic: "",
        type: acctType
    };
}
function makeList(name, owner, password) {
    return {
        image: "",
        name: name,
        owner: owner,
        password: password || "",
        saveDate: admin.firestore.Timestamp.fromDate(new Date()),
        sections: {}
    };
}
function makeTemplate(name, owner, password) {
    return {
        image: "",
        name: name,
        owner: owner,
        password: password || "",
        saveDate: admin.firestore.Timestamp.fromDate(new Date()),
        sections: {}
    };
}
function makeID(length) {
    return crypto.randomBytes(length).toString('hex');
}
exports.makeID = makeID;
async function getUser(selections, all, collection) {
    let arr = [];
    if (all) {
        let ref = collection ? Organizations : Users;
        for (let i in selections)
            ref = ref.where(i, '==', selections[i]);
        let snapshot = await ref.get();
        arr = snapshot.docs.map((doc) => ({ id: doc.id, user: doc.data() }));
        return arr;
    }
    else {
        for (let i in selections) {
            if (i == '.id') {
                let doc = await (collection ? Organizations : Users).doc(selections[i]).get();
                if (doc.exists)
                    arr.push({ id: i, user: doc.data() });
                continue;
            }
            let snapshot = await (collection ? Organizations : Users).where(i, '==', selections[i]).get();
            if (!snapshot.empty) {
                let doc = snapshot.docs[0];
                arr.push({ id: doc.id, user: doc.data() });
            }
        }
        return arr;
    }
}
exports.getUser = getUser;
async function getUserProfile(uid) {
    let user = await Organizations.doc(uid).get();
    if (user.exists)
        return user.data();
    user = await Users.doc(uid).get();
    if (user.exists)
        return user.data();
    return null;
}
exports.getUserProfile = getUserProfile;
async function getList(id, viewable, isTemplate) {
    let col = viewable ? isTemplate ? PbTemplates : PbLists : isTemplate ? PvTemplates : PvLists;
    let list = await col.doc(id).get();
    if (list.exists)
        return list.data();
    return null;
}
exports.getList = getList;
async function updateList(listid, action, type, ids, viewable) {
    let Lists = viewable ? PbLists : PvLists;
    if (action == 'add') {
        let update = {}; // add either a section or option to a section
        if (type == 'section')
            update[`sections.${ids[0]}`] = { items: {}, name: ids[1] };
        else if (type == 'option')
            update[`sections.${ids[0]}.items.${ids[1]}`] = ids[2];
        else
            return false;
        await Lists.doc(listid).update(update);
        return true;
    }
    else if (action == 'delete') {
        let update = {}; // delete a section or option of a section
        if (type == 'section')
            update[`sections.${ids[0]}`] = FieldValue.delete();
        else if (type == 'option')
            update[`sections.${ids[0]}.items.${ids[2]}`] = FieldValue.delete();
        else
            return false;
        await Lists.doc(listid).update(update);
        return true;
    }
    else if (action == 'update') {
        let update = {}; // update the name of the list or a section or update the text of an option
        if (type == 'list')
            update['name'] = ids[0];
        else if (type == 'section')
            update[`sections.${ids[0]}.name`] = ids[1];
        else if (type == 'option')
            update[`sections.${ids[0]}.items.${ids[1]}`] = ids[2];
        else
            return false;
        await Lists.doc(listid).update(update);
        return true;
    }
    else
        return false;
}
exports.updateList = updateList;
async function saveNewUser(email, name, password, payType, acctType, creditcard) {
    let user = makeUser(email, name, password, payType, acctType, creditcard);
    var res;
    if (acctType) {
        res = await Organizations.add(user);
    }
    else {
        if (await userExists({ email: email, name: name }))
            return;
        res = await Users.add(user);
    }
    return res;
}
exports.saveNewUser = saveNewUser;
async function saveTemplate(name, userID, password) {
    let template = makeTemplate(name, userID, password);
    let res = await PvTemplates.add(template);
    return res;
}
exports.saveTemplate = saveTemplate;
async function saveList(name, uid, password) {
    let list = makeList(name, uid, password);
    let res = await PvLists.add(list);
    let upd = {}; // UserList to be added (update)
    upd[res.id] = {
        saveDate: list.saveDate,
        viewable: false
    };
    let user = await Organizations.doc(uid).get();
    if (user.exists)
        await Organizations.doc(uid).update({ personalLists: upd });
    else {
        user = await Users.doc(uid).get();
        if (user.exists)
            await Users.doc(uid).update({ personalLists: upd });
    }
    return res;
}
exports.saveList = saveList;
async function getSession(uid, password) {
    let user = await Users.doc(uid).get();
    let data = user.data();
    if (await checkUser(data.name, password)) {
        if (data.session)
            return data.session;
        let sessionID = makeID(36);
        await Users.doc(uid).update({
            session: sessionID
        });
        return sessionID;
    }
    else
        return "";
}
exports.getSession = getSession;
async function checkUserCookie(uid, session) {
    let user = await getUser({ '.id': uid }, false);
    return (user.length > 0 && user[0].user.session == session) ? user[0] : false;
}
exports.checkUserCookie = checkUserCookie;
