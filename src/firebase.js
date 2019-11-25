import firebase from 'firebase/app'
import 'firebase/firestore';
import 'firebase/auth';
// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyDRZhDH-wGV5S8AZAPdnB9A1RiJ0c-VEEQ",
	authDomain: "grapple-map-fb.firebaseapp.com",
	databaseURL: "https://grapple-map-fb.firebaseio.com",
	projectId: "grapple-map-fb",
	storageBucket: "grapple-map-fb.appspot.com",
	messagingSenderId: "669401582078",
	appId: "1:669401582078:web:6d679b7717200135e998af",
	measurementId: "G-CR6BX83CP3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

export const firestore = firebase.firestore();
export const auth = firebase.auth();

export const provider = new firebase.auth.GoogleAuthProvider();
export const signInWithGoogle = () => auth.signInWithPopup(provider);

export default firebase;