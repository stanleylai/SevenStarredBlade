/**********************************************************************************************************************************
	
	EndGameTrigger.js
	Behaviour necessary to check if end game should be triggered, and what to do next
	
**********************************************************************************************************************************/


/*******************************************
	Variables
********************************************/

// Public Vars
public var triggerDist:float = 10;						// Distance before triggering end game

// Private Vars
private var _player:GameObject;							// Player Game Object
private var _playerME:MovementEngine;					// Player's Movement Engine
private var _boss:GameObject;							// Boss
private var _camera:GameObject;							// Game Camera


/*******************************************
	Engine Methods
********************************************/

// Do at code load
function Awake():void {
	_player = GameObject.FindGameObjectWithTag("Player");	// Store reference to Player Game Object
	_playerME = _player.GetComponent("MovementEngine");		// Store refernece to Player MovementEngine
	_boss = GameObject.Find("Boss");
	_camera = GameObject.FindGameObjectWithTag("MainCamera");
}

// Do at every frame
function Update () {
	/*
	if (DistanceToPlayer() < triggerDist) {
		_playerME.SetEndGame();
		_boss.GetComponent("BossEngine").RunNow();
		_camera.GetComponent("CameraSmoothFollow").SetEndGame();
	}
	*/
	
	if (_player.transform.position.x < transform.position.x) {
		_playerME.SetEndGame();
		_boss.GetComponent("BossEngine").RunNow();
		_camera.GetComponent("CameraSmoothFollow").SetEndGame();
	}
}


/*******************************************
	Helper Methods
********************************************/

// return how far this object is from the player
function DistanceToPlayer():float {
	return Vector3.Distance(_player.transform.position, transform.position);
}