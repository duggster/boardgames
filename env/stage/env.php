<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
date_default_timezone_set("America/New_York");

$ISDEBUG = true;

//Doctrine ORM Parameters
$DOCTRINE_DEVMODE = $ISDEBUG;
$DOCTRINE_DBPARAMS = array(
    'driver'   => 'pdo_mysql',
    'host'     => '127.8.179.130',
    'user'     => 'pbj_bg', //adminU85fWnB
    'password' => 'pbj_bg', //RsWX_kLIF7lW
    'dbname'   => 'pbj_boardgames' //boardgames
);

//Path to PBJ for service calls
$PBJ_URL = "http://pbj-local";

//BoardgameGeek URL
$BGG_URL = 'http://www.boardgamegeek.com/xmlapi';
//$BGG_URL = 'http://localhost/bggmock/slim.php';

?>