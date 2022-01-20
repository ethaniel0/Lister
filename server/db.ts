/**
 * Things to do:
 * Set up firebase or firestore (not sure which one)
 * Algolia for search capabilities
 */

// const admin = require('firebase-admin');
import * as admin from "firebase-admin"
import * as crypto from "crypto"
import fileUpload from 'express-fileupload';
import * as levenshtein from 'fast-levenshtein';
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

export interface Creditcard {
  cvv: string;
  number: string;
}
interface TypedObject<T> {
  [key: string]: T
}
interface ListProgress {
  [key: string]: {
    [key: string]: {
      [key: string]: boolean;
    }
  }
}
interface ListItem {
    id: string;
    index: number;
    text: string;
}
interface ListSection {
    id: string;
    index: number;
    name: string;
    color: string;
    items: {
      [key: string]: ListItem
    };
}
export interface List {
  id?: string;
  image: string;
  name: string;
  owner: string;
  password: string;
  public: boolean;
  saveDate: admin.firestore.Timestamp;
  saves: number;
  sections: {
    [key: string]: ListSection
  };
  tags: Array<string>;
  topImage: string;
  views: {
    [key: string]: Array<string>
  };
}
export interface UserList {
    id: string;
    saveDate: admin.firestore.Timestamp;
    viewable: boolean;
}
export interface User {
  creditDetails: Creditcard;
  email: string;
  listProgress: ListProgress;
  name: string;
  password: string;
  personalLists: Array<UserList>;
  plan: string;
  profPic: string;
  salt: string;
  savedLists: Array<UserList>;
  session?: string;
  timeLastPaid: admin.firestore.Timestamp,
  topPic: string;
  type: boolean;
}
export interface UserDoc {
  id: string;
  user: User;
}

export async function userExists(anyOf: TypedObject<string>): Promise<boolean>{
  for (let x in anyOf) {
    let snapshot = await Users.where(x, '==', anyOf[x]).get();
    if (!snapshot.empty) return true;
  }
  return false;
}

export function hashPassword(password: string, salt?: string): string[] {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return [hash, salt];
}

export async function checkUser(username: string, password: string): Promise<boolean | 0>{
  if ( !(await userExists({email: username, name: username}))) return 0; // username doesn't exist
  let user: UserDoc = (await getUser({email: username, name: username}, false))[0];
  let [hash, salt] = hashPassword(password, user.user.salt);
  return hash == user.user.password // true: success, false: wrong password
}

