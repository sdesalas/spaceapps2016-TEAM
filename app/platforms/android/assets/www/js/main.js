
// Initialise vars _____________________________________________

var radDOM1 = document.getElementById('radDOM1');
var radDOM2 = document.getElementById('radDOM2');
var radDOM3 = document.getElementById('radDOM3');
var radDOM4 = document.getElementById('radDOM4');
var pressureDOM1 = document.getElementById('pressureDOM1');
var pressureDOM2 = document.getElementById('pressureDOM2');
var pressureDOM3 = document.getElementById('pressureDOM3');
var pressureDOM4 = document.getElementById('pressureDOM4');
var radIcon1 = document.getElementById('radIcon1');
var pressureIcon1 = document.getElementById('pressureIcon1');
var lastRadiationReading = 40;
var lastPressureReading = 1000;
var lastTempReading = 22;
var lastChartUpdate = 0;
var radiationHistory = [];
var pressureHistory = [];
var serialPipeline = "";
var lastSerialUpdate = 0;
var intervalID = 0;

// Helper functions __________________________________________

function getRadiationColor(val) {
    var r = 0, g = 0, b = 0;
    if (val < -50) b = 100;
    else if (val < 0) b = Math.abs(val) * 2;
    if (val > 50) r = 100;
    else if (val > 0) r = Math.abs(val) * 2;
    if (val > -50 && val < 50) g = 100;
    else g = (100 - Math.abs(val)) * 2  ;
    return 'rgb(' + r + '%, ' + g +'%, ' + b + '%)';
}

function getPressureColor(val) {
    var r = 0, g = 100, b = 0;
    if (val < 500) r = 100;
    else if (val < 1000) r = (1000 - val) / 5;
    if (val > 2000) r = 100;
    else if (val > 1000) r = Math.abs(1000 - val) / 10;
    if (val < 500 || val > 2000) g = 0;
    else if (val < 1000) g = (val - 500) / 5;
    else if (val > 1000) g = (2000 - val) / 10;
    return 'rgb(' + r + '%, ' + g +'%, ' + b + '%)';
}

// Core code __________________________________________________


function displayReadings() {

    // RUN CALCULATIONS
    var radiation = Math.floor(lastRadiationReading  / 5);
    var pressure = Math.floor(lastPressureReading);
    radiationHistory.push(radiation);
    pressureHistory.push(pressure);
    // get latest 160 readings (for chart)
    radiationHistory = radiationHistory.splice(-160); 
    pressureHistory = pressureHistory.splice(-160);

    // DISPLAY NUMBERS
    radDOM1.innerText = radiation;
    radDOM1.style.color = getRadiationColor(radiation);
    pressureDOM1.innerText = pressure;
    pressureDOM1.style.color = getPressureColor(pressure);
    radDOM2.innerText = radiation + Math.floor(Math.random() * 6) - 3;
    radDOM2.style.color = getRadiationColor(radiation);
    pressureDOM2.innerText = pressure + Math.floor(Math.random() * 10) - 5;
    pressureDOM2.style.color = getPressureColor(pressure);
    radDOM3.innerText = radiation + Math.floor(Math.random() * 6) - 3;
    radDOM3.style.color = getRadiationColor(radiation);
    pressureDOM3.innerText = pressure + Math.floor(Math.random() * 10) - 5;
    pressureDOM3.style.color = getPressureColor(pressure);
    radDOM4.innerText = radiation + Math.floor(Math.random() * 6) - 3;
    radDOM4.style.color = getRadiationColor(radiation);
    pressureDOM4.innerText = pressure + Math.floor(Math.random() * 10) - 5;
    pressureDOM4.style.color = getPressureColor(pressure);

    // UPDATE CHARTS
    var chartSettings = {
      type: 'line',
      width: '180',
      height: '40',
      lineColor: '#999',
      fillColor: '#222',
      lineWidth: 1,
      spotColor: '#999',
      minSpotColor: '#999',
      maxSpotColor: '#999',
      chartRangeMin: 0};

    // UPDATE CHART EVERY HALF SEC
    var secs = Math.floor((new Date()).getTime() / 500);
    if (secs > lastChartUpdate) {
        $("#radChart").sparkline(radiationHistory, chartSettings);
        $("#presureChart").sparkline(pressureHistory, chartSettings);
        lastChartUpdate = secs;
    }

    // TOO HIGH? WARN USER WITH VIBRATION
    if (radiation > 100) {
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        if (window.cordova && cordova.plugins && cordova.plugins.tonegenerator) {
            cordova.plugins.tonegenerator.play(900, 240);
        }
    } else {
        if (window.cordova && cordova.plugins && cordova.plugins.tonegenerator) {
            cordova.plugins.tonegenerator.stop();
        }
    }
}

