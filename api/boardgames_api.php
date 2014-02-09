<?php
use pbj\model\v1_0 as pbj;

$slim->get('/events/:eventid/boardgames', function($eventid) {
  global $slim;
  $games = array();
  $response = executePbj("GET", "/events/$eventid/guests");
  if ($response != NULL) {
    $objs = json_decode($response);
    $em = \getEntityManager();
    $userids = array();
    $guests = array();
    foreach($objs as $obj) {
      $guest = pbj\Guest::createFromAnonObject($obj);
      if ($guest->status == "in") {
        $userids[] = $guest->userid;
        $guests[] = $guest;
      }
    }
    $userids = implode(',', $userids);
    $userGames = $em->createQuery("SELECT ug FROM bg\entity\UserGame ug WHERE ug.userId IN ($userids)")->getResult();
    $gameids = array();
    foreach($userGames as $userGame) {
      $gameids[] = $userGame->getBggId();
    }
    $games = getBoardgamesByIds($gameids);
    
    $eventGames = array();
    foreach($games as $game) {
      $eventGame = new bg\Model\EventBoardgame();
      $eventGame->boardgame = $game;
      $eventGame->signuplist = array();
      
      $bggid = $game->id;
      $guestids = $em->createQuery("SELECT gs.guestId FROM bg\entity\GameSignup gs WHERE gs.bggId = $bggid")->getResult();
      if ($guestids != NULL && sizeof($guestids) > 0) {
        foreach($guestids as $guestid) {
          $guestid = $guestid["guestId"];
          foreach($guests as $guest) {
            if ($guestid == $guest->id) {
              $eventGame->signuplist[] = $guest;
            }
          }
        }
      }
      $eventGames[] = $eventGame;
    }
  }
  $resp = $slim->response();
  $resp['Content-Type'] = 'application/json';
  echo json_encode($eventGames);
})->name('GET-boardgames');

$slim->post('/boardgames/:bggid/signup/:guestid', function($bggid, $guestid) {
  
  //TODO: verify session belongs to userid
  
  $em = \getEntityManager();
  $signup = new \bg\entity\GameSignup();
  $signup->setBggId($bggid);
  $signup->setGuestId($guestid);
  
  $em->persist($signup);
  $em->flush();
});

$slim->delete('/boardgames/:bggid/signup/:guestid', function($bggid, $guestid) {
  
  //TODO: verify session belongs to userid
  
  $em = \getEntityManager();
  $signup = $em->createQuery("SELECT gs FROM bg\entity\GameSignup gs WHERE gs.guestId = $guestid AND gs.bggId = $bggid")->getOneOrNullResult();
  if ($signup != NULL) {
    $em->remove($signup);
    $em->flush();
  }
});

$slim->get('/boardgames', function() {
  $games = array();
  global $slim;
  $params = $slim->request()->get();
  if (isset($params['name'])) {
    $namequery = $params['name'];
    $namequery = urlencode($namequery);
    $url = "/search?search=$namequery";
    $xml = getBgg($url);
    $boardgamesxml = new SimpleXMLElement($xml);
    $boardgamesarr = $boardgamesxml->xpath("boardgame");
    foreach($boardgamesarr as $boardgamexml) {
      $boardgame = readBggBoardgame($boardgamexml);
      $games[] = $boardgame;
    }
  }
  $resp = $slim->response();
  $resp['Content-Type'] = 'application/json';
  echo  json_encode($games);
});

$slim->get('/boardgames/:bggid', function($bggid) {
  $game = null;
  $gameids = array();
  $gameids[] = $bggid;
  $games = getBoardgamesByIds($gameids);
  if ($games != NULL && sizeof($games) == 1) {
    $game = $games[0];
  }
  global $slim;
  $resp = $slim->response();
  $resp['Content-Type'] = 'application/json';
  echo  json_encode($game);
});

