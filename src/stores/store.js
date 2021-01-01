import {computed, createStore, reducer} from 'easy-peasy'
import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/analytics'
import 'firebase/storage'
import {firebaseReducer, getFirebase} from 'react-redux-firebase'
import {createFirestoreInstance, firestoreReducer, getFirestore} from 'redux-firestore'
import {wagersModel} from "./wagers"; // <- needed if using firestore

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const prodFirebaseConfig = {
    apiKey: "AIzaSyDgBRkq0CxmKYpyO2_kBaqz13z2ZTzaOOU",
    authDomain: "parledger-app.firebaseapp.com",
    databaseURL: "https://parledger-app.firebaseio.com",
    projectId: "parledger-app",
    storageBucket: "parledger-app.appspot.com",
    messagingSenderId: "955423843573",
    appId: "1:955423843573:web:f9a7b0ba602c84c86951bc",
    measurementId: "G-2CVGGBD2MH"
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const devFirebaseConfig = {
    apiKey: "AIzaSyCL_K2UDJmOpbwxYu2S6ySvEP8TJbltlk8",
    authDomain: "ledgerdotbet-dev.firebaseapp.com",
    projectId: "ledgerdotbet-dev",
    storageBucket: "ledgerdotbet-dev.appspot.com",
    messagingSenderId: "812605505064",
    appId: "1:812605505064:web:0de526f3d351bdc77f3f1d",
    measurementId: "G-4BMDL21TP0"
};

console.log(`Built with env ${process.env.REACT_APP_FIREBASE_PROJECT}`)
const firebaseConfig = process.env.REACT_APP_FIREBASE_PROJECT === 'prod' ? prodFirebaseConfig : devFirebaseConfig;

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

if (window.location.hostname === 'localhost') {
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
}, {injections: {getFirestore, getFirebase}});

export const reactReduxFirebaseProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
    createFirestoreInstance // <- needed if using firestore
}