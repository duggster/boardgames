Boardgames.module("Model", function(Model, App, Backbone, Marionette, $, _){
  Model.bgBase = '../api/slim.php';
  //PBJ_URL set from index.php
  Model.pbjBase = PBJ_URL + '/api/slim.php';
  
  Model.UserSession = Backbone.Model.extend({
    urlRoot: Model.pbjBase + '/session'
  });
  
  Model.PbjGuest = Backbone.Model.extend({
    urlRoot: Model.pbjBase + '/guests'
  });
  
  Model.Boardgame = Backbone.Model.extend({
    urlRoot: Model.bgBase + '/boardgames',
    defaults: {
      name: "",
      year: "",
      playingtime: "",
      age: "",
      minplayers: 0,
      maxplayers: 0,
      thumbnail: ""
    }
  });
  
  Model.EventBoardgame = Backbone.Model.extend({
    urlRoot: function() {
      return Model.bgBase + '/events/' + this.eventid + '/boardgames/';
    }
  });
  
  Model.EventBoardgameList = Backbone.Collection.extend({
    initialize: function() {
      this.bind("reset", function() {
        this.forEach(function(eventGame) {
          var gameid = eventGame.get("boardgame").id;
          var signuplist = new Boardgames.Model.BoardgameSignupList(eventGame.get("signuplist"));
          //signuplist.forEach(function(guest) {
          //  guest.bggid = gameid;
          //});
          signuplist.bggid = gameid; //used for services to create and remove signups
          eventGame.set("signuplist", signuplist);
        }, this);
      }, this);
    },
    model: Model.EventBoardgame,
    url: function() {
      return Model.bgBase + '/events/' + this.eventid + '/boardgames';
    }
  });
  
  Model.BoardgameSignup = Backbone.Model.extend({
    urlRoot: function() {
      return Model.bgBase + '/boardgames/' + this.getBggId() + '/signup';
    },
    getBggId: function() {
      return this.collection.bggid; //set in EventBoardgameList model
    }
  });
  
  Model.BoardgameSignupList = Backbone.Collection.extend({
    model: Model.BoardgameSignup,
    defaults: {
      bggid: 0 //set in EventBoardgameList model
    },
    url: function() {
      return Model.bgBase + '/boardgames/' + this.bggid + '/signup';
    }
  });
  
  Model.BoardgameSearchList = Backbone.Collection.extend({
    model: Model.Boardgame,
    url: Model.bgBase + '/boardgames'
  });
  
  //Model.Boardgame with userid added in
  Model.UserBoardgame = Backbone.Model.extend({
    defaults: {
      userid: null
    },
    urlRoot: function() {
      return Boardgames.Model.bgBase + '/users/' + this.get("userid") + '/boardgames/';
    }
  });
  
  Model.UserBoardgameList = Backbone.Collection.extend({
    url: function() {
      return Model.bgBase + '/users/' + this.userid + '/boardgames';
    },
    model: Model.UserBoardgame,
    initialize: function() {
      this.bind("reset", function() {
        this.forEach(function(game) {
          game.set("userid", this.userid);
        }, this);
      }, this);
    }
  });

});