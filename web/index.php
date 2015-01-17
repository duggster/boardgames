<?php
require_once "../env/env.php";
?>
<html>
<head>
<title>Boardgames</title>
<link rel="stylesheet" href="<?php echo $PBJ_URL ?>/web/css/pbj.css">
<link rel="stylesheet" href="css/boardgames.css">
<script type="text/javascript">
  //global variable for PBJ location
  var PBJ_URL = "<?php echo $PBJ_URL ?>";
</script>
</head>

<body>
  <div id="messagesRegion"></div>
  <div id="mainRegion"></div>
  
  <script type="text/html" id="template-loading">
    Loading...
  </script>
  
  <script type="text/html" id="template-sessionError">
    There was a problem accessing the logged in user. Make sure you are logged in.
  </script>
  
  <script type="text/html" id="template-gameItemView">
    <div class="gameItem">
      <div class="gameItem-desc" style="">
        <a href="#/game/<%= id %>"><span class="gameTitle"><%= name %></span></a> (<%= year %>)<br/>
        playing time: <%= playingtime %> mins<br/>players: <%= minplayers %> - <%= maxplayers %>
      </div>
      <img src="<%= thumbnail %>"/>
    </div>
  </script>
  
  <script type="text/html" id="template-gameListCompositeView">
    <h2 class="bgtitle">Boardgames</h2> <a href="#/eventSignup">Event Games Signup</a> | <a href="#/searchGames">Add Game to My Collection</a><br/>
    Add or remove games that you own, and other guests will be able to sign up to play them!
    <div class="gameList"></div>
  </script>
  
  <script type="text/html" id="template-addGameView">
    <h2 class="bgtitle">Boardgames</h2> <a href="#/userCollection">Manage My Collection</a> | <a href="#/eventSignup">Event Games Signup</a><br/>
    Add a game to your collection.<br/>
    <input type="text" id="gameSearchField" placeholder="Search for games..."/> <input type="submit" id="submitGameSearchButton" value="Search"></input>
    <br/>
    <div>
      <div id="resultList"></div>
      <div id="resultItem"></div>
    </div>
  </script>
  
  <script type="text/html" id="template-gameSearchList">
    <ul id="gameSearchResultsList"></ul>
  </script>
  
  <script type="text/html" id="template-gameSearchItem">
    <%= name %> (<%= year %>)
  </script>
  
  <script type="text/html" id="template-gameDetailView">
    <div class="gameDetailBackAction"><a href="#" onclick="window.history.back(); return false;">Back</a></div>
    <img src="<%= image %>" class="gameImage"/>
    <div class="gameDetailInfo">
      <span class="gameTitle"><%= name %></span> (<%= year %>)<br/>
      players: <%= minplayers %> - <%= maxplayers %>, playing time: <%= playingtime %> mins<br/>
      View more details at <a href="http://www.boardgamegeek.com/boardgame/<%= id %>" target="_blank">BoardGameGeek</a><br/>
      <%= description %>
    </div>
  </script>
  
  <script type="text/html" id="template-gameItemEdit">
    <div class="gameActions"><a href="#" class="addAction">Add to My Collection</a><a href="#" class="removeAction">Remove from My Collection</a></div>
    <div class="gameItemContainer"></div>
  </script>
  
  <script type="text/html" id="template-eventGameList">
    <h2 class="bgtitle">Boardgames</h2> <a href="#/userCollection">Manage My Collection</a><br/>
    Sign up for a game!
    <div id="eventGameList"></div>
  </script>
  
  <script type="text/html" id="template-eventGameItem">
    <div class="signupListContainer"></div>
    <div class="eventgameinfo"></div>
  </script>
  
  <script type="text/html" id="template-signupItem">
    <%= name %>
  </script>
  
  <script type="text/html" id="template-signupList">
    <div class="signupActionOptions"><a href="#" class="signupaction">Sign Up</a><a href="#" class="removemeaction">Remove Me</a></div>
    <ul class="signupList"></ul>
  </script>

  <link href="js/lib/jquery-ui-1.9.2.custom/css/ui-lightness/jquery-ui-1.9.2.custom.css" rel="stylesheet">
	<script type="text/javascript" src="js/lib/jquery-ui-1.9.2.custom/js/jquery-1.8.3.js"></script>
	<script type="text/javascript" src="js/lib/jquery-ui-1.9.2.custom/js/jquery-ui-1.9.2.custom.js"></script>
  
	<script type="text/javascript" src="js/lib/underscore-1.4.4/underscore.js"></script>
	<script type="text/javascript" src="js/lib/backbone-0.9.10/backbone.js"></script>
  <script type="text/javascript" src="js/lib/backbone.marionette-1.0.0.r6/backbone.marionette.js"></script>
  <script type="text/javascript" src="js/lib/easyXDM-2.4.18.25/easyXDM<?php echo (($ISDEBUG)?".debug":".min"); ?>.js"></script>
  
  <script type="text/javascript" src="js/boardgames.controller.js"></script>
  <script type="text/javascript" src="js/boardgames.model.js"></script>
  <script type="text/javascript" src="js/boardgames.view.js"></script>
  
  <script>
    $(function(){
      // Start the app (defined in js/boardgames.controller.js)
      Boardgames.start();
    });
  </script>
</body>
</html>