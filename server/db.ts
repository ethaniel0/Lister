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

interface ListSections {
  name?: string,
  sections: {
    [key: string]: {
      name?: string,
      items: {
        [key: string]: string
      }
    }
  }
}

export interface List {
  image: string;
  name: string;
  owner: string;
  password: string;
  saveDate: admin.firestore.Timestamp;
  sections: TypedObject<Array<string>>;
  id?: string;
}

export interface UserList {
  saveDate: admin.firestore.Timestamp;
  viewable: boolean;
}

export interface User {
  creditDetails: Creditcard;
  email: string;
  listProgress: TypedObject<ListProgress>;
  name: string;
  password: string;
  personalLists: TypedObject<UserList>;
  personalTemplates: TypedObject<UserList>;
  plan: string;
  profPic: string;
  salt: string;
  savedLists: TypedObject<UserList>;
  savedTemplates: TypedObject<UserList>;
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

function makeList(name: string, owner: string, password: string): List{
  return {
    image: "",
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

export async function getList(id: string, viewable: boolean, isTemplate: boolean): Promise<List | null>{
  let col: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> = viewable ? isTemplate ? PbTemplates : PbLists : isTemplate ? PvTemplates : PvLists;
  let list = await col.doc(id).get();
  if (list.exists) return list.data() as List;
  return null;
}

export async function updateList(listid: string, action: string, type: string, ids: string[], viewable: boolean){
  let Lists = viewable ? PbLists : PvLists;
  if (action == 'add'){
    let update: any = {}; // add either a section or option to a section
    if (type == 'section') update[`sections.${ids[0]}`] = { items: {}, name: ids[1] };
    else if (type == 'option') update[`sections.${ids[0]}.items.${ids[1]}`] = ids[2];
    else return false
    await Lists.doc(listid).update(update);
    return true;
  }
  else if (action == 'delete'){
    let update: any = {}; // delete a section or option of a section
    if (type == 'section') update[`sections.${ids[0]}`] = FieldValue.delete();
    else if (type == 'option') update[`sections.${ids[0]}.items.${ids[2]}`] = FieldValue.delete();
    else return false
    await Lists.doc(listid).update(update);
    return true;
  }
  else if (action == 'update'){
    let update: any = {}; // update the name of the list or a section or update the text of an option
    if (type == 'list') update['name'] = ids[0];
    else if (type == 'section') update[`sections.${ids[0]}.name`] = ids[1];
    else if (type == 'option') update[`sections.${ids[0]}.items.${ids[1]}`] = ids[2];
    else return false;
    await Lists.doc(listid).update(update);
    return true;
  }
  else return false;
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

  let upd: TypedObject<UserList> = {}; // UserList to be added (update)
  upd[res.id] = {
    saveDate: list.saveDate,
    viewable: false
  };

  let user = await Organizations.doc(uid).get();
  if (user.exists) await Organizations.doc(uid).update({personalLists: upd});
  else {
    user = await Users.doc(uid).get();
    if (user.exists) await Users.doc(uid).update({personalLists: upd});
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

export async function checkUserCookie(uid: string, session: string): Promise<UserDoc | boolean> {
  let user: UserDoc[] = await getUser({'.id': uid}, false);
	return (user.length > 0 && user[0].user.session == session) ? user[0] : false;
}