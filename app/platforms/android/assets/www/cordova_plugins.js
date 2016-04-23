cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-magnetometer/www/magnetometer.js",
        "id": "cordova-plugin-magnetometer.main",
        "clobbers": [
            "cordova.plugins.magnetometer"
        ]
    },
    {
        "file": "plugins/cordova-plugin-tonegenerator/www/tonegenerator.js",
        "id": "cordova-plugin-tonegenerator.main",
        "clobbers": [
            "cordova.plugins.tonegenerator"
        ]
    },
    {
        "file": "plugins/cordova-plugin-vibration/www/vibration.js",
        "id": "cordova-plugin-vibration.notification",
        "merges": [
            "navigator.notification",
            "navigator"
        ]
    },
    {
        "file": "plugins/fr.drangies.cordova.serial/www/serial.js",
        "id": "fr.drangies.cordova.serial.Serial",
        "clobbers": [
            "window.serial"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.2",
    "cordova-plugin-magnetometer": "1.0.0",
    "cordova-plugin-tonegenerator": "1.0.0",
    "cordova-plugin-vibration": "2.1.2-dev",
    "fr.drangies.cordova.serial": "0.0.7"
}
// BOTTOM OF METADATA
});