
const repl = require("repl");
var admin = require("firebase-admin");

var serviceAccount = require("/Users/donnie/Downloads/parledger-app-6a528680b352.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore()

const replServer = repl.start({
    prompt: "fb > ",
})

replServer.context.firestore = firestore
replServer.context.admin = admin

// I can also save typing by doing things like:
replServer.context.userId = "my_firestore_user_id"

// or by adding functions
replServer.context.withUser = (query) =>
    query.where("userId", "==", replServer.context.userId)

replServer.context.getCollection = (q) => {
    q.forEach(x => console.log(x.data()));
}