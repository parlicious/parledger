import {action, createStore, reducer} from 'easy-peasy'

import React from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore' // <- needed if using firestore
import 'firebase/functions' // <- needed if using httpsCallable
import {firebaseReducer} from 'react-redux-firebase'
import {createFirestoreInstance, firestoreReducer} from 'redux-firestore' // <- needed if using firestore

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDgBRkq0CxmKYpyO2_kBaqz13z2ZTzaOOU",
    authDomain: "parledger-app.firebaseapp.com",
    databaseURL: "https://parledger-app.firebaseio.com",
    projectId: "parledger-app",
    storageBucket: "parledger-app.appspot.com",
    messagingSenderId: "955423843573",
    appId: "1:955423843573:web:f9a7b0ba602c84c86951bc",
    measurementId: "G-2CVGGBD2MH"
};

const rrfConfig = {
    userProfile: 'users',
    useFirestoreForProfile: true
}

// Initialize firebase instance
firebase.initializeApp(firebaseConfig)

// Initialize other services on firebase instance
firebase.firestore() // <- needed if using firestore
firebase.functions() // <- needed if using httpsCallable

export const store = createStore({
    firestore: reducer(firestoreReducer),
    firebase: reducer(firebaseReducer),
});

export const reactReduxFirebaseProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
    createFirestoreInstance // <- needed if using firestore
}