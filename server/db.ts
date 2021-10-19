/**
 * Things to do:
 * Set up firebase or firestore (not sure which one)
 * Algolia for search capabilities
 */

// const admin = require('firebase-admin');
import * as admin from "firebase-admin"
import * as crypto from "crypto"
import { isStringObject } from "util/types";
// const admin = require("firebase-admin");
 
admin.initializeApp({
  credential: admin.credential.cert('server/credentials.json'),
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
  image: string;
  topImage: string;
  name: string;
  owner: string;
  password: string;
  saveDate: admin.firestore.Timestamp;
  sections: {
    [key: string]: ListSection
  }
  id?: string;
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
  personalTemplates: Array<UserList>;
  plan: string;
  profPic: string;
  salt: string;
  savedLists: Array<UserList>;
  savedTemplates: Array<UserList>;
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
    personalTemplates: [],
    plan: payType,
    profPic: "",
    salt: salt,
    savedLists: [],
    savedTemplates: [],
    timeLastPaid: admin.firestore.Timestamp.fromDate(new Date()),
    topPic: "",
    type: acctType
  };
}
function makeList(name: string, owner: string, password: string): List{
  return {
    image: "https://cdn-icons-png.flaticon.com/512/149/149347.png",
    topImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Solid_green_%2880B682%29.svg/512px-Solid_green_%2880B682%29.svg.png",
    name: name,
    owner: owner,
    password: password || "",
    saveDate: admin.firestore.Timestamp.fromDate(new Date()),
    sections: {}
  };
}
function makeTemplate(name:string, owner:string, password:string): List{
  return {
    image: "",
    topImage: "",
    name: name,
    owner: owner,
    password: password || "",
    saveDate: admin.firestore.Timestamp.fromDate(new Date()),
    sections: {}
  };
}

export function makeID(length: number): string{
  return crypto.randomBytes(length).toString('hex');
}

export async function getUser(selections: TypedObject<string>, all: boolean, collection?: boolean): Promise<Array<UserDoc>> {
  let arr: Array<UserDoc> = [];
  if (all){
    let ref: any = collection ? Organizations : Users;
    for (let i in selections) ref = ref.where(i, '==', selections[i]);
    let snapshot = await ref.get();
    arr = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) => ({ id: doc.id, user: doc.data() as User }))
    return arr;
  }
  else {
    for (let i in selections){
      if (i == '.id'){
        let doc = await (collection ? Organizations : Users).doc(selections[i]).get();
        if (doc.exists) arr.push({ id: i, user: doc.data() as User });
        continue;
      }
      let snapshot = await (collection ? Organizations : Users).where(i, '==', selections[i]).get();
      if (!snapshot.empty){
        let doc = snapshot.docs[0];
        arr.push({ id: doc.id, user: doc.data() as User })
      }
    }
    return arr;
  }
}

export async function getUserProfile(uid: string): Promise<User | null>{
  let user = await Organizations.doc(uid).get();
  if (user.exists) return user.data() as User;
  user = await Users.doc(uid).get();
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
  let col: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> = viewable ? isTemplate ? PbTemplates : PbLists : isTemplate ? PvTemplates : PvLists;
  let list = await col.doc(id).get();
  if (list.exists) return list.data() as List;
  return null;
}

export function changeListName(ul: UserList, listid: string, name: string){
  let Lists = ul.viewable ? PbLists : PvLists;
  Lists.doc(listid).update({ name });
}

export async function newSection(ul: UserList, listid: string, index: number, color: string): Promise<TypedObject<string>>{
  if (!ul) return {};
  let Lists = ul.viewable ? PbLists : PvLists;
  let update: any = {}; // add either a section or option to a section
  let id: string = makeID(8);
  let tid: string = makeID(8);
  let items: TypedObject<ListItem> = {};
  items[tid] = { index: 0, text: "", id: tid };
  update[`sections.${id}`] = { id, color, index, items: items, name: "New Section" };
  Lists.doc(listid).update(update);
  return {id, tid};
}
export async function editSection(ul: UserList, listid: string, sid: string, field: string, value: any): Promise<boolean>{
  if (!ul) return false;
  let Lists = ul.viewable ? PbLists : PvLists;
  let update: any = {};
  update[`sections.${sid}.${field}`] = value;
  Lists.doc(listid).update(update);
  return true;
}
export async function deleteSection(ul: UserList, list: List | null, listid: string, sid: string): Promise<boolean>{
  if (!ul) return false;
  let Lists = ul.viewable ? PbLists : PvLists;
  
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

export async function newItem(ul: UserList | null, list: List | null, listid: string, sid: string, index: number): Promise<string>{
  if (!ul || list === null) return '';
  let Lists = ul.viewable ? PbLists : PvLists;
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
  let Lists = ul.viewable ? PbLists : PvLists;
  let update: any = {}; // add either a section or option to a section
  update[`sections.${sid}.items.${tid}.text`] = text;
  await Lists.doc(listid).update(update);
  return {tid};
}
export async function deleteItem(uid: string, listid: string, sid: string, tid: string): Promise<boolean>{
  let ul = await getUserList(uid, listid);
  if (!ul) return false;
  let Lists = ul.viewable ? PbLists : PvLists;
  
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

export async function updateUserProgress(uid: string, listid: string, sid: string, tid: string, checked: boolean): Promise<boolean>{
  let upd: any = {};
  upd[`listProgress.${listid}.${sid}.${tid}`] = checked;
  await Users.doc(uid).update(upd);
  return true;
}

export async function saveNewUser(email: string, name: string, password: string, payType: string, acctType: boolean, creditcard: Creditcard): Promise<FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | undefined> {
  let user: User = makeUser(email, name, password, payType, acctType, creditcard);
  var res;
  if (acctType) {
    res = await Organizations.add(user);
  }
  else {
    if (await userExists({ email: email, name: name })) return;
    res = await Users.add(user);
  }
  return res;
}

export async function saveTemplate(name: string, userID: string, password: string): Promise<FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>> {
  let template: List = makeTemplate(name, userID, password);
  let res = await PvTemplates.add(template);
  return res;
}

export async function saveList(name: string, uid: string, password: string): Promise<FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>> {
  let list: List = makeList(name, uid, password);
  let res = await PvLists.add(list);

  let upd: UserList = {
    id: res.id,
    saveDate: list.saveDate,
    viewable: false
  };

  let user = await Organizations.doc(uid).get();
  if (user.exists) await Organizations.doc(uid).update({
      personalLists: admin.firestore.FieldValue.arrayUnion(upd)
    });
  else {
    user = await Users.doc(uid).get();
    if (user.exists) await Users.doc(uid).update({
      personalLists:  admin.firestore.FieldValue.arrayUnion(upd)
    });
  }
  return res;
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

export async function checkUserCookie(uid: string, session: string): Promise<UserDoc | false> {
  let user: UserDoc[] = await getUser({'.id': uid}, false);
	return (user.length > 0 && user[0].user.session == session) ? user[0] : false;
}