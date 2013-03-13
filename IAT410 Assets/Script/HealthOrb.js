/**********************************************************************************************************************************
	
	HealthOrb.js
	Behaviour necessary to handle health pickups.
	
**********************************************************************************************************************************/

/*******************************************
	Variables
********************************************/


// Public Vars
public var healthBoost:float = 20;			// How much to boost health by
public var triggerDist:float = 20;			// Distance before pickup is done

// Private Vars
private var _player:GameObject;							// Player Game Object
private var _playerCE:CombatEngine;						// Player Combat Engine


/*******************************************
	Engine Methods
********************************************/

// Do at code load
function Awake() {
	_player = GameObject.FindGameObjectWithTag("Player");	// Store reference to Player Game Object
	_playerCE = _player.GetComponent("CombatEngine");		// Store reference to Player CombatEngine
}


// Do every frame
function Update() {
	// Check if player is near to orb, if yes add a health boost
	if (DistanceToPlayer() < triggerDist) {
		_playerCE.AdjustHealth(healthBoost);
		Destroy(this.gameObject);
	}
}


/*******************************************
	Helper Methods
********************************************/
function DistanceToPlayer():float {
	return Vector3.Distance(_player.transform.position, transform.position);
} 