Module.register("MMM-CountDown",{
	// Default module config.
	defaults: {
		debug: false,
		event: "New Millenium",
		date: "3000-01-01",
		eventDataUrl: '',
    	reloadInterval: 1000 * 60 * 60 * 1, // 1hr
		showHours: true,
		showMinutes: true,
		showSeconds: true,
		customInterval: 1000,
		daysLabel: 'Days',
		hoursLabel: 'Hours',
		minutesLabel: 'Minutes',
		secondsLabel: 'Seconds',
	},

	// set update interval
	start: function() {
		var self = this;

		clearTimeout(this.timer);
		this.timer = null;
		clearInterval(this.interval);
		this.interval = null;
		
		if (this.config.eventDataUrl !== undefined) {
			this.sendSocketNotification("EVENTS-GET", {debug: this.config.debug, eventDataUrl: this.config.eventDataUrl, reloadInterval: this.config.reloadInterval, instanceId: this.identifier});

		} else {
			this.events = [{date: this.config.date, event: this.config.event}];
		}

		this.interval = setInterval(function() {

			self.updateValues();
		}, this.config.customInterval); 

		this.timer = setTimeout(function() {

			self.start();
		}, this.config.reloadInterval); 
	},
	
	getStyles: function () {
		return ["MMM-CountDown.css"];
	},

	getScripts: function() {
        return ["moment.js"];
	},

	socketNotificationReceived: function(notification, payload) {
		if (this.config.debug == true) console.log("[COUNTDOWN] Notification Received: ", notification);
		if (notification == "EVENTS-RESPONSE") {
			
			if (this.config.debug == true) console.log("[COUNTDOWN] Events: ", payload);
			
			if ((payload === undefined) || (payload.length === 0)) {
				this.events = [{date: this.config.date, event: this.config.event}];

			} else {
				this.events = payload;

			}

			this.updateValues();

		}
	},

	// Update function
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "countDownTimer"
		
		var header = document.createElement("h1");
		header.id = "eventHeader";
		
		var listWrapper = document.createElement("ul");
		
		// Build the output
		var hrs = '';
		var mins = '';
		var secs = '';
		var days = '';
		
		days = '<li><span id="days"></span>' + this.config.daysLabel + '</li>';
		
		if(this.config.showHours == true) {
			hrs = '<li><span id="hours"></span>'  + this.config.hoursLabel + '</li>';
		}
		
		if(this.config.showMinutes == true) {
			mins = '<li><span id="minutes"></span>' + this.config.minutesLabel + '</li>';
		}
		
		if(this.config.showSeconds == true) {
			secs = '<li><span id="seconds"></span>' + this.config.secondsLabel + '</li>';
		}
		
		listWrapper.innerHTML = days + hrs + mins + secs;
		
		wrapper.appendChild(header);
		wrapper.appendChild(listWrapper);

		return wrapper;
	},

	updateValues: function() {
		if (this.config.debug == true) console.log("[COUNTDOWN] Updating values");

		var today = new Date(Date.now());

		var target = null;
		var timeDiff = null;
		var eventName = null;

		var found = false;

		for (let i in this.events) {
			if (this.config.debug == true) console.log("[COUNTDOWN] Event", this.events[i]);
			target = new Date(this.events[i].date);
			timeDiff = target - today;
			eventName = this.events[i].event;

			if (this.config.debug == true) console.log("[COUNTDOWN] Time difference", timeDiff);
			if (timeDiff > 0) {
				found=true;
				break;
			}
		}

		if (found == false) {
			target = today;
			timeDiff = target - today;
		}

		var eventHeader = document.querySelector('#' + this.identifier + ' #eventHeader');
		eventHeader.innerHTML = eventName;

		// Set days, hours, minutes and seconds
		var diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
		var diffHours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
		var diffSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

		var days = document.querySelector('#' + this.identifier + ' #days');
		days.innerHTML = diffDays;

		if(this.config.showHours == true) {
			var hrs = document.querySelector('#' + this.identifier + ' #hours');
			hrs.innerHTML = diffHours;
		}
		
		if(this.config.showMinutes == true) {
			var mins = document.querySelector('#' + this.identifier + ' #minutes');
			mins.innerHTML = diffMinutes;
		}
		
		if(this.config.showSeconds == true) {
			var secs = document.querySelector('#' + this.identifier + ' #seconds');
			secs.innerHTML = diffSeconds;
		}
	}

});
