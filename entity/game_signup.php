<?php 
namespace bg\entity;

/**
 * @Entity
 * @Table(name="game_signup")
 */
class GameSignup {

  /** @Id @Column(name="guest_id") */
  private $guestId;
  public function getGuestId() { return $this->guestId; }
  public function setGuestId($guestId) { $this->guestId = $guestId; }

  /** @Id @Column(name="bgg_id")*/
  private $bggId;
  public function getBggId() { return $this->bggId; }
  public function setBggId($bggId) { $this->bggId = $bggId; }
  
  
}


?>