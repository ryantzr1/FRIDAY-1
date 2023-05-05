import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBfTkDEgcdydzN0F2dPI7W4w_visoXId6k",
    authDomain: "friday-84958.firebaseapp.com",
    projectId: "friday-84958",
    storageBucket: "friday-84958.appspot.com",
    messagingSenderId: "406615329387",
    appId: "1:406615329387:web:42eb28a0427afa09c4bf2e",
    measurementId: "G-Z1DNMKJ8DG"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();