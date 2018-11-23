'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
var fetch = require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;
var FileReader = require('filereader');
const cred = require('./credentials');

const dropboxConfig = {
  fetch: fetch,
  accessToken: cred.ACCESS_TOKEN
};
admin.initializeApp();
admin.firestore().settings({timestampsInSnapshots: true});

//const reader = new FileReader();

exports.trigger = functions.https.onRequest((req, res) => {

  // curl -H  "Content-Type: application/json" --data '{"token":"youreco_firestore","path":"test121233.csv", "prefix":"HuishoudenTest", "user":"useruser"}' https://us-central1-youreco-c4a94.cloudfunctions.net/trigger

  if (req.body.token === "youreco_firestore"){
    console.log("received path is : " + req.body.path);
    const database = admin.firestore();
    return database.collection('dropboxtrigger').add({'path':req.body.path, 'prefix':req.body.prefix, 'user':req.body.user, 'timestamp':new Date()}).then(ref => {
      return res.send('Got it! - ID');
    });
  } else {
    res.send(500,"ERROR: wrong token");
  }
});

exports.firestoreDataTrigger = functions.firestore.document('dropboxtrigger/{triggerID}').onCreate((snap, context)=> {
  const data = snap.data();
  const user = data.user;
  const path = data.path;
  const prefix = data.prefix;
  const path_to_file = '/' + prefix + '/' + path;

  return new Promise((resolve, reject) => {
    var dbx = new Dropbox(dropboxConfig);
    return dbx.filesDownload({path: path_to_file})
    .then((response) => readFile(response.fileBlob))  //since fetch this doesnt work..?
    .then((result) => {
      console.log(result);
      return resolve();
    });
  })
});


function readFile(file){
  return new Promise((resolve, reject) => {
    var fr = new FileReader();
    fr.onloadend = () => {
      return resolve(fr.result )
    };
    fr.readAsText(file);
  });
}
