import {computed, createStore, reducer} from 'easy-peasy'
import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/analytics'
import 'firebase/storage'
import {firebaseReducer, getFirebase} from 'react-redux-firebase'
import {createFirestoreInstance, firestoreReducer, getFirestore} from 'redux-firestore'
import {wagersModel} from "./wagers";
import {usersModel} from "./users"; // <- needed if using firestore

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.REACT_APP_APIKEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    databaseURL: process.env.REACT_APP_DATABASEURL,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
    measurementId: process.env.REACT_APP_MEASUREMENTID,
};

console.log(firebaseConfig);

export const authProviderIds = process.env.REACT_APP_FIREBASE_PROJECT === 'prod'
    ? [firebase.auth.GoogleAuthProvider.PROVIDER_ID]
    : [firebase.auth.EmailAuthProvider.PROVIDER_ID]

console.log(`Built with env ${process.env.REACT_APP_FIREBASE_PROJECT}`)

const rrfConfig = {
    userProfile: 'users',
    useFirestoreForProfile: true,
    profileFactory: (userData) => { // how profiles are stored in database
        return {
            uid: userData.uid,
            email: userData.email,
            avatarUrl: userData.photoURL || null,
            displayName: userData.displayName,
        }
    }
}

// Initialize firebase instance
firebase.initializeApp(firebaseConfig)

// Initialize other services on firebase instance
firebase.firestore() // <- needed if using firestore
firebase.functions() // <- needed if using httpsCallable
firebase.analytics();

if (window.location.hostname === 'localhost' && process.env.REACT_APP_FIREBASE_PROJECT !== 'prod') {
    console.log("testing locally -- hitting local functions and firestore emulators");
    firebase.functions().useEmulator('localhost', 5001);
    firebase.firestore().settings({
        host: 'localhost:8080',
        ssl: false
    });
}



export const store = createStore({
    firestore: reducer(firestoreReducer),
    firebase: reducer(firebaseReducer),
    wagers: wagersModel,
    users: usersModel,
}, {injections: {getFirestore, getFirebase}});

export const reactReduxFirebaseProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
    createFirestoreInstance // <- needed if using firestore
}