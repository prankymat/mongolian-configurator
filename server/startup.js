Settings = new Mongo.Collection("Settings");

Meteor.startup(function() {

  var wlan_profile = Settings.findOne({
    namespace: "wlanProfile"
  });
  wlan_profile = wlan_profile || {
    iface: 'wlan0'
  };

  var Wireless = Meteor.npmRequire("wireless");
  var wireless = new Wireless({
    iface: wlan_profile.iface,
    updateFrequency: 10, // Optional, seconds to scan for networks
    connectionSpyFrequency: 20, // Optional, seconds to scan if connected
  });

  wireless.enable(function(err) {
    wireless.start();
  });

  // wireless.on('command', function(message) {
  //   console.log("[command] " + message);
  // });

  wireless.on('error', function(message) {
    console.log("[ERROR] " + message);
  });

  wireless.on('vanish', function(network) {
    console.log(network.ssid + " is now vanished");
  });

  setInterval(function() {
    wireless.status(function(status) {
      var Fiber = Meteor.npmRequire('fibers');
      Fiber(function() {
        Settings.update({
          namespace: "wlanStatus"
        }, {
          $set: {
            "status": status
          }
        }, {
          upsert: true
        })
      }).run();
    })
  }, 1000);


  setInterval(function() {
    wireless.essid(function(essid) {
      var Fiber = Meteor.npmRequire('fibers');
      Fiber(function() {
        Settings.update({
          namespace: "wlanProfile"
        }, {
          $set: {
            "ap.ssid": essid
          }
        }, {
          upsert: true
        })
      }).run();
    })
  }, 1000);

  setInterval(function() {
    wireless.bssid(function(bssid) {
      var Fiber = Meteor.npmRequire('fibers');
      Fiber(function() {
        Settings.update({
          namespace: "wlanProfile"
        }, {
          $set: {
            "ap.mac": bssid
          }
        }, {
          upsert: true
        })
      }).run();
    })
  }, 1000);

  Meteor.methods({
    query_networks: function() {
      return wireless.list();
    },

    join_network: function(network, password, callback) {
      wireless.join(network, password, function(err){
        console.log("calling back with err: ", err)
        callback && callback(err);
      });
    }
  });
})
