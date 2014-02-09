Boardgames.module("View", function(View, App, Backbone, Marionette, $, _){
  View.Loading = Backbone.Marionette.ItemView.extend({
    tagName: "div",
    template: "#template-loading"
  });
  
  View.SessionError = Backbone.Marionette.ItemView.extend({
    tagName: "div",
    template: "#template-sessionError"
  });
  
  View.GameItemView = Backbone.Marionette.ItemView.extend({
    tagName : 'div',
    template : "#template-gameItemView",
    initialize: function() {
      this.model.on("change", function() {
        this.render();
      }, this);
    },
    onRender: function() {
    }
  });
  
  View.GameItemEditView = Backbone.Marionette.Layout.extend({
    template: "#template-gameItemEdit",
    regions: {
      gameItem: ".gameItemContainer"
    },
    events: {
      "click .addAction": "addGame",
      "click .removeAction": "removeGame"
    },
    attributes: {
      class: "gameListItem"
    },
    onRender: function() {
      var itemView = new Boardgames.View.GameItemView({
        model: this.model
      });
      this.$('.removeAction').hide();
      this.$('.addAction').hide();
      var existsInCollection = Boardgames.userCollection.find(function(game) {
        return game.get("id") == this.model.get("id");
      }, this);
      if (existsInCollection) {
        this.$('.removeAction').show();
      }
      else {
        this.$('.addAction').show();
      }
      this.gameItem.show(itemView);
    },
    addGame: function(e) {
      e.preventDefault();
      var self = this;
      Boardgames.PBJ.infoBegin("addgame", "Adding game...");
      Boardgames.userCollection.create(this.model, {
        type: 'post', 
        wait:true,
        success: function() {
          self.render();
          Boardgames.PBJ.infoEnd("addgame", "Game added.");
        },
        error: function() {
          Boardgames.PBJ.errorEnd("addgame", "Error adding game.");
        }
      });
    },
    removeGame: function(e) {
      e.preventDefault();
      var self = this;
      if (this.model.get("userid")) {
        Boardgames.PBJ.infoBegin("removegame", "Removing game...");
        this.model.destroy({
          success: function() {
            Boardgames.userCollection.remove(self.model);
            self.render();
            Boardgames.PBJ.infoEnd("removegame", "Game removed.");
          },
          error: function() {
            Boardgames.PBJ.errorEnd("removegame", "Error removing game.");
          }
        });
      }
    }
  });

  View.GameListView = Backbone.Marionette.CompositeView.extend({
    template : "#template-gameListCompositeView",
    itemView : View.GameItemEditView,
    itemViewContainer : '.gameList'
  });
  
  View.GameDetailView = Backbone.Marionette.ItemView.extend({
    template: "#template-gameDetailView"
  });
  
  View.AddGameView = Backbone.Marionette.Layout.extend({
    template: "#template-addGameView",
    regions: {
      resultList: "#resultList",
      resultItem: "#resultItem"
    },
    events: {
      "click #submitGameSearchButton": "submitSearchClick",
      "keydown #gameSearchField": "onKeyDownSearch"
    },
    resultSelected: null,
    onKeyDownSearch: function(e) {
      if (e.keyCode == 13) { //Enter key
        this.submitSearchClick();
      }
    },
    submitSearchClick: function() {
      var name = this.$('#gameSearchField').val();
      name = encodeURIComponent(name);
      //Every search can be bookmarked, or accessed through back button if we save the search in the query string and use navigation
      Backbone.history.navigate("searchGames?search=" + name, true);
    },
    submitSearch: function(name) {
      var self = this;
      this.$('#gameSearchField').val(name);
      this.$('#gameSearchField').focus();
      var results = new Boardgames.Model.BoardgameSearchList();
      
      //Show the results list
      var resultsView = new Boardgames.View.GameSearchListView({
        collection: results
      });
      Boardgames.PBJ.infoBegin("searchgame", "Searching...");
      results.fetch({
        data: $.param({name: name}),
        success: function(coll, resp, opt) {
          Boardgames.PBJ.infoEnd("searchgame", "Search complete.");
        },
        error: function() {
          Boardgames.PBJ.errorEnd("searchgame", "Error searching.");
        }
      });
      this.resultList.show(resultsView);
      
      //Select a game from the results list
      results.on("addGame:select", function(model, el) {
        if (this.resultSelected) {
          this.resultSelected.removeClass('selected');
        }
        this.resultSelected = el;
        this.resultSelected.addClass('selected');
        var selectedGame = null;
        if (Boardgames.userSession.isInit && Boardgames.userCollection.isInit) {
          selectedGame = Boardgames.userCollection.find(function(game) {
            return game.id == model.id;
          });
        }
        if (!selectedGame) {
          selectedGame = new Boardgames.Model.Boardgame();
          selectedGame.set("id", model.get("id"));
          Boardgames.PBJ.infoBegin("gameselect", "Loading game...");
          selectedGame.fetch({
            success: function(obj) {
              //Convert from Boardgame to UserBoardgame
              selectedGame = new Boardgames.Model.UserBoardgame(obj.toJSON());
              selectedGame.set("userid", Boardgames.userSession.get("user").id);
              self.showResultItem(selectedGame);
              Boardgames.PBJ.infoEnd("gameselect", "Game loaded.");
            },
            error: function() {
              Boardgames.PBJ.errorEnd("gameselect", "Error loading game.");
            }
          });
        }
        else {
          this.showResultItem(selectedGame);
        }
      }, this);
    },
    showResultItem: function(selectedGame) {
      var itemView = new Boardgames.View.GameItemEditView({
        model: selectedGame
      });
      this.resultItem.show(itemView);
    }
  });
  
  View.GameSearchItemView = Backbone.Marionette.ItemView.extend({
    tagName : 'li',
    template: "#template-gameSearchItem",
    events: {
      "click" : "clickResultItem"
    },
    clickResultItem: function(e) {
      var li = $(e.target).parent('li').andSelf();
      this.model.collection.trigger("addGame:select", this.model, li);
    }
  });
  
  View.GameSearchListView = Backbone.Marionette.CompositeView.extend({
    template: "#template-gameSearchList",
    itemView: View.GameSearchItemView,
    itemViewContainer: "#gameSearchResultsList"
  });
  
  View.EventGameItemView = Backbone.Marionette.Layout.extend({
    template: "#template-eventGameItem",
    regions: {
      signuplist: ".signupListContainer",
      game: ".eventgameinfo"
    },
    attributes: {
      class: "gameListItem"
    },
    onRender: function() {
      var boardgame = new Boardgames.Model.Boardgame(this.model.get("boardgame"));
      var itemView = new Boardgames.View.GameItemView({
        model: boardgame
      });
      this.game.show(itemView);
      
      var signuplist = this.model.get("signuplist");
      var signuplistview = new Boardgames.View.SignupListView({
        collection: signuplist
      });
      this.signuplist.show(signuplistview);
    }
  });
  
  View.EventGameListView = Backbone.Marionette.CompositeView.extend({
    template: "#template-eventGameList",
    itemView: View.EventGameItemView,
    itemViewContainer: "#eventGameList",
    onRender: function() {
      
    }
  });
  
  View.SignupItemView = Backbone.Marionette.ItemView.extend({
    template: "#template-signupItem",
    tagName: "li",
    onRender: function() {
      if (this.model.get("id") == Boardgames.guest.get("id")) {
        this.$el.addClass("currentGuestSignup");
      }
    }
  });
  
  View.SignupListView = Backbone.Marionette.CompositeView.extend({
    template: "#template-signupList",
    itemView: View.SignupItemView,
    itemViewContainer: ".signupList",
    events: {
      "click .signupaction": "signUp",
      "click .removemeaction": "removeMe"
    },
    onRender: function() {
      this.$('.removemeaction').hide();
      this.$('.signupaction').hide();
      if (this.collection.find(function(item) {
        return item.get("id") == Boardgames.guest.get("id");
      })) {
        this.$('.removemeaction').show();
      }
      else {
        this.$('.signupaction').show();
      }
    },
    signUp: function(e) {
      e.preventDefault();
      var self = this;
      var signup = new Boardgames.Model.BoardgameSignup(Boardgames.guest.toJSON());
      Boardgames.PBJ.infoBegin("gamesignup", "Signing up...");
      this.collection.create(signup, {
        type: 'post', 
        wait:true,
        success: function() {
          console.log("SAVED:", signup);
          self.render();
          Boardgames.PBJ.infoEnd("gamesignup", "Signed up.");
        },
        error: function() {
          Boardgames.PBJ.errorEnd("gamesignup", "Error signing up.");
        }
      });
    },
    removeMe: function(e) {
      e.preventDefault();
      var self = this;
      var signup = this.collection.find(function(item) {
        return item.get("id") == Boardgames.guest.get("id");
      });
      
      if (signup) {
        Boardgames.PBJ.infoBegin("gamesignupremove", "Removing signup...");
        signup.destroy({
          success: function() {
            self.collection.remove(signup);
            self.render();
            Boardgames.PBJ.infoEnd("gamesignupremove", "Signup removed.");
          },
          error: function() {
            Boardgames.PBJ.errorEnd("gamesignupremove", "Error removing signup.");
          }
        });
      }
    }
  });
  
  
});