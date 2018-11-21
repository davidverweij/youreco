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

YourEco.prototype.initTemplates = function() {
  this.templates = {};

  var that = this;
  document.querySelectorAll('.template').forEach(function(el) {
    that.templates[el.getAttribute('id')] = el;
    console.log(el.getAttribute('id'));
  });
};

YourEco.prototype.viewTimeline = function() {

  var mainEl = this.renderTemplate('timeline');
  var headerEl = this.renderTemplate('header-base', {
    hasSectionHeader: true
  });

  mainEl.classList.add("main_css");

  headerEl.querySelector('#title_inner').append(firebase.auth().currentUser.displayName);
  headerEl.querySelector('#dashboard_button').addEventListener('click', function(){that.router.navigate('/dashboard');});
  headerEl.querySelector('#timeline_button').addEventListener('click', function(){that.router.navigate('/timeline');});


  var sensorNames = {
    'L': 'Licht Sensor',
    'G': 'Afval Sensor',
    'S': 'Douche Sensor'
  };

  this.replaceElement(document.querySelector('.header'), headerEl);
  this.replaceElement(document.querySelector('main'), mainEl);

  var that = this;

  var renderer = {
    display: function(doc, number, daystring, timestring, displayday) {
      var data = doc.data();
      data['.id'] = doc.id;

      if (displayday){    //show when there is data from a new day! (add a day bar)
        var pre_el = that.renderTemplate('data-date', data);
        pre_el.querySelector('.date').append(daystring);
        mainEl.querySelector('#data-points').prepend(pre_el);
      }

      var el = that.renderTemplate('data-point', data);   //create new datapoint class

      var eventValue = data.eventvalue;  // the value from the sensor
      var eventValueText = '';
      var eventMonoxide = '';
      var sensortype = data.sensor.charAt(0);

      switch (sensortype){
        case 'L':
        el.classList.add("data-light"); // icon and color
        eventMonoxide = '+- ' + (eventValue * 0.0025).toFixed(2) + ' g CO2';
        eventValueText = (eventValue / 60).toFixed(0) +' minuten';       // data unit
        break;
        case 'S':
        el.classList.add("data-shower");  // icon and color
        eventMonoxide = '+- ' + (eventValue * 0.5).toFixed(0) + ' g CO2';
        eventValueText = (eventValue / 60).toFixed(0) +' minuten';       // data unit
        break;
        case 'G':
        el.classList.add("data-garbage"); // icon and color
        eventMonoxide = '+- ' + (eventValue*0.7).toFixed(0) + ' g CO2';
        eventValueText = eventValue + ' gram';       // data unit
        break;
        default:
        console.log("hmm - no data letter here!");
        break;
      }

      el.querySelector('.time').append(timestring);  //add the timestamp of the sensorreading

      el.onclick = function () {
        alert("Om " + timestring
        + " op " + daystring + " heeft de " + sensorNames[sensortype]
        + " waargenomen dat " + eventValue + " door gebruiker " + data.sensor.charAt(1)
        + " is gebruikt. This is ongeveer " + eventMonoxide + " gram CO2."); //text when you click on the Object );
      };


      el.querySelector('.value').append(eventValueText);
      el.querySelector('.co2').append(eventMonoxide);
      el.querySelector('.data').id = 'doc-' + doc.id;

      if (number % 2 == 0){     //alternate right and left for timeline
        el.classList.add("data_right")
      } else {
        el.classList.add("data_left")
      }

      mainEl.querySelector('#data-points').prepend(el);  //add to list of all elements

    }
  };
  this.getAllDataPoints(renderer, firebase.auth().currentUser.uid);


};


YourEco.prototype.viewDashboard = function() {
  var mainEl = this.renderTemplate('dashboard');
  var headerEl = this.renderTemplate('header-base', {
    hasSectionHeader: true
  });

  headerEl.querySelector('#title_inner').append(firebase.auth().currentUser.displayName);
  headerEl.querySelector('#dashboard_button').addEventListener('click', function(){that.router.navigate('/dashboard');});
  headerEl.querySelector('#timeline_button').addEventListener('click', function(){that.router.navigate('/timeline');});

  this.replaceElement(document.querySelector('.header'), headerEl);
  this.replaceElement(document.querySelector('main'), mainEl);

  var that = this;

  var renderer = {
    display: function(sample, maximum, y_text, title, type) {     //[sample, y_text, title]
      var el = that.renderTemplate('graphcontainer');   //create new datapoint class
      el.querySelector('.graph_inner').id = 'graph-' + type;
      el.querySelector('svg').id = 'svg-' + type;
      mainEl.querySelector('#allGraphs').append(el);  //add to list of all elements
      that.renderGraph(sample, maximum, y_text, title, type);     //[sample, y_text, title]


    }
  };
  //this.getAllDataPoints(renderer, firebase.auth().currentUser.uid);

  var monday = new Date();
  var nextMonday = new Date();
  var day = monday.getDay() || 7; // Get current day number, converting Sun. to 7
  if (day!== 1){   monday.setHours(-24 * (day - 1)); }              // Only manipulate the date if it isn't Mon. // multiplied by negative 24
  monday.setHours(3); monday.setMinutes(0); monday.setSeconds(0); monday.setMilliseconds(0);
  nextMonday.setDate(monday.getDate()+7);
  nextMonday.setHours(3); nextMonday.setMinutes(0); nextMonday.setSeconds(0); nextMonday.setMilliseconds(0);

  console.log("the timestamp for comparison is: " + monday + " compared to " + nextMonday); // will be Monday

  this.getGraphData(renderer, firebase.auth().currentUser.uid, monday, nextMonday);

};

