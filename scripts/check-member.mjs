import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
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
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const email = "welovejeck@yahoo.com";
const id = email.toLowerCase();

const direct = await getDoc(doc(db, "chapter_members", id));
console.log("direct exists", direct.exists());
if (direct.exists()) {
  const d = direct.data();
  console.log(JSON.stringify({
    email: d.email,
    nameKo: d.nameKo,
    nickname: d.nickname,
    approvalStatus: d.approvalStatus,
    memberType: d.memberType,
    joinedAt: d.joinedAt,
    approvedAt: d.approvedAt,
    keys: Object.keys(d),
  }, null, 2));
}

const q1 = query(collection(db, "chapter_members"), where("email", "==", email));
const q2 = query(collection(db, "chapter_members"), where("email", "==", id));
for (const [label, q] of [["email exact", q1], ["email lower", q2]]) {
  const snap = await getDocs(q);
  console.log(label, "count", snap.size);
  for (const d of snap.docs) {
    console.log(" doc", d.id, d.data().approvalStatus, d.data().joinedAt);
  }
}

// pending scan if rules allow
try {
  const pending = query(collection(db, "chapter_members"), where("approvalStatus", "==", "pending"));
  const snap = await getDocs(pending);
  console.log("pending total", snap.size);
  const hit = snap.docs.filter((d) => (d.id + JSON.stringify(d.data())).toLowerCase().includes("welovejeck") || (d.id + JSON.stringify(d.data())).toLowerCase().includes("yahoo"));
  console.log("pending yahoo-ish", hit.map((d) => ({ id: d.id, status: d.data().approvalStatus, joinedAt: d.data().joinedAt, email: d.data().email })));
} catch (e) {
  console.log("pending query failed", e.code || e.message);
}
