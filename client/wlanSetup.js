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
    return profile || {};
  },

  wlanStatus: function() {
    var wlanStatus = Settings.findOne({namespace:"wlanStatus"}) || {};
    return wlanStatus.status || "";
  }
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
  },

  'click #join': function() {
    var ssid = $("#ssid_group :radio:checked").attr('id');
    var password = $("#password").val();

    var network = _.find(Session.get('availableNetworks'), function(network){
      return network.ssid === ssid;
    });


    console.log(network, password);
    Meteor.call('join_network', network, password, function(result){
      console.log("result", result)
    });
  }
})
