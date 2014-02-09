<?php
require_once '../env/env.php';
require_once '../vendor/autoload.php';
require_once 'SessionManager.php';
require_once 'AuthMiddleware.php';
require_once 'RestRequest.php';
require_once '../pbj/model/models.php';
require_once '../model/models.php';
require_once '../entity/doctrine.php';

$slim = new \Slim\Slim(array(
    'mode' => 'development',
    'debug' => $ISDEBUG
));

$sessionManager = new SessionManager();

//Checks for a PHP session for every request
$slim->add(new AuthMiddleware());

require_once 'boardgames_api.php';

$slim->run();

?>