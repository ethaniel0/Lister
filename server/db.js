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
exports.checkUserCookie = exports.uploadImage = exports.deleteItem = exports.editItem = exports.newItem = exports.deleteSection = exports.editSection = exports.newSection = exports.addListView = exports.changeListField = exports.deleteList = exports.getSearchResults = exports.findLists = exports.setUserPassword = exports.editUserField = exports.saveList = exports.saveNewUser = exports.updateUserProgress = exports.getSession = exports.getList = exports.getUserList = exports.getUserProfile = exports.getUser = exports.makeID = exports.checkUser = exports.hashPassword = exports.userExists = void 0;
// const admin = require('firebase-admin');
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const levenshtein = __importStar(require("fast-levenshtein"));
// import { isStringObject } from "util/types";
// import fetch from 'node-fetch';
// const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert('server/credentials.json'),
    storageBucket: `bringit-a32a6.appspot.com`
});
const Db = admin.firestore();
const Bucket = admin.storage().bucket();
const FieldValue = admin.firestore.FieldValue;
const Users = Db.collection('Users');
const Lists = Db.collection('Lists');
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
        nameUpper: name.toUpperCase(),
        password: hash,
        personalLists: [],
        plan: payType,
        profPic: "/images/pfpic.png",
        salt: salt,
        savedLists: [],
        timeLastPaid: admin.firestore.Timestamp.fromDate(new Date()),
        topPic: "https://static.onecms.io/wp-content/uploads/sites/28/2017/05/blue0517.jpg",
        type: acctType
    };
}
function makeList(name, owner, password) {
    return {
        image: "https://cdn-icons-png.flaticon.com/512/149/149347.png",
        topImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Solid_green_%2880B682%29.svg/512px-Solid_green_%2880B682%29.svg.png",
        name: name,
        nameUpper: name.toUpperCase(),
        owner: owner,
        public: false,
        password: password || "",
        saveDate: admin.firestore.Timestamp.fromDate(new Date()),
        saves: 0,
        sections: {},
        tags: [],
        views: {}
    };
}
function makeID(length) {
    return crypto.randomBytes(length).toString('hex');
}
exports.makeID = makeID;
function getCurrentDay(millis) {
    let d = new Date();
    if (millis)
        d = new Date(millis);
    let year = d.getUTCFullYear();
    let month = d.getUTCMonth();
    let day = d.getUTCDate();
    return year + '-' + month + '-' + day;
}
// GET USER INFORMATION
async function getUser(selections, all, collection) {
    let arr = [];
    if (all) {
        let ref = Users;
        for (let i in selections)
            ref = ref.where(i, '==', selections[i]);
        let snapshot = await ref.get();
        arr = snapshot.docs.map((doc) => ({ id: doc.id, user: doc.data() }));
        return arr;
    }
    else {
        for (let i in selections) {
            if (i == '.id') {
                let doc = await Users.doc(selections[i]).get();
                if (doc.exists)
                    arr.push({ id: i, user: doc.data() });
                continue;
            }
            let snapshot = await Users.where(i, '==', selections[i]).get();
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
    let user = await Users.doc(uid).get();
    if (user.exists)
        return user.data();
    return null;
}
exports.getUserProfile = getUserProfile;
async function getUserList(uid, listid) {
    let user = await getUserProfile(uid);
    if (user === null)
        return null;
    let list = user.personalLists.find(e => e.id === listid);
    return list || null;
}
exports.getUserList = getUserList;
async function getList(id, viewable, isTemplate) {
    let list = await Lists.doc(id).get();
    if (list.exists)
        return list.data();
    return null;
}
exports.getList = getList;
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
// EDIT USER INFORMATION
async function updateUserProgress(uid, listid, sid, tid, checked) {
    let upd = {};
    upd[`listProgress.${listid}.${sid}.${tid}`] = checked;
    await Users.doc(uid).update(upd);
    return true;
}
exports.updateUserProgress = updateUserProgress;
async function saveNewUser(email, name, password, payType, acctType, creditcard) {
    let user = makeUser(email, name, password, payType, acctType, creditcard);
    if (await userExists({ email: email, name: name }))
        return;
    let res = await Users.add(user);
    return res;
}
exports.saveNewUser = saveNewUser;
async function saveList(name, uid, password) {
    let list = makeList(name, uid, password);
    let res = await Lists.add(list);
    let upd = {
        id: res.id,
        saveDate: list.saveDate,
        viewable: false
    };
    let user = await Users.doc(uid).get();
    if (user.exists)
        await Users.doc(uid).update({
            personalLists: admin.firestore.FieldValue.arrayUnion(upd)
        });
    return res;
}
exports.saveList = saveList;
async function editUserField(uid, field, value) {
    let upd = {};
    upd[field] = value;
    await Users.doc(uid).update(upd);
    return true;
}
exports.editUserField = editUserField;
async function setUserPassword(uid, password) {
    let [hash, salt] = hashPassword(password);
    editUserField(uid, 'password', hash);
    editUserField(uid, 'salt', salt);
    return true;
}
exports.setUserPassword = setUserPassword;
// SEARCH LISTS
function findLists(name) {
}
exports.findLists = findLists;
// name and tag scores are normalized and combined, view and save scores are kept as is
function weightDocument(query, doc) {
    let data = doc.data();
    let words = query.split(" ");
    let maxLev = Math.max(query.length, data.name.length);
    // get number for matching name
    let nameScore = (maxLev - levenshtein.get(query, data.name)) / maxLev;
    // matching tags
    let tagScore = 0;
    for (let tag of data.tags)
        if (words.includes(tag))
            tagScore++;
    tagScore = tagScore / data.tags.length;
    let nameWeight = 0.6;
    let combinedScore = nameScore * nameWeight + tagScore * (nameWeight - 1);
    // get # views in the past 2 weeks
    let viewScore = 0;
    let twoweeksago = getCurrentDay(Date.now() - 1209600000);
    // sort reversed
    let comparator = function (a, b) {
        let as = a.split('-');
        let bs = b.split('-');
        for (let i = 0; i < 3; i++) {
            as[i] = parseInt(as[i]);
            bs[i] = parseInt(bs[i]);
            if (as[i] != bs[i])
                return bs[i] - as[i];
        }
        return 0;
    };
    // sort the dates with most recent first
    let views = Object.keys(data.views).sort(comparator);
    for (let day of views) {
        // if the dat is earlier than two weeks ago, break
        if (comparator(day, twoweeksago) > 0)
            break;
        viewScore += data.views[day].length;
    }
    return [combinedScore, viewScore, data.saves];
}
function listSortComparator(a, b) {
    // a / b: [doc, [name/tag score, view score, save score]]
    // sort based on name/tag score first
    if (Math.abs(a[1][0] - b[1][0]) >= 0.1) {
        if (a[1][0] > b[1][0])
            return -1;
        return 1;
    }
    // if same or similar name/tag score, sort based on view score
    else {
        if (a[1][1] > b[1][1])
            return -1;
        return 1;
    }
}
async function getSearchResults(query) {
    // 1. Extract direct tags, load pages with those tags and get their weights
    let words = query.split(" "); // get individual words
    let firstDocs = [];
    let idsSeen = new Set();
    let tagsSeen = new Set();
    // fills firstDocs with docs containing tags
    if (words.length > 10) {
        for (let i = 0; i < Math.min(words.length, 15); i += 10) {
            let maxindex = Math.min(i + 10, words.length);
            let seenwords = words.slice(i, maxindex);
            seenwords.forEach(tagsSeen.add, tagsSeen);
            let snapshot = await Lists.where('tags', 'array-contains-any', seenwords).get();
            for (let doc of snapshot.docs) {
                firstDocs.push([doc, weightDocument(query, doc)]);
                idsSeen.add(doc.id);
            }
        }
    }
    else {
        let snapshot = await Lists.where('tags', 'array-contains-any', words).get();
        for (let doc of snapshot.docs) {
            firstDocs.push([doc, weightDocument(query, doc)]);
            idsSeen.add(doc.id);
        }
    }
    // 2. load pages with a similar name
    // REPLACE WITH ALGOLIA
    let searchTerm = query.toUpperCase();
    let sLower = query.toLowerCase();
    let endTerm = searchTerm.substring(0, searchTerm.length - 1) + String.fromCharCode(searchTerm.charCodeAt(searchTerm.length - 1) + 1);
    let snapshot = await Lists.where('nameUpper', '>=', searchTerm).where('nameUpper', '<', endTerm).get();
    for (let doc of snapshot.docs) {
        if (!idsSeen.has(doc.id)) {
            firstDocs.push([doc, weightDocument(query, doc)]);
            idsSeen.add(doc.id);
        }
    }
    // 3. sort results
    firstDocs.sort(listSortComparator);
    let ret = [];
    for (let d of firstDocs)
        ret.push(d[0]);
    return ret;
}
exports.getSearchResults = getSearchResults;
// EDIT LIST INFORMATION
function deleteList(listid) {
    Lists.doc(listid).delete();
}
exports.deleteList = deleteList;
function changeListField(listid, field, value) {
    let upd = {};
    upd[field] = value;
    Lists.doc(listid).update(upd);
}
exports.changeListField = changeListField;
function addListView(listid, uid) {
    let date = getCurrentDay();
    let upd = {};
    upd['views.' + date] = admin.firestore.FieldValue.arrayUnion(uid);
}
exports.addListView = addListView;
async function newSection(listid, index, color) {
    let update = {}; // add either a section or option to a section
    let id = makeID(8);
    let tid = makeID(8);
    let items = {};
    items[tid] = { index: 0, text: "", id: tid };
    update[`sections.${id}`] = { id, color, index, items: items, name: "New Section" };
    Lists.doc(listid).update(update);
    return { id, tid };
}
exports.newSection = newSection;
async function editSection(listid, sid, field, value) {
    let update = {};
    update[`sections.${sid}.${field}`] = value;
    Lists.doc(listid).update(update);
    return true;
}
exports.editSection = editSection;
async function deleteSection(list, listid, sid) {
    if (list === null || !(sid in list.sections))
        return false;
    delete list.sections[sid];
    let secs = Object.values(list.sections);
    secs.sort((a, b) => a.index - b.index);
    let updSecs = {};
    for (let i = 0; i < secs.length; i++) {
        secs[i].index = i;
        updSecs[secs[i].id] = secs[i];
    }
    let update = {
        sections: updSecs
    };
    update[`sections`] = updSecs;
    await Lists.doc(listid).update(update);
    return true;
}
exports.deleteSection = deleteSection;
async function newItem(list, listid, sid, index) {
    if (list === null)
        return '';
    let update = {}; // add either a section or option to a section
    let tid = makeID(8);
    let items = Object.values(list.sections[sid].items);
    items.sort((a, b) => a.index - b.index);
    let newItems = [];
    let ind = 0;
    for (let i of items) {
        if (i.index === index)
            newItems.push({ id: tid, index: ind++, text: "" });
        i.index = ind++;
        newItems.push(i);
    }
    if (newItems.length == items.length)
        newItems.push({ id: tid, index: ind, text: "" });
    let upd = {};
    for (let i of newItems)
        upd[i.id] = i;
    update[`sections.${sid}.items`] = upd;
    Lists.doc(listid).update(update);
    return tid;
}
exports.newItem = newItem;
async function editItem(uid, listid, sid, tid, text) {
    let ul = await getUserList(uid, listid);
    if (!ul)
        return {};
    let update = {}; // add either a section or option to a section
    update[`sections.${sid}.items.${tid}.text`] = text;
    await Lists.doc(listid).update(update);
    return { tid };
}
exports.editItem = editItem;
async function deleteItem(uid, listid, sid, tid) {
    let ul = await getUserList(uid, listid);
    if (!ul)
        return false;
    let list = await getList(listid, ul.viewable, false);
    if (list === null || !(sid in list.sections) || !(tid in list.sections[sid].items))
        return false;
    delete list.sections[sid].items[tid];
    let items = Object.values(list.sections[sid].items);
    items.sort((a, b) => a.index - b.index);
    let updItems = {};
    for (let i = 0; i < items.length; i++) {
        items[i].index = i;
        updItems[items[i].id] = items[i];
    }
    let update = {};
    update[`sections.${sid}.items`] = updItems;
    await Lists.doc(listid).update(update);
    return true;
}
exports.deleteItem = deleteItem;
// OTHER DATABASE FUNCTIONS
async function uploadImage(name, file, ext, callback) {
    file.name = name;
    let newFile = Bucket.file(`images/${name}`);
    newFile.save(file.data, (err) => {
        if (err) {
            console.error(`Error uploading: ${name} with message: ${err.message}`);
            return "";
        }
        newFile.makePublic(async () => {
            let url = newFile.publicUrl();
            callback(url.toString());
        });
    });
    // let file_binary = file.data;
    // let url2file = 'https://firebasestorage.googleapis.com/v0/b/bringit-a32a6.appspot.com/o/images%2F' + name;
    // let headers = {"Content-Type": "image/" + ext}
    // let resp = await fetch(url2file, {
    //   method: 'POST',
    //   body: file_binary,
    //   headers
    // });
    // r = requests.post(url2file, data=file_binary, headers=headers)
    // let json = await resp.json();
    // console.log(json);
}
exports.uploadImage = uploadImage;
async function checkUserCookie(uid, session) {
    let user = await getUser({ '.id': uid }, false);
    return (user.length > 0 && user[0].user.session == session) ? user[0] : false;
}
exports.checkUserCookie = checkUserCookie;
