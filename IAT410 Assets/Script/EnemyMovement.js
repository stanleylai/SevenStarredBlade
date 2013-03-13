/**********************************************************************************************************************************
	
	EnemyMovement.js
	Basic movement AI for Enemy NPCs
	
**********************************************************************************************************************************/
@script RequireComponent (MovementEngine);


/*******************************************
	Variables
********************************************/


// Public Vars
public var chaseDist:float = 400;		// Dist before enemy starts chasing player
public var attackDist:float = 20;		// Dist before enemy stops chase, and attacks player
public var charDummy:GameObject;		// Dummy GameObject that holds animation clips
public var lockedZ:float = 70;			// Locked Z value

// Private Vars
private var _player:GameObject;			// Var to hold reference to Player's GameObject
public var _playerDist:float;			// Distance from Player avatar. Public for debug preview.
private var _ce:CombatEngine;			// Avatar's combat engine

// Audio System Vars
private var _audio:AudioSource;
private var _newClip:boolean;							// Check if a new clip is available to be played
private var _currentClip:String;						// Current clip to be played
public static var PUNCH:String = "PUNCH";

public var punchAudio:AudioClip;


/*******************************************
	Engine Methods
********************************************/


// Do at script start
function Awake() {
	_ce = GetComponent("CombatEngine");
	_audio = GetComponent("AudioSource");
}

// Do at initial start of script
function Start() {
	_player = GameObject.FindGameObjectWithTag("Player");
	
	// set animation wrap modes for enemy avatar
	charDummy.animation["idle"].wrapMode = WrapMode.Loop;
	charDummy.animation["run-cycle"].wrapMode = WrapMode.Loop;
	charDummy.animation["run-end"].wrapMode = WrapMode.Once;
	charDummy.animation["run-start"].wrapMode = WrapMode.Once;
	charDummy.animation["hit"].wrapMode = WrapMode.Once;
	charDummy.animation["attack-melee1"].wrapMode = WrapMode.Once;
	charDummy.animation["attack-melee2"].wrapMode = WrapMode.Once;
	//charDummy.animation["attack-ranged"].wrapMode = WrapMode.Once;
	charDummy.animation["death"].wrapMode = WrapMode.ClampForever;
	
	// set initial attack animation speeds
	charDummy.animation["attack-melee1"].speed = 1.5;
	charDummy.animation["attack-melee2"].speed = 1.5;
	
	// prioritize attack animations
	charDummy.animation["attack-melee1"].layer = 2;
	charDummy.animation["attack-melee2"].layer = 2;
	
	// prioritize death animations
	charDummy.animation["death"].layer = 3;
}

// Run once every frame
function Update () {
	
	transform.position.z = lockedZ;
	
	if (_ce.IsAlive()) {
		// Calculate distance of player from Enemy avatar
		_playerDist = DistanceToPlayer();
		
		// If player within chase parameters
		// ie. within chaseDist, further out then attackDist
		if (_playerDist < chaseDist && _playerDist > attackDist) {
			
			// figure out which direction to run
			if (PlayerToTheRight()) {
				// Player is to the right, run right
				SendMessage("MoveMeForward", -1);
			
			} else if (!PlayerToTheRight()) {
				// Player is to the left, run left
				SendMessage("MoveMeForward", 1);
			}
			 
		} else {
			SendMessage("MoveMeForward", 0);
		}
	}
	
	// Audio System
	if (_newClip) {
		switch(_currentClip) {
			case PUNCH:
				_audio.clip = punchAudio;
				break;
		}
		
		WaitAndPlay(0.35);
		_newClip = false;
		
		Debug.Log("Enemy Audio Played: " + _currentClip);
		
		/*
		if (_currentClip == WALK && !_audio.isPlaying) {
			_audio.Play();
		} else if (_currentClip != WALK) {
			_audio.Play();
		}
		*/
	}
}


/*******************************************
	Animation Methods
********************************************/


// Play Attack One animation
function AnimateBasicAttack():void {
	charDummy.animation.CrossFade("attack-melee1", 0.1);
	SetNewClip(PUNCH);
}

// Play Death animation
function AnimateDeath():void {
	charDummy.animation.Play("death");
}

// Play Hit animation (avatar has taken damage)
function AnimateHit():void {
	charDummy.animation.CrossFade("hit", 0.1);
}

function AnimateRunCycle():void {
	charDummy.animation.CrossFade("run-cycle", 0.2);
	//SetNewClip(WALK);
}


/*******************************************
	Helper Methods
********************************************/


// Check if Player avatar is to the right
function PlayerToTheRight():boolean {
	if (_player.transform.position.x < transform.position.x) {
		return true;
	} else {
		return false;
	}
}

// calculate distance between player and current enemy avatar
function DistanceToPlayer():float {
	return Vector3.Distance(_player.transform.position, transform.position);
}

// Set new Audio clip to be played
function SetNewClip(str:String):void {
	_currentClip = str;
	_newClip = true;
}

// Wait for amount of time
function WaitAndPlay(t:float) {
	yield WaitForSeconds(t);
	_audio.Play();
}