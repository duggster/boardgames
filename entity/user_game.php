<?php 
namespace bg\entity;

/**
 * @Entity
 * @Table(name="user_game")
 */
class UserGame {

  /** @Id @Column(name="user_id") */
  private $userId;
  public function getUserId() { return $this->userId; }
  public function setUserId($userId) { $this->userId = $userId; }

  /** @Id @Column(name="bgg_id")*/
  private $bggId;
  public function getBggId() { return $this->bggId; }
  public function setBggId($bggId) { $this->bggId = $bggId; }
  
  
}


?>