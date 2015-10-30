Settings = new Mongo.Collection("Settings");

Meteor.startup(function() {

  var wlan_profile = Settings.findOne({namespace: "wlanSettings"});
  wlan_profile = wireless || {iface: 'wlan0'};

  var Wireless = Meteor.npmRequire("wireless");
  var wireless = new Wireless({
    iface: wlan_profile.iface,
    updateFrequency: 10, // Optional, seconds to scan for networks
    connectionSpyFrequency: 20, // Optional, seconds to scan if connected
  });

  wireless.enable(function(err) {
    wireless.start();
  });

  wireless.on('error', function(message) {
    console.log("[ERROR] " + message);
  });

  wireless.on('vanish', function(network) {
    console.log(network.ssid + " is now vanished");
  })

  Meteor.methods({
    query_networks: function() {
      return wireless.list();
    }
  });
})
