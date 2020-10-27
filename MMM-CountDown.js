Module.register("MMM-CountDown",{
	// Default module config.
	defaults: {
		debug: false,
		event: "New Millenium",
		date: "3000-01-01 ",
		description: false,
		eventDataUrl: null,
		auth: null,
		maximumEntries: 20,
		maximumNumberOfDays: 365,
		reloadInterval: 1000 * 60 * 60, // 1hr
		showHours: true,
		showMinutes: true,
		showSeconds: true,
		customInterval: 60 * 1000,
		daysLabel: 'Days',
		hoursLabel: 'Hours',
		minutesLabel: 'Minutes',
		secondsLabel: 'Seconds',
		numEventsToShow: 5,
		rotateInterval: 1000 * 30,
		animationSpeed: 1000,
		showMessage: true
	},

	start: function() {
		var self = this;

		//Set the current event to default. It will be displayed if the are not any events loaded from the calendar
		this.curEvent  = {date: "3000-01-01", event: "New Millenium", description: "Happy Millenium"};
		this.events = [];

	
		this.loaded = false;
		if (this.config.eventDataUrl !== null) {
			this.countdownLog("Sending message to Get Events");
			this.sendSocketNotification("EVENTS_GET", {
				debug: 				 this.config.debug, 
				eventDataUrl: 		 this.config.eventDataUrl, 
				auth: 				 this.config.auth,
				maximumEntries:		 this.config.maximumEntries,
				maximumNumberOfDays: this.config.maximumNumberOfDays,
				reloadInterval: 	 this.config.reloadInterval, 
				instanceId: 		 this.identifier});

			//If multiple events are to be shown
			if (this.config.numEventsToShow > 0){
				this.scheduleCarousel();
			}
		} else {
			this.countdownLog("Reading Single Event");
			this.curEvent = {date: this.config.date, event: this.config.event, description: this.config.description};
			this.loaded = true;
		}

		 

	},
	
	getStyles: function () {
		return ["MMM-CountDown.css"];
	},

	getScripts: function() {
        return ["moment.js"];
	},

	countdownLog: function(msg){
		prefix = "MMM-Countdown ";
		if (this.config.debug){
			console.log(prefix + msg);
		}
	},

	

	// Update function
	getDom: function() {

		
		var wrapper = document.createElement("div");

		if (!this.loaded){
			wrapper.innerHTML = "Loading . . .";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
		}

		//Determine which event to show
		//if events were loaded  from cal then show the event based on the index set by the carousel 
		//otherwise show the current event 

		var event = (this.events.length >0)?this.events[this.eventIndex]:this.curEvent;
		
		wrapper.className = "countDownTimer";
		
		var header = document.createElement("h1");
		header.innerHTML=event.event;
		
		var listWrapper = document.createElement("ul");
		
		var today = new Date(Date.now());
		var target = new Date(event.date);
		var timeDiff = target - today;

		// Set days, hours, minutes and seconds
		var diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
		var diffHours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
		var diffSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

		if (diffDays < 0) diffDays++;
		if (diffHours <0) diffHours++;
		if (diffMinutes <0 ) diffMinutes++;
		
		// Build the output
		var hrs = '';
		var mins = '';
		var secs = '';
		var days = '';
		
		days = '<li><span id="days">' + diffDays + '</span>' + this.config.daysLabel + '</li>';
		
		if(this.config.showHours == true) {
			hrs = '<li><span id="days">' + diffHours + '</span>'  + this.config.hoursLabel + '</li>';
		}
		
		if(this.config.showMinutes == true) {
			mins = '<li><span id="days">' + diffMinutes + '</span>' + this.config.minutesLabel + '</li>';
		}
		
		if(this.config.showSeconds == true) {
			secs = '<li><span id="days">' + diffSeconds + '</span>' + this.config.secondsLabel + '</li>';
		}
		
		
		listWrapper.innerHTML = days + hrs + mins + secs;

		wrapper.appendChild(header);
		wrapper.appendChild(listWrapper);


		if (timeDiff <= 0 && event.description && this.config.showMessage){
			var footer = document.createElement("p");
			footer.classList.add("medium");
			footer.innerHTML=event.description;
			wrapper.appendChild(footer);
		}
		

		
		return wrapper;
	},

	 // this rotates your data
	 scheduleCarousel: function () {
		this.countdownLog("schedule carousle");
		var self = this;
        this.rotateInterval = setInterval(() => {

			this.eventIndex = (this.eventIndex == this.events.length-1)?0:this.eventIndex + 1;
			this.countdownLog(" EventIndex: " + this.eventIndex);
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

	socketNotificationReceived: function(notification, payload) {
		this.countdownLog("Notification Received: " + notification);


		
		if (notification === "CALENDAR_EVENTS"){

			if (this.identifier !== payload.id) {
				return;
			}
	
			this.countdownLog("Received " + notification + "set up events" + JSON.stringify(payload.events));
			this.events = [];

			if (payload.events.length > 0 ){

				var len = (this.config.numEventsToShow> payload.events.length )?payload.events.length:this.config.numEventsToShow;
				for (i=0; i<len; i++ ){
					startDate = moment(payload.events[i].startDate, "x").format("YYYY-MM-DD hh:mm a");
					this.events.push({
						"date"	: startDate,
						"event" : payload.events[i].title,
						"description" : payload.events[i].description
					});
				}

				this.countdownLog("Events " + JSON.stringify(this.events));
				this.eventIndex = 0;
				this.loaded = true;
				this.updateDom();
			}
		} 
		else if (notification == "INCORRECT_URL"){
			console.error("Invalid URL used for eventDataUrl URL: " + payload.url);
		} 
		else if (notification == "FETCH_ERROR"){
			//Log error and continue. If everything is set up correctly data will be refreshed once it becames available
			console.error("Calendar Error. Could not fetch calendar: ", payload.url, payload.error);
		}		
	}

});
