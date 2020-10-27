const NodeHelper = require("node_helper");
const CalendarFetcher = require("./calendarfetcher.js");
const validUrl = require("valid-url");

module.exports = NodeHelper.create({

  countdownLog: function(msg){
		prefix = "MMM-Countdown ";
		if (this.debug){
			console.log(prefix + msg);
		}
	},

  start: function() {
    console.log("Starting node_helper for module: " + this.name);
    this.fetchers = [];

  },

  //Override the socket Notification
  socketNotificationReceived: function(notification, payload) {

    if (notification == "EVENTS_GET"){
      this.debug = payload.debug;
      this.countdownLog("Notification received: " +notification);

      //TODO add maxentries masnumofdays,auth to config for now hardcoiding max and setting auth to null
      this.createFetcher(payload.eventDataUrl, payload.reloadInterval,[],payload.maximumEntries,payload.maximumNumberOfDays,payload.auth,false,payload.instanceId);
    }
  },


  /**
	 * Creates a fetcher for a new url if it doesn't exist yet.
	 * Otherwise it reuses the existing one.
	 *
	 * @param {string} url The url of the calendar
	 * @param {number} fetchInterval How often does the calendar needs to be fetched in ms
	 * @param {string[]} excludedEvents An array of words / phrases from event titles that will be excluded from being shown.
	 * @param {number} maximumEntries The maximum number of events fetched.
	 * @param {number} maximumNumberOfDays The maximum number of days an event should be in the future.
	 * @param {object} auth The object containing options for authentication against the calendar.
	 * @param {boolean} broadcastPastEvents If true events from the past maximumNumberOfDays will be included in event broadcasts
	 * @param {string} identifier ID of the module
	 */
	createFetcher: function (url, fetchInterval, excludedEvents, maximumEntries, maximumNumberOfDays, auth, broadcastPastEvents, identifier) {
		var self = this;

		if (!validUrl.isUri(url)) {
			console.log("MMM-Countdown Invalid URL: " + url);
			self.sendSocketNotification("INCORRECT_URL", { id: identifier, url: url });
			return;
		} 

		var fetcher;
		if (typeof self.fetchers[identifier + url] === "undefined") {
			this.countdownLog("Create new calendar fetcher for url: " + url + " - Interval: " + fetchInterval);
			fetcher = new CalendarFetcher(url, fetchInterval, excludedEvents, maximumEntries, maximumNumberOfDays, auth, broadcastPastEvents);

			fetcher.onReceive(function (fetcher) {
        		self.countdownLog("Retrieved Events");
				self.sendSocketNotification("CALENDAR_EVENTS", {
					id: identifier,
					url: fetcher.url(),
					events: fetcher.events()
				});
			});

			fetcher.onError(function (fetcher, error) {
				console.eventDataUrlerror("Calendar Error. Could not fetch calendar: ", fetcher.url(), error);
				self.sendSocketNotification("FETCH_ERROR", {
					id: identifier,
					url: fetcher.url(),
					error: error
				});
			});

			self.fetchers[identifier + url] = fetcher;
		} else {
			console.log("Use existing calendar fetcher for url: " + url);
			fetcher = self.fetchers[identifier + url];
			fetcher.broadcastEvents();
		}

		fetcher.startFetch();
	}



});