<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
date_default_timezone_set("America/New_York");

$ISDEBUG = true;

//Doctrine ORM Parameters
$DOCTRINE_DEVMODE = $ISDEBUG;
$DOCTRINE_DBPARAMS = array(
    'driver'   => 'pdo_mysql',
    'user'     => 'pbj_bg',
    'password' => 'pbj_bg',
    'dbname'   => 'pbj_boardgames'
);

//Path to PBJ for service calls
$PBJ_URL = "http://localhost/pbj";

//BoardgameGeek URL
$BGG_URL = 'http://www.boardgamegeek.com/xmlapi';
//$BGG_URL = 'http://localhost/bggmock/slim.php';

?>