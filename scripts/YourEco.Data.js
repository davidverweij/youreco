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
        renderer.remove(change.doc);
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
