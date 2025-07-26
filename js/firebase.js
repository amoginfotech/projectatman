// Firebase initialization
const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "projectatman-c82dc",
  storageBucket: "projectatman-c82dc.firebasestorage.app",
  messagingSenderId: "81544033645",
  appId: "1:81544033645:web:8cd9e1b079caf2f18c1664",
  measurementId: "G-G98T9TNS0R"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

export { db, storage, firebase as default };