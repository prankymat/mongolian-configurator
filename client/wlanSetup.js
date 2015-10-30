Settings = new Mongo.Collection("Settings");

Template.wlanSetup.helpers({
  networks: function() {
    var networks = Session.get('availableNetworks');
    return networks;
  }
});

Template.wlanStatus.helpers({
  currentWlan: function() {
    var profile = Settings.findOne({namespace:"wlanProfile"});
    return profile;
  },

  wlanStatus: function() {
    return Session.get('wlanStatus');
  }
})

Tracker.autorun(function(){
  var wlanStatus = Settings.findOne({namespace:"wlanStatus"});
  Session.set('wlanStatus', (wlanStatus || {}).status);
})

Template.wlanSetup.onRendered(function(){
  $("#scan").click();
});

Template.wlanSetup.events({
  'click #scan': function() {
    Meteor.call('query_networks', function(err, response) {
      // if (err) {
      //   Session.set('serverDataResponse', "Error:" + err.reason);
      //   return;
      // }

      var array = $.map(response, function(value, index) {
        return [value];
      });

      Session.set('availableNetworks', array);
    });
  }
})
