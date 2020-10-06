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

var demoUserID = "0d1EgI2i1pY3NyNs3wtVAfdjYvF2";
/**
* Initializes the YourEco app.
*/
function YourEco() {

  this.dialogs = {};
  this.week = 0;
  this.weekData = true;
  this.currentUid = "";

  firebase.firestore().settings({ timestampsInSnapshots: true });

  var that = this;

  that.initRouter();
  that.initTemplates();

  that.viewTimeline();
}

/**
* Initializes the router for the YourEco app.
*/
YourEco.prototype.initRouter = function() {
  this.router = new Navigo();

  var that = this;
  this.router
  .on({
    '/success': function() {
      that.viewTimeline();
    }
  })
  .on({
    '/timeline': function() {
      that.viewTimeline();
    }
  })
  .on({
    '/input': function() {
      that.viewInput();
    }
  })
  .on({
    '/dashboard/:id': function(params) {
      that.viewDashboard(params.id);
    }
  })
  .resolve();
};

YourEco.prototype.getCleanPath = function(dirtyPath) {
  if (dirtyPath.startsWith('/index.html')) {
    return dirtyPath.split('/').slice(1).join('/');
  } else {
    return dirtyPath;
  }
};

YourEco.prototype.getFirebaseConfig = function() {
  return firebase.app().options;
};

window.onload = function() {
  window.app = new YourEco();
};
