var Boardgames = new Backbone.Marionette.Application();

Boardgames.addRegions({
  mainRegion: "#mainRegion",
  messagesRegion: "#messagesRegion"
});

Boardgames.PBJ = {};
Boardgames.PBJ.rpc = new easyXDM.Rpc({
    //PBJ_URL set from index.php
    remote: PBJ_URL + "/web/pbj.php",
    onReady: function() {
    }
  }, {
  remote: {
    notify: {},
    setFrameHeight: {}
  }
});

Boardgames.PBJ.infoBegin = function(name, message) {
  var n = {
    name: name,
    message: message,
    type: "info",
    stage: "begin"
  };
  Boardgames.PBJ.sendNotification(n);
};
Boardgames.PBJ.infoEnd = function(name, message) {
  var n = {
    name: name,
    message: message,
    type: "info",
    stage: "end"
  };
  Boardgames.PBJ.sendNotification(n);
};
Boardgames.PBJ.errorEnd = function(message) {
  var n = {
    name: name,
    message: message,
    type: "error",
    stage: "end"
  };
  Boardgames.PBJ.sendNotification(n);
};
Boardgames.PBJ.sendNotification = function(userNotification) {
  Boardgames.PBJ.rpc.notify(userNotification);
};

Boardgames.PBJ.monitorHeight = function() {
  document.body.style.border = 0;
  document.body.style.padding = 0;
  document.body.style.margin = 0;
  var documentHeight = document.body.scrollHeight;
  var heightChanged = function() {
    var height = document.body.scrollHeight;
    if (height != documentHeight) {
      documentHeight = height;
      console.log("SENDING HEIGHT:", documentHeight);
      Boardgames.PBJ.rpc.setFrameHeight(documentHeight);
    }
    else {
      //console.log("Height unchanged", height);
      //document.body.style.height = "200px";
    }
    setTimeout(heightChanged, 3000);
  };
  heightChanged();
};
$(document).ready(Boardgames.PBJ.monitorHeight);

Boardgames.fetchSession = function() {
  if (!Boardgames.userSession.isInit) {
    Boardgames.PBJ.infoBegin("fetchSession", "Loading user session...");
    Boardgames.userSession.fetch({
      success: function() {
        Boardgames.PBJ.infoEnd("fetchSession", "User session loaded.");
      },
      error: function(model, response, options) {
        console.error("Fetch Session Error", response);
      }
    });
  }
};

Boardgames.fetchEventGames = function() {
  if (!Boardgames.eventGames.isInit) {
    if (Boardgames.userSession.isInit) {
      Boardgames.PBJ.infoBegin("fetchGames", "Loading event games...");
      Boardgames.eventGames.eventid = Boardgames.eventid;
      Boardgames.eventGames.fetch({
        success: function(coll, resp, opt) {
          Boardgames.PBJ.infoEnd("fetchGames", "Event games loaded.");
        }
      });
    }
  }
};

Boardgames.fetchUserCollection = function() {
  if (!Boardgames.userCollection.isInit) {
    if (Boardgames.userSession.isInit) {
      Boardgames.PBJ.infoBegin("fetchCollection", "Loading games collection...");
      Boardgames.userCollection.userid = Boardgames.userSession.get("user").id;
      Boardgames.userCollection.fetch({
        success: function(coll, resp, opt) {
          Boardgames.PBJ.infoEnd("fetchCollection", "Games collection loaded.");
        }
      });
    }
  }
};

Boardgames.module("Controller", function(Controller, App, Backbone, Marionette, $, _){
  Controller.Router = Marionette.AppRouter.extend({
    appRoutes : {
      "": "home",
      "eventSignup": "home",
      "game/:bggid": "showGame",
      "searchGames": "searchGames",
      "searchGames?search=:search": "searchGames",
      "userCollection": "showUserCollection"
    }
  });
  
  Controller.Controller = function(){
    //Backbone.history.navigate("login", true);
  };

  _.extend(Controller.Controller.prototype, {
    
    showLoading: function() {
      var view = new Boardgames.View.Loading({
        model: null
      });
      Boardgames.mainRegion.show(view);
    },
    
    showSessionError: function() {
      var view = new Boardgames.View.SessionError({
        model: null
      });
      Boardgames.mainRegion.show(view);
    },
    
    home: function() {
      var view = new Boardgames.View.EventGameListView({
        collection: Boardgames.eventGames
      });
      Boardgames.mainRegion.show(view);
    },
    
    showUserCollection: function() {
      var view = new Boardgames.View.GameListView({
        collection: Boardgames.userCollection
      });
      Boardgames.mainRegion.show(view);
    },
    
    showGame: function(bggid) {
      this.showLoading();
      var self = this;
      var game = new Boardgames.Model.Boardgame({
        id: bggid
      });
      
      Boardgames.PBJ.infoBegin("fetchGame", "Loading game...");
      game.fetch({
        success: function(model) {
          var view = new Boardgames.View.GameDetailView({
            model: model
          });
          Boardgames.mainRegion.show(view);
          Boardgames.PBJ.infoEnd("fetchGame", "Game loaded.");
        },
        error: function() {
          Boardgames.PBJ.errorEnd("fetchGame", "Error loading game.");
        }
      });
    },
    
    searchGames: function(search, bggid) {
      var view = new Boardgames.View.AddGameView({
        model: null
      });
      Boardgames.mainRegion.show(view);
      if (search && search !== "") {
        search = decodeURIComponent(search);
        view.submitSearch(search);
      }
    }
    
  });
  
  Controller.addInitializer(function(){
    Boardgames.controller = new Controller.Controller();
    Boardgames.router = new Controller.Router({
      controller: Boardgames.controller
    });
  });
});

Boardgames.on("initialize:before", function(options) {
  Boardgames.userSession = new Boardgames.Model.UserSession();
  Boardgames.userSession.isInit = false;
  Boardgames.guest = new Boardgames.Model.PbjGuest();
  Boardgames.eventGames = new Boardgames.Model.EventBoardgameList();
  Boardgames.eventGames.isInit = false;
  Boardgames.userCollection = new Boardgames.Model.UserBoardgameList();
  Boardgames.userCollection.isInit = false;
});

Boardgames.on("initialize:after", function(options){
  Backbone.history.start();
  Boardgames.fetchSession();
  Boardgames.userSession.once("change", function() {
    Boardgames.userSession.isInit = true;
    Boardgames.eventid = Boardgames.userSession.get("eventid");
    Boardgames.guest.set("id", Boardgames.userSession.get("guestid"));
    Boardgames.guest.fetch({
      success: function() {
      }
    });
    Boardgames.fetchEventGames();
    Boardgames.fetchUserCollection();
  });
  Boardgames.eventGames.once("reset", function() {
    Boardgames.eventGames.isInit = true;
    console.log("eventGames:", Boardgames.eventGames);
  });
  Boardgames.userCollection.once("reset", function() {
    Boardgames.userCollection.isInit = true;
    console.log("userCollection:", Boardgames.userCollection);
  });
});