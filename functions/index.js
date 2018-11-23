'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
var fetch = require('isomorphic-fetch'); // or another library of choice.
var Dropbox = require('dropbox').Dropbox;
var FileReader = require('filereader');
const cred = require('./credentials');

const dropboxConfig = {
  'fetch': fetch,
  'accessToken': cred.ACCESS_TOKEN
};
admin.initializeApp();
admin.firestore().settings({timestampsInSnapshots: true});

//const reader = new FileReader();

exports.trigger = functions.https.onRequest((req, res) => {

  // curl -H  "Content-Type: application/json" --data '{"token":"youreco_firestore","path":"2018_11_22-garbage.csv", "prefix":"HuishoudenTest", "user":"useruser"}' https://us-central1-youreco-c4a94.cloudfunctions.net/trigger

  if (req.body.token === "youreco_firestore"){
    //console.log("received path is : " + req.body.path);
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
  console.log("looking for file in: " +path_to_file);

  const database = admin.firestore();
  var batch = database.batch();

  return new Promise((resolve, reject) => {
    var dbx = new Dropbox(dropboxConfig);
    return dbx.filesDownload({path: path_to_file})
    .then((response) => {
      //console.log(response);
      var encoded = new Buffer.from(response.fileBinary);
      return encoded.toString('utf8');
    }).then((data)=>{
      var lines = data.split('\n');
      for(var i = 0;i < lines.length;i++){
        if (lines[i]!== ''){ // probably the last line is like this...
          var linesdata = lines[i].split(",");
          var newData = database.collection(user).doc();
          //console.log(linesdata);
          batch.set(newData, {
            'sensor':linesdata[0],
            'timestamp':new Date(parseInt(linesdata[1])*1000),
            'eventvalue':parseInt(linesdata[2]),
          });
        }
      }
      return true;
    })
    .then(() => {
      if(batch._writes.length > 0) return batch.commit();
      else return true;
    })
    .then(() => resolve(console.log('file uploaded into database!')));
  });
});
/*
function readData(file){
return new Promise((resolve, reject) => {
var lineReader = require('readline').createInterface({
input: require('fs').createReadStream(file)
});
lineReader.on('line', (line) => {
console.log('Line from file:', line);
}).on('close', () => {
return resolve(console.log('Have a great day!'));
});
});
}
*/

/*
function readFile(file){
return new Promise((resolve, reject) => {
var fr = new FileReader();
fr.onloadend = (result) => {
console.log(result);
console.log(fr.result);
return resolve(result)
};
fr.readAsArrayBuffer(file);
});
}*/
