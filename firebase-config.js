// Firebase project config — see firebase-backend/FIREBASE_SETUP.md, Step 5.
// These values are NOT secret; Firebase is designed to have them visible
// in client code. Real protection comes from firestore.rules.
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

let auth = null;
let db = null;
const FIREBASE_READY = !!firebaseConfig.apiKey;

if (FIREBASE_READY) {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
} else {
    console.warn('Firebase not configured yet — see firebase-backend/FIREBASE_SETUP.md. Accounts and admin panel will not work until it is.');
}
