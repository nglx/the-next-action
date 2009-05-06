var PING_TIMEOUT  = 3000;
var PING_INTERVAL = 10000;
//var PING_START_DELAY = 1000;

var sender = null;
google.gears.workerPool.onmessage = function(messageText, senderId, message) {
  sender = senderId;
};


var state = false;
var pings = 0; var pongs = 0;
var request = google.gears.factory.create('beta.httprequest');

// periodic timer
var timer = google.gears.factory.create('beta.timer');

function isOnline() {
    return pings == pongs;
}

function checkOnline() {
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            try{
            if (request.status == 200) {
                pongs = pings;
            }
            }catch(e){}
        }      
    };    

    request.open('GET', '/images/ping.gif?'+new Date().getTime());
    request.send();

    timer.setTimeout(function() {
        if (state != isOnline()) {
          state = isOnline();
          if (sender != null) {
            google.gears.workerPool.sendMessage(state, sender);
          }
        }
    }, PING_TIMEOUT);
    pings++;
}

// trigger the first check imediatelly
//timer.setTimeout(function() {
    checkOnline();
//}, PING_START_DELAY);

// plan interval checking
timer.setInterval(function() { 
    checkOnline();
}, PING_INTERVAL);