function makeUser(email: string, name: string, password: string, payType: string, acctType: boolean, creditcard: Creditcard): User{
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
function makeList(name: string, owner: string, password: string): List{
  return {
    image: "https://cdn-icons-png.flaticon.com/512/149/149347.png",
    topImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Solid_green_%2880B682%29.svg/512px-Solid_green_%2880B682%29.svg.png",
    name: name,
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

export function makeID(length: number): string{
  return crypto.randomBytes(length).toString('hex');
}

function getCurrentDay(millis?: number){
  let d = new Date();
  if (millis) d = new Date(millis);
  let year = d.getUTCFullYear();
  let month = d.getUTCMonth();
  let day = d.getUTCDate();
  return year + '-' + month + '-' + day;
}

// GET USER INFORMATION
export async function getUser(selections: TypedObject<string>, all: boolean, collection?: boolean): Promise<Array<UserDoc>> {
  let arr: Array<UserDoc> = [];
  if (all){
    let ref: any = Users;
    for (let i in selections) ref = ref.where(i, '==', selections[i]);
    let snapshot = await ref.get();
    arr = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({ id: doc.id, user: doc.data() as User }))
    return arr;
  }
  else {
    for (let i in selections){
      if (i == '.id'){
        let doc = await Users.doc(selections[i]).get();
        if (doc.exists) arr.push({ id: i, user: doc.data() as User });
        continue;
      }
      let snapshot = await Users.where(i, '==', selections[i]).get();
      if (!snapshot.empty){
        let doc = snapshot.docs[0];
        arr.push({ id: doc.id, user: doc.data() as User })
      }
    }
    return arr;
  }
}
export async function getUserProfile(uid: string): Promise<User | null>{
  let user = await Users.doc(uid).get();
  if (user.exists) return user.data() as User;
  return null;
}
export async function getUserList(uid: string, listid: string): Promise<UserList | null>{
  let user: User | null = await getUserProfile(uid);
  if (user === null) return null;
  let list: UserList | undefined = user.personalLists.find(e => e.id === listid);
  return list || null;
}
export async function getList(id: string, viewable: boolean, isTemplate: boolean): Promise<List | null>{
  let list = await Lists.doc(id).get();
  if (list.exists) return list.data() as List;
  return null;
}
export async function getSession(uid: string, password: string): Promise<string>{
  let user = await Users.doc(uid).get();
  let data: User = user.data() as User;
  if (await checkUser(data.name, password)){
    if (data.session) return data.session;
    let sessionID = makeID(36);
    await Users.doc(uid).update({
      session: sessionID
    });
    return sessionID;
  }
  else return "";
}

// EDIT USER INFORMATION
export async function updateUserProgress(uid: string, listid: string, sid: string, tid: string, checked: boolean): Promise<boolean>{
  let upd: any = {};
  upd[`listProgress.${listid}.${sid}.${tid}`] = checked;
  await Users.doc(uid).update(upd);
  return true;
}
export async function saveNewUser(email: string, name: string, password: string, payType: string, acctType: boolean, creditcard: Creditcard): Promise<FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | undefined> {
  let user: User = makeUser(email, name, password, payType, acctType, creditcard);
  if (await userExists({ email: email, name: name })) return;
  let res = await Users.add(user);
  return res;
}
export async function saveList(name: string, uid: string, password: string): Promise<FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>> {
  let list: List = makeList(name, uid, password);
  let res = await Lists.add(list);

  let upd: UserList = {
    id: res.id,
    saveDate: list.saveDate,
    viewable: false
  };
  
  let user = await Users.doc(uid).get();
  if (user.exists) await Users.doc(uid).update({
    personalLists:  admin.firestore.FieldValue.arrayUnion(upd)
  });
  
  return res;
}
export async function editUserField(uid: string, field: string, value: string): Promise<boolean>{
  let upd: any = {};
  upd[field] = value;
  await Users.doc(uid).update(upd);
  return true;
}
export async function setUserPassword(uid: string, password: string){
  let [hash, salt] = hashPassword(password);
  editUserField(uid, 'password', hash);
  editUserField(uid, 'salt', salt);
  return true;
}

// SEARCH LISTS
export function findLists(name: string){
  

}
// name and tag scores are normalized and combined, visit and save scores are kept as is
function weightDocument(query: string, doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): Array<number> {
  let data: List = doc.data() as List;
  let words = query.split(" ");
  let maxLev = Math.max(query.length, data.name.length);
  // get number for matching name
  let nameScore = ( maxLev - levenshtein.get(query, data.name) ) / maxLev;

  // matching tags
  let tagScore = 0;
  for (let tag of data.tags) if (words.includes(tag)) tagScore++;
  tagScore = tagScore / data.tags.length;

  let nameWeight = 0.6;
  let combinedScore = nameScore * nameWeight + tagScore * (nameWeight-1);

  // get # views in the past 2 weeks
  let viewScore = 0;

  let twoweeksago = getCurrentDay(Date.now() - 1209600000);

  // sort reversed
  let comparator = function(a: string, b: string){
    let as: any = a.split('-');
    let bs: any = b.split('-');
    for (let i = 0; i < 3; i++){
      as[i] = parseInt(as[i]);
      bs[i] = parseInt(bs[i]);
      if (as[i] != bs[i]) return bs[i] - as[i];
    }
    return 0;
  }
  // sort the dates with most recent first
  let views = Object.keys(data.views).sort(comparator);
  for (let day of views){
    // if the dat is earlier than two weeks ago, break
    if (comparator(day, twoweeksago) > 0) break;
    viewScore += data.views[day].length;
  }

  return [combinedScore, viewScore, data.saves];

}
function listSortComparator(a: Array<any>, b: Array<any>){
  // a or b: [doc, [name/tag score, view score, save score]]
  
}
async function getSearchResults(query: string){
  // 1. Extract direct tags, load pages with those tags and get their weights
  let words = query.split(" "); // get individual words
  let firstDocs: Array<Array<any>> = [];
  if (words.length > 10) {
    for (let i = 0; i < Math.min(words.length, 15); i += 10){
      let maxindex = Math.min(i + 10, words.length);
      let snapshot = await Lists.where('tags', 'array-contains-any', words.slice(i, maxindex)).get();
      // firstDocs.push(...snapshot.docs);
    }

  }
  else {
    let snapshot = await Lists.where('tags', 'array-contains-any', words).get();
    for (let doc of snapshot.docs) firstDocs.push([doc, weightDocument(query, doc)]);
  }

  // 2. load pages with a similar name
  // REPLACE WITH ALGOLIA

  // 3. sort results
  
}

// EDIT LIST INFORMATION
export function deleteList(listid: string){
  Lists.doc(listid).delete();
}
export function changeListField(listid: string, field: string, value: string){
  let upd: any = {};
  upd[field] = value;
  Lists.doc(listid).update(upd);
}

export function addListView(listid: string, uid: string){
  let date = getCurrentDay();
  let upd: any = {};
  upd['views.' + date] = admin.firestore.FieldValue.arrayUnion(uid);
}
export async function newSection(listid: string, index: number, color: string): Promise<TypedObject<string>>{
  let update: any = {}; // add either a section or option to a section
  let id: string = makeID(8);
  let tid: string = makeID(8);
  let items: TypedObject<ListItem> = {};
  items[tid] = { index: 0, text: "", id: tid };
  update[`sections.${id}`] = { id, color, index, items: items, name: "New Section" };
  Lists.doc(listid).update(update);
  return {id, tid};
}
export async function editSection(listid: string, sid: string, field: string, value: any): Promise<boolean>{
  let update: any = {};
  update[`sections.${sid}.${field}`] = value;
  Lists.doc(listid).update(update);
  return true;
}
export async function deleteSection(list: List | null, listid: string, sid: string): Promise<boolean>{
  if (list === null || !(sid in list.sections)) return false;
  delete list.sections[sid];
  let secs = Object.values(list.sections);
  secs.sort((a, b) => a.index - b.index);

  let updSecs: any = {};
  for (let i = 0; i < secs.length; i++){
    secs[i].index = i;
    updSecs[secs[i].id] = secs[i];
  }

  let update: any = {
    sections: updSecs
  };
  
  update[`sections`] = updSecs;
  await Lists.doc(listid).update(update);
  return true;
}
export async function newItem(list: List | null, listid: string, sid: string, index: number): Promise<string>{
  if (list === null) return '';
  let update: any = {}; // add either a section or option to a section
  let tid: string = makeID(8);
  let items = Object.values(list.sections[sid].items);
  items.sort((a, b) => a.index - b.index);
  let newItems = [];
  let ind = 0;
  for (let i of items){
    if (i.index === index) newItems.push({ id: tid, index: ind++, text: "" })
    i.index = ind++;
    newItems.push(i);
  }
  if (newItems.length == items.length) newItems.push({ id: tid, index: ind, text: "" });
  let upd: TypedObject<ListItem> = {};
  for (let i of newItems) upd[i.id] = i;

  update[`sections.${sid}.items`] = upd;
  Lists.doc(listid).update(update);
  return tid;
}
export async function editItem(uid: string, listid: string, sid: string, tid: string, text: string): Promise<TypedObject<string>>{
  let ul = await getUserList(uid, listid);
  if (!ul) return {};
  let update: any = {}; // add either a section or option to a section
  update[`sections.${sid}.items.${tid}.text`] = text;
  await Lists.doc(listid).update(update);
  return {tid};
}
export async function deleteItem(uid: string, listid: string, sid: string, tid: string): Promise<boolean>{
  let ul = await getUserList(uid, listid);
  if (!ul) return false;
  
  let list: List | null = await getList(listid, ul.viewable, false);
  if (list === null || !(sid in list.sections) || !(tid in list.sections[sid].items)) return false;
  delete list.sections[sid].items[tid];
  let items = Object.values(list.sections[sid].items);
  items.sort((a, b) => a.index - b.index);

  let updItems: TypedObject<ListItem> = {};
  for (let i = 0; i < items.length; i++){
    items[i].index = i;
    updItems[items[i].id] = items[i];
  }

  let update: any = {};
  
  update[`sections.${sid}.items`] = updItems;
  await Lists.doc(listid).update(update);
  return true;
}

// OTHER DATABASE FUNCTIONS
export async function uploadImage(name: string, file: fileUpload.UploadedFile, ext: string, callback: Function): Promise<void>{
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

export async function checkUserCookie(uid: string, session: string): Promise<UserDoc | false> {
  let user: UserDoc[] = await getUser({'.id': uid}, false);
	return (user.length > 0 && user[0].user.session == session) ? user[0] : false;
}