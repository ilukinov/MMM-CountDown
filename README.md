# MMM-CountDown
![Screenshot_1](https://github.com/bikerpatch/MMM-CountDown/raw/master/Screenshot_1.png)

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/) which can count down the days to a date/event.

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
    modules: [
        {
            module: 'MMM-CountDown',
            config: {
                // See configuration options
            }
        }
    ]
}
```

## Configuration options

| Option           | Description                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| `event`          | Name of event to count down to (displayed above counter) the event will be used if a `eventDataUrl` is not supplied  <br> <br>Type: `String`<br> Defaults to  "New Millenium"                                            |
| `date`           | Date to count down to (YYYY-MM-DD HH:MM:SS+00:00) the date will be used if an `eventDataUrl` is not supplied <br> <br> Type: `String` <br> Defaults to "3000-01-01 "
| `description`    | Message to display below the counter once the event occurs. Will be used if an `eventDataURL` is not supplied. <br> <br> Type: `String` <br>Defaults to null  no  description is displayed. 
|`showMessage`     |Whether to show the description as a message below the counter box once the event occurs<br><br> Type: `Boolean`,<br>Defaults to `true`                                    |
| `eventDataUrl`   | Full URL of the iCal calendar to use to load events. <br><br> Type: `String` <br> Defaults to null |
| `auth` | Authentication object used to authenticate to the iCal calender. See section below for auth object details<br<br> Type: `Object`<br> Defaults to null authentication not required.
| `reloadInterval` | Interval to use to refresh events from the eventDataUrl in milliseconds <br><br> Type: `Number` Defaults to 3600 - 1 hour    
|`numEventsToShow`: | Number of events to rotate through. Instead of just displaying 1 coundown date it will rotate through the number events specified. If you only want to see the next event you can set this attribute to 1, <br><br> Type: `Number`<br> Defaults to 5
|`rotateInterval`   | If multiple events are being displayed this attribute specifies how often to rotate to the next event This value is specified in milliseconds. <br><br> Type: `Number`<br> Defaults to 30000 (30 Seconds)
|`animationSpeed`   | if multiple events are being displayed this attribute specifies the animation speed(in milliseconds) of the transition process<br><br>Type: `Number`<br>: 1000 (1 Second)
| `maxiumEntries`   | Number of entries to retrieve from the iCal.<br><br>Type: `Number` <br> Defaults to 20
|`maximumNumberOfDays`| Maximum Number of days to retrieve from the iCal. <br><br>Type: `Number`<br> Defaults to 365                                                        |
| `showHours`      | Decide whether or not to display the hours. <br><br>Type: `Boolean` <br> Default is true                                                           |
| `showMinutes`    | Decide whether or not to display the minutes. <br><br>Type: `Boolean` <br> Default is true                                                                                                      |
| `showSeconds`    | Decide whether or not to display the seconds. <br><br>Type: `Boolean` <br> Default is true                                                           |
| `customInterval` | Change the UI refresh update interval which will help reduce load if you are only showing specific time metrics.<br> <br> Type: `Number` <br> Default is 1000 |
| `daysLabel`      | Choose how you wish to display your Days label.<br><br> Type: `String`<br> Default is Days                                                       |
| `hoursLabel`     | Choose how you wish to display your Hours label.<br><br> Type: `String`<br> Default is Hours                                                     |
| `minutesLabel`   | Choose how you wish to display your Minutes label.<br><br> Type: `String`<br> Default is Minutes                                                 |
| `secondsLabel`   | Choose how you wish to display your Seconds label.<br><br> Type: `String`<br> Default is Seconds                                                 |
| `debug`          | Enable debugging.  Default is false  


###Auth Object Configuration
|Option|Description|
|------|-----------|
|`user`|The username for HTTP authentication.|
|`pass`|The password for HTTP authentication. (If you use Bearer authentication, this should be your BearerToken.)|
|`method`|Which authentication method should be used. HTTP Basic, Digest and Bearer authentication methods are supported. Basic authentication is used by default if this option is omitted. Possible values: digest, basic, bearer Default value: basic|



##Note about using an iCAL

This module uses the calendar fetcher functionality from the default calendar module. It will retrieve events that are not in the past. means that:

* All day events will be shown for the whole day. That means once midnight hits the counter will show negative number for the duration of the day. Once the next day hits the event will not be shown,
* If you add an event with a start time and end time. Once the start time hoits the counter will hit 0 and then show negative numbers until the end time has passed.
* Repeating calendar evdents are shown
* If you want a message displayed beneath the counter wonce it reaches 0 add a description to the calendar event. This description will be shown as long as showMessages is set to true.
* Functionaity is not added for excluded events since it is assumed that most people will just create a calendar specific to things that they want displayed in the Countdown