YourEco.prototype.renderTemplate = function(id, data) {
  var template = this.templates[id];
  var el = template.cloneNode(true);
  el.removeAttribute('hidden');
  this.render(el, data);
  return el;
};

YourEco.prototype.render = function(el, data) {
  if (!data) {
    return;
  }

  var that = this;
  var modifiers = {
    'data-fir-foreach': function(tel) {
      var field = tel.getAttribute('data-fir-foreach');
      var values = that.getDeepItem(data, field);

      values.forEach(function(value, index) {
        var cloneTel = tel.cloneNode(true);
        tel.parentNode.append(cloneTel);

        Object.keys(modifiers).forEach(function(selector) {
          var children = Array.prototype.slice.call(
            cloneTel.querySelectorAll('[' + selector + ']')
          );
          children.push(cloneTel);
          children.forEach(function(childEl) {
            var currentVal = childEl.getAttribute(selector);

            if (!currentVal) {
              return;
            }
            childEl.setAttribute(
              selector,
              currentVal.replace('~', field + '/' + index)
            );
          });
        });
      });

      tel.parentNode.removeChild(tel);
    },
    'data-fir-content': function(tel) {
      var field = tel.getAttribute('data-fir-content');
      tel.innerText = that.getDeepItem(data, field);
    },
    'data-fir-click': function(tel) {
      tel.addEventListener('click', function() {
        var field = tel.getAttribute('data-fir-click');
        that.getDeepItem(data, field)();
      });
    },
    'data-fir-if': function(tel) {
      var field = tel.getAttribute('data-fir-if');
      if (!that.getDeepItem(data, field)) {
        tel.style.display = 'none';
      }
    },
    'data-fir-if-not': function(tel) {
      var field = tel.getAttribute('data-fir-if-not');
      if (that.getDeepItem(data, field)) {
        tel.style.display = 'none';
      }
    },
    'data-fir-attr': function(tel) {
      var chunks = tel.getAttribute('data-fir-attr').split(':');
      var attr = chunks[0];
      var field = chunks[1];
      tel.setAttribute(attr, that.getDeepItem(data, field));
    },
    'data-fir-style': function(tel) {
      var chunks = tel.getAttribute('data-fir-style').split(':');
      var attr = chunks[0];
      var field = chunks[1];
      var value = that.getDeepItem(data, field);

      if (attr.toLowerCase() === 'backgroundimage') {
        value = 'url(' + value + ')';
      }
      tel.style[attr] = value;
    }
  };

  var preModifiers = ['data-fir-foreach'];

  preModifiers.forEach(function(selector) {
    var modifier = modifiers[selector];
    that.useModifier(el, selector, modifier);
  });

  Object.keys(modifiers).forEach(function(selector) {
    if (preModifiers.indexOf(selector) !== -1) {
      return;
    }

    var modifier = modifiers[selector];
    that.useModifier(el, selector, modifier);
  });
};

YourEco.prototype.useModifier = function(el, selector, modifier) {
  el.querySelectorAll('[' + selector + ']').forEach(modifier);
};

YourEco.prototype.getDeepItem = function(obj, path) {
  path.split('/').forEach(function(chunk) {
    obj = obj[chunk];
  });
  return obj;
};

YourEco.prototype.renderPrice = function(price) {
  var el = this.renderTemplate('price', {});
  for (var r = 0; r < price; r += 1) {
    el.append('$');
  }
  return el;
};

YourEco.prototype.replaceElement = function(parent, content) {
  parent.innerHTML = '';
  parent.append(content);
};

YourEco.prototype.rerender = function() {
  this.router.navigate(document.location.pathname + '?' + new Date().getTime());
};
