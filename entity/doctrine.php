<?php
require_once '../env/env.php';
require_once '../vendor/autoload.php';
require_once 'user_game.php';
require_once 'game_signup.php';

use Doctrine\ORM\Tools\Setup;
use Doctrine\ORM\EntityManager;

$paths = array("../entity");

$config = Setup::createAnnotationMetadataConfiguration($paths, $DOCTRINE_DEVMODE);
$namingStrategy = new \Doctrine\ORM\Mapping\UnderscoreNamingStrategy(CASE_LOWER);
$config->setNamingStrategy($namingStrategy);

$config->setAutoGenerateProxyClasses(TRUE);

$em = EntityManager::create($DOCTRINE_DBPARAMS, $config);

function getEntityManager() {
  global $em;
  return $em;
}

