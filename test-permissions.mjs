import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studio-9874817327-1b3d1",
  "appId": "1:187562648776:web:fad1cb7fba235f9b97f1fd",
  "apiKey": "AIzaSyDYmAvow6IizaabHy1pgrMVrR5YA5UsfF0",
  "authDomain": "studio-9874817327-1b3d1.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "187562648776",
  "storageBucket": "studio-9874817327-1b3d1.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testPermissions() {
  console.log("Testing public read for app_settings/nexus_config...");
  try {
    const settingsRef = doc(db, "app_settings", "nexus_config");
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      console.log("SUCCESS: Read app_settings/nexus_config:", snap.data());
    } else {
      console.log("SUCCESS: Document app_settings/nexus_config does not exist (but read was allowed).");
    }
  } catch (e) {
    console.error("FAIL: Error reading app_settings/nexus_config:", e.message);
  }
}

testPermissions();