function onError(message) {
	message = message || '';
	return function(err) {
		console.log(message + ' ' + err);
		var visualConsole = $("#serialConsole")[0];
		if (visualConsole) {
			$("visualConsole").text(message + ' ' + err)
		}
	}
}

function watchReadings() {
    console.log('watchReadings()'); 
    if (window.cordova && cordova.plugins && cordova.plugins.magnetometer) {
        cordova.plugins.magnetometer.watchReadings(
            function success (reading) {
                // COLLECT 'RADIATION' READINGS
                lastRadiationReading = reading.magnitude;
                if (radIcon1) { $(radIcon1).addClass('flash'); }
            }, onError('watchReadings()')
        );
        // Refresh display every 0.1 secs.
        intervalID = window.setInterval(displayReadings, 200);
    } else {
        console.log('No magnetometer plugin!!');
        console.log('cordova = ' + !!window.cordova);
        console.log('cordova.plugins = ' + !!cordova.plugins);
        console.log('cordova.plugins.magnetometer = ' + !!cordova.plugins.magnetometer);
    }
    if (serial && serial.requestPermission) {
    	watchSerial();
    } else {
        console.log('No serial usb plugin!!');
        lastPressureReading = lastPressureReading + (Math.random() * 10) - 5;
        lastTempReading = lastTempReading + (Math.random() * 1) - 0.5;
    }
}

function watchSerial() {
	// Check if updated last 5 seconds
	// No need to open port if thats the case
	var updated = Math.floor(lastSerialUpdate / (1000 * 5));
	var now = Math.floor((new Date()).getTime() / (1000 * 5));
	if (updated < now) {
		serial.requestPermission(function permissionAccepted() {
		    // open serial port
		    serial.open(
		        {baudRate: 9600},
		        // if port is succesfuly opened
		        function(successMessage) {
		            serial.registerReadCallback(
		              function success(data){
		              	  // Get ASCII from USB port and append to pipeline
		                  var view = new Uint8Array(data);
		                  //var json = JSON.stringify(view);
		                  //console.log('serialReadCallback', view);
		                  serialPipeline += String.fromCharCode.apply(null, view);
		                  $("#serialConsole").text(serialPipeline);
		                  // Process pipeline
		                  var lines = serialPipeline.split('\r\n');
		                  var incoming = lines.shift()
		                  if (incoming !== serialPipeline) {
		                  	 // We have some data!
		                  	 var incomingItems = incoming.split(' ');
		                  	 lastPressureReading = Number(incomingItems.pop()) / 101.325; // Pascals to mbar
		                  	 lastTempReading = Number(incomingItems.pop());
		                  	 serialPipeline = lines.join('\r\n');
		                  }
		                  // Track last updated time
		                  lastSerialUpdate = (new Date()).getTime();
                		  if (pressureIcon1) { $(pressureIcon1).addClass('flash'); }
		              },
		              function error(){
		                  console.log("Failed to register read callback");
		                  $("#serialConsole").text("Failed to register read callback");
		            }
		        );
		    });
		}, onError('requestPermission'));
	}
}

function mockReadings() {
    // No sensor available? We are on PC DEV mode, 
    // just use mocked sensor data.
    intervalID = window.setInterval(function() {
        lastRadiationReading = lastRadiationReading + (Math.random() * 2) - 1;
        lastPressureReading = lastPressureReading + (Math.random() * 10) - 5;
        lastTempReading = lastTempReading + (Math.random() * 1) - 0.5;
        displayReadings();
    }, 200);
}

function stop() {
    console.log('stop()'); 
    window.clearInterval(intervalID);
    if (window.cordova && cordova.plugins && cordova.plugins.magnetometer)
        cordova.plugins.magnetometer.stop();
    if (window.cordova && cordova.plugins && cordova.plugins.tonegenerator) 
        cordova.plugins.tonegenerator.stop();
}


// Device Event Listeners ___________________________________

document.addEventListener("pause", stop, false);
document.addEventListener("resume", watchReadings, false);
document.addEventListener("deviceready", watchReadings, false)


// Page DOM Event Listeners
$(pressureDOM1).click(watchSerial);