$slim->get('/users/:userid/boardgames', function($userid) {
  $em = \getEntityManager();
  $userGames = $em->createQuery("SELECT ug FROM bg\entity\UserGame ug WHERE ug.userId = $userid")->getResult();
  $gameids = array();
  foreach($userGames as $userGame) {
    $gameids[] = $userGame->getBggId();
  }
  $games = getBoardgamesByIds($gameids);
  global $slim;
  $resp = $slim->response();
  $resp['Content-Type'] = 'application/json';
  echo  json_encode($games);
});

$slim->post('/users/:userid/boardgames/:bggid', function($userid, $bggid) {
  
  //TODO: verify session belongs to userid
  
  $em = \getEntityManager();
  $userGame = new \bg\entity\UserGame();
  $userGame->setUserId($userid);
  $userGame->setBggId($bggid);
  
  $em->persist($userGame);
  $em->flush();
});

$slim->delete('/users/:userid/boardgames/:bggid', function($userid, $bggid) {
  
  //TODO: verify session belongs to userid
  
  $em = \getEntityManager();
  $userGame = $em->createQuery("SELECT ug FROM bg\entity\UserGame ug WHERE ug.userId = $userid AND ug.bggId = $bggid")->getOneOrNullResult();
  if ($userGame != NULL) {
    $em->remove($userGame);
    $em->flush();
  }
});

function getBoardgamesByIds($bggIds) {
  $games = array();
  if ($bggIds != null && sizeof($bggIds) > 0) {
    $ids = implode(',', $bggIds);
    $xml = getBgg("/boardgame/$ids");
    $boardgamesxml = null;
    try {
      $boardgamesxml = new SimpleXMLElement($xml);
    } catch(Exception $e) {
      //echo $e;
      //Log this...
    }
    if ($boardgamesxml != null) {
      foreach($bggIds as $bggId) {
        $boardgamexml = $boardgamesxml->xpath("boardgame[@objectid=$bggId]");
        if ($boardgamexml != NULL && sizeof($boardgamexml) >= 1) {
          $boardgamexml = $boardgamexml[0];
          $boardgame = readBggBoardgame($boardgamexml);
          $games[] = $boardgame;
        }
      }
    }
  }
  return $games;
}

function readBggBoardgame($boardgamexml) {
  $boardgame = new bg\model\Boardgame();
  $boardgame->id = (string)$boardgamexml['objectid'];
  $namexml = $boardgamexml->xpath("name[@primary='true']");
  list( , $name) = each($namexml);
  $boardgame->name = (string)$name;
  $boardgame->year = (string)$boardgamexml->yearpublished;
  $boardgame->minplayers = (int)$boardgamexml->minplayers;
  $boardgame->maxplayers = (int)$boardgamexml->maxplayers;
  $boardgame->playingtime = (string)$boardgamexml->playingtime;
  $boardgame->age = (string)$boardgamexml->age;
  $boardgame->description = (string)$boardgamexml->description;
  $boardgame->thumbnail = (string)$boardgamexml->thumbnail;
  $boardgame->image = (string)$boardgamexml->image;
  return $boardgame;
}

function executePbj($method, $url) {
  $response = NULL;
  global $PBJ_URL, $sessionManager;
  $sessionId = $sessionManager->getUserSession()->id;
  
  $headers = array();
  $headers["Cookie"] = "PHPSESSID=$sessionId";
  $request = new RestRequest($PBJ_URL . '/api/slim.php' . $url, $method, $headers);
  $request->execute();
  $responseInfo = $request->getResponseInfo();
  $responseCode = $responseInfo["http_code"];
  if ($responseCode == 200) {
    $response = $request->getResponseBody();
  }
  else {
    //HANDLE ERROR
    global $slim;
    $slim->response()->status($responseCode);
    var_dump($request);
  }
  return $response;
}

function getBgg($url) {
  $bgg = null;
  global $BGG_URL;
  $url = $BGG_URL . $url;
  $request = new RestRequest($url, 'GET');
  $request->execute();
  $responseInfo = $request->getResponseInfo();
  $responseCode = $responseInfo["http_code"];
  if ($responseCode == 200) {
    $bgg = $request->getResponseBody();
  }
  else {
    //var_dump($request);
    //LOG THIS
  }
  
  return $bgg;
}

?>