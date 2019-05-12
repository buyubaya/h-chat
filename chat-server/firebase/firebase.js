const firebase = require('firebase');
const admin = require("firebase-admin");

const config = {
    apiKey: "AIzaSyBOAPE91zd5EqH94r4cIHEY6zU1rNfAFZU",
    authDomain: "test-react-12d16.firebaseapp.com",
    databaseURL: "https://test-react-12d16.firebaseio.com",
    projectId: "test-react-12d16",
    storageBucket: "test-react-12d16.appspot.com",
    messagingSenderId: "478543101329"
};
const base = firebase.initializeApp(config);

const ref = path => firebase.database().ref(path);
const getData = path => ref(path).once('value').then(snap => {
    const data = snap.val();

    if(data){
        const items = Object.keys(data).map(key => {
            return {id: key, ...data[key]};
        });
        return Promise.resolve(items);
    }
    
    return [];
});

// ADMIN
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-react-12d16.firebaseio.com"
});

// admin.auth().createUser({
//     email: "user@example.com",
//     emailVerified: false,
//     phoneNumber: "+11234567890",
//     password: "secretPassword",
//     displayName: "John Doe",
//     photoURL: "http://www.example.com/12345678/photo.png",
//     disabled: false
// })
// .then(function(userRecord) {
//     // See the UserRecord reference doc for the contents of userRecord.
//     console.log("Successfully created new user:", userRecord.uid);
// })
// .catch(function(error) {
//     console.log("Error creating new user:", error);
// });

module.exports = { base, ref, getData };