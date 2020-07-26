const request = require('request');
const ical = require('node-ical');

var NodeHelper = require("node_helper");
var moment = require("moment");

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


module.exports = NodeHelper.create({

  start: function() {
    console.log("[COUNTDOWN] Starting node_helper for module: " + this.name);

    this.schedule = null;
    this.eventsArray = [];

  },

  socketNotificationReceived: function(notification, payload) {

    var self = this;

    if (payload.debug == true) console.log("[COUNTDOWN] Notification received: ", notification);
    if (payload.eventDataUrl != null) {
      this.eventsArray = [];

      if (payload.debug == true) console.log("[COUNTDOWN] Getting events from URL: ", payload.eventDataUrl);
      
      ical.fromURL(payload.eventDataUrl, {}, function (err, data) {

        if (err) throw err;

        self.schedule = data;
        self.postProcessSchedule(payload.debug);
        self.getNextEvents(payload);
      });

    }
  },

  postProcessSchedule: function(debug) {

    for (let k in this.schedule) {
      if (this.schedule.hasOwnProperty(k)) {
          const ev = this.schedule[k];
          if (this.schedule[k].type == 'VEVENT') {
            if (debug == true) console.log(`[COUNTDOWN] ${ev.summary}, ${ev.start} on the ${ev.start.getDate()} of ${months[ev.start.getMonth()]} at ${ev.start.toLocaleTimeString('en-GB')}`);

            this.schedule[k].eventDate = moment(this.schedule[k].start, "MMM DD HH:mm Z");
            this.eventsArray.push({date: this.schedule[k].eventDate, event: this.schedule[k].summary});
          }
      }
    }

  },

  getNextEvents: function(payload) {
    var now = moment(); //get now
    
    //find info for next events
    var returnEvents = this.eventsArray.filter(function (obj) {
      if (payload.debug == true) console.log(`[COUNTDOWN] ${obj.date}, ${now}`);

      return obj.date.isAfter(now, 'second');
    });

    if (payload.debug == true) console.log(`[COUNTDOWN] Events ${returnEvents}`);

    this.sendSocketNotification('EVENTS-RESPONSE', returnEvents.sort((a, b) => a.date - b.date));

  }

});