/**
* Copyright 2017 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
'use strict';

YourEco.prototype.getAllDataPoints = function(renderer, uid) {
  var query = firebase.firestore()
  .collection(uid)
  .orderBy("timestamp", "asc")
  .limit(50);

  this.getDocumentsInQuery(query, renderer);
};

YourEco.prototype.getDocumentsInQuery = function(query, renderer) {
  query.onSnapshot(function(snapshot) {
    if (!snapshot.size) return renderer.empty(); // Display "There are no restaurants".

    var count = 0;
    var previousday = null;
    var day;
    var days = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
    var monthNames = [
      "januari", "februari", "maart",
      "april", "mei", "juni", "july",
      "augustus", "september", "oktober",
      "november", "december"
    ];

    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'removed') {

      } else {
        count ++;

        var date = change.doc.data().timestamp.toDate();
        day = date.getDate();
        var dateString = days[date.getDay()] + ' ' + day + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
        var timeString = date.toLocaleTimeString();//date.getHours() + ":" + date.getMinutes();

        var displayDay = false;
        if (day != previousday) displayDay = true;
        previousday = day;

        renderer.display(change.doc, count, dateString, timeString, displayDay);
      }
    });
  });
};

YourEco.prototype.getGraphData = function(renderer, uid, timestamp, secondtimestamp) {
  var query = firebase.firestore()
  .collection(uid)
  .where('timestamp', '>', timestamp)
  .where('timestamp', '<', secondtimestamp);

  //console.log("getting query");

  this.getGraphsInQuery(query, renderer, timestamp);

};

YourEco.prototype.getGraphsInQuery = function(query, renderer, timestamp) {
  query.onSnapshot(function(snapshot) {
    if (!snapshot.size) {
      renderer.empty();
      return;
    }

    const sample = [0,0,0,0,0,0,0];
    var graphdays = ["Ma", "Di", "Wo", "Do", "Vrij", "Za", "Zo"];

    const weekdata = {      //light, garbage, shower
      'L' : sample.slice(),
      'G' : sample.slice(),
      'S' : sample.slice()
    }

    var days = [];
    for (var i = 1; i < 8; i++){
      var nextday = new Date();
      nextday.setDate(timestamp.getDate() + i);

      nextday.setHours(3); nextday.setMinutes(0); nextday.setSeconds(0); nextday.setMilliseconds(0);
      days.push(nextday);
    }

    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'removed') {

      } else {

        var data = change.doc.data();
        var dataDate = data.timestamp.toDate();
        //console.log(dataDate);

        var sensortype = data.sensor.charAt(0);

        //console.log("eventvalue = " + data.eventvalue);

        // this code looks whether the datavalue is on which day of the week
        if (dataDate < days[0]){
          weekdata[sensortype][0] += data.eventvalue;
        } else if (dataDate < days[1]){
          weekdata[sensortype][1] += data.eventvalue;
        } else if (dataDate< days[2]){
          weekdata[sensortype][2] += data.eventvalue;
        } else if (dataDate< days[3]){
          weekdata[sensortype][3] += data.eventvalue;
        } else if (dataDate < days[4]){
          weekdata[sensortype][4] += data.eventvalue;
        } else if (dataDate < days[5]){
          weekdata[sensortype][5] += data.eventvalue;
        } else if (dataDate < days[6]){
          weekdata[sensortype][6] += data.eventvalue;
        }
      }
    });

    const calcu = [(1/60), 1, (1/60)];
    const types = ['L','G','S'];
    const values = ['minuten', 'gram', 'minuten'];
    const titles = ['Licht Sensor', 'Afval Sensor', 'Douche Sensor'];
    const weeksample = {'L' : [],'G' : [],'S' : [] };
    for (var q = 0; q < types.length; q++){
      for (var i = 0; i < graphdays.length; i++){
        var object = {
          'day': graphdays[i],
          'value': Math.round(weekdata[types[q]][i]*calcu[q]),
        };
        weeksample[types[q]].push(object);
      }
      //renderer.display(weeksample[types[q]]); //show on the interface
    }
    for (var i = 0; i < types.length; i++){
      var maximum = Math.round((Math.max.apply(Math,weekdata[types[i]])+1)*calcu[i]);
      renderer.display(weeksample[types[i]],maximum,values[i],titles[i], types[i]);
    }

  });
};
