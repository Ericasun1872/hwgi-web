import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { readFileSync } from "fs";

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = loadEnv(".env.local");
const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "writerapp-3a1b3",
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const ref = doc(db, "chapter_content", "main");
const snap = await getDoc(ref);
if (!snap.exists()) { console.log("missing"); process.exit(1); }
const data = snap.data();
const org = data.orgChart || {};
function fixMembers(members) {
  if (!Array.isArray(members)) return members;
  return members.map((m) => {
    if ((m?.nameKo || "").trim() !== "송숙자") return m;
    console.log("fixing", m.nameEn, "-> Song Suk-Cha");
    return { ...m, nameEn: "Song Suk-Cha" };
  });
}
function fixRole(role) {
  if (!role) return role;
  return { ...role, members: fixMembers(role.members) };
}
function fixRoles(roles) {
  if (!Array.isArray(roles)) return roles;
  return roles.map(fixRole);
}
const nextOrg = {
  ...org,
  chapterPresident: fixRole(org.chapterPresident),
  executiveBoard: fixRoles(org.executiveBoard),
  secretariat: fixRoles(org.secretariat),
  committees: fixRoles(org.committees),
  genreDivisions: fixRoles(org.genreDivisions),
};
await setDoc(ref, { orgChart: nextOrg, updatedAt: serverTimestamp() }, { merge: true });
const afterSnap = await getDoc(ref);
const after = JSON.stringify(afterSnap.data().orgChart).match(/송숙자[^\\"]{0,5}"nameEn":"[^"]+"/g)
  || JSON.stringify(afterSnap.data().orgChart).match(/"nameEn":"[^"]*Suk[^"]*"/g);
console.log("after", after);
console.log("done");
