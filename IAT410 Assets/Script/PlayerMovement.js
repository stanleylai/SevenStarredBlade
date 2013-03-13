/**********************************************************************************************************************************
	
	PlayerMovement.js
	Collects player input, to allow avatar movement
	
**********************************************************************************************************************************/
@script RequireComponent (MovementEngine);
@script RequireComponent (CombatEngine);


/*******************************************
	Variables
********************************************/


// Public Vars
public var charDummy:GameObject;						// Dummy that holds animation clips
public var defaultAttackAnimSpeed:float = 1.5;			// Default animation speed for attack animations

// Private Vars
private var _ce:CombatEngine;
private var _me:MovementEngine;

// Audio System Vars
private var _audio:AudioSource;
private var _newClip:boolean;							// Check if a new clip is available to be played
private var _currentClip:String;						// Current clip to be played
public static var SLASH:String = "STAB";
public static var SLASH_HIT:String = "STAB_HIT";
public static var STAB:String = "STAB";
public static var STAB_CHARGE:String = "STAB_CHARGE";
public static var STAB_HIT:String = "STAB_HIT";
public static var HEAL:String = "HEAL";
public static var WALK:String = "WALK";

public var slashAudio:AudioClip;
public var slashHitAudio:AudioClip;
public var stabAudio:AudioClip;
public var stabChargeAudio:AudioClip;
public var stabHitAudio:AudioClip;
public var healAudio:AudioClip;
public var walkingAudio:AudioClip;


/*******************************************
	Engine Methods
********************************************/


// Do at script start
// Init basic variables
function Awake() {
	_ce = GetComponent("CombatEngine");
	_me = GetComponent("MovementEngine");
	_audio = GetComponent("AudioSource");
}

// Do at initial start of script
function Start() {
	// set animation wrap modes for player avatar
	charDummy.animation["death"].wrapMode = WrapMode.ClampForever;
	charDummy.animation["hit"].wrapMode = WrapMode.Once;
	charDummy.animation["idle"].wrapMode = WrapMode.Loop;
	charDummy.animation["jump-flight"].wrapMode = WrapMode.ClampForever;
	charDummy.animation["jump-land"].wrapMode = WrapMode.Once;
	charDummy.animation["jump-start"].wrapMode = WrapMode.ClampForever;
	charDummy.animation["run-cycle"].wrapMode = WrapMode.Loop;
	charDummy.animation["run-end"].wrapMode = WrapMode.Once;
	charDummy.animation["run-start"].wrapMode = WrapMode.Once;
	charDummy.animation["slash1"].wrapMode = WrapMode.Once;
	charDummy.animation["slash2"].wrapMode = WrapMode.Once;
	charDummy.animation["thrust-release"].wrapMode = WrapMode.Once;
	charDummy.animation["thrust-out"].wrapMode = WrapMode.Once;
	charDummy.animation["thrust-windup"].wrapMode = WrapMode.ClampForever;
	
	// set initial animation speeds
	charDummy.animation["slash1"].speed = defaultAttackAnimSpeed;
	charDummy.animation["thrust-release"].speed = defaultAttackAnimSpeed;
	charDummy.animation["thrust-windup"].speed = defaultAttackAnimSpeed;
	
	// place jump animations on a higher layer > take priority over running
	charDummy.animation["jump-start"].layer = 1;
	charDummy.animation["jump-land"].layer = 1;
	
	// prioritize attack animations
	charDummy.animation["slash1"].layer = 2;
	charDummy.animation["thrust-release"].layer = 2;
	charDummy.animation["thrust-windup"].layer = 2;
	
	// prioritize hit animation
	charDummy.animation["hit"].layer = 10;
	
	// prioritize attack animations
	charDummy.animation["death"].layer = 3;
}

function Update () {
	if (_ce.IsAlive()) {
		// Control Forward Movement
		_me.MoveMeForward(Input.GetAxis("Forward"));
	}
	
	if(_ce.IsAlive() && Input.GetButtonDown("Jump")) {
		_me.JumpMe();
	}
	
	// Audio System
	if (_newClip) {
		switch(_currentClip) {
			case SLASH:
				_audio.clip = slashAudio;
				break;
			case SLASH_HIT:
				_audio.clip = slashHitAudio;
				break;
			case STAB:
				_audio.clip = stabAudio;
				break;
			case STAB_CHARGE:
				_audio.clip = stabChargeAudio;
				break;
			case STAB_HIT:
				_audio.clip = stabHitAudio;
				break;
			case HEAL:
				_audio.clip = healAudio;
				break;
			case WALK:
				_audio.clip = walkingAudio;
				break;
		}
		
		/*
		if (_currentClip == WALK && !_audio.isPlaying) {
			_audio.Play();
		} else if (_currentClip != WALK) {
			_audio.Play();
		}
		*/
		if (_currentClip == STAB_CHARGE && !_audio.isPlaying) {
			_audio.Play();
		} else if (_currentClip != STAB_CHARGE) {
			_audio.Play();
		}
		
		_newClip = false;
		Debug.Log("Audio Played: " + _currentClip);
	}
}


/*******************************************
	Animation Methods
********************************************/


// Play Attack Two attack animation (thrust)
function AnimateThrustRelease():void {
	// play Attack Two thrust attack animation
	charDummy.animation.CrossFade("thrust-release", 0.1);
	SetNewClip(STAB);
}

// Play Attack Two charge up animation
function AnimateThrustWindup():void {
	charDummy.animation.CrossFade("thrust-windup", 0.1);
	SetNewClip(STAB_CHARGE);
}

// Play Death animation
function AnimateDeath():void {
	charDummy.animation.Play("death");
}

// Play Hit animation (avatar has taken damage)
function AnimateHit():void {
	charDummy.animation.CrossFade("hit", 0.1);
}

// Animate basic attack
function AnimateBasicAttack():void {
	charDummy.animation.CrossFade("slash1", 0.1);
	SetNewClip(SLASH);
}

// Animate walking
function AnimateRunCycle():void {
	charDummy.animation.CrossFade("run-cycle", 0.2);
	//SetNewClip(WALK);
}

// Play Walk sounds
function PlayWalkAudio():void {
	//SetNewClip(WALK);
}

/*******************************************
	Helper/Getter/Setter Methods
********************************************/


// Apply modifier to Player attack animation
function ApplyAnimModifier(m:float):void {
	charDummy.animation["slash1"].speed *= m;
	charDummy.animation["thrust-release"].speed *= m;
	charDummy.animation["thrust-windup"].speed *= m;
}

// Reset modifier to Player attack animation
function ResetAnimModifier():void {
	charDummy.animation["slash1"].speed = defaultAttackAnimSpeed;
	charDummy.animation["thrust-release"].speed = defaultAttackAnimSpeed;
	charDummy.animation["thrust-windup"].speed = defaultAttackAnimSpeed;
}

// Set new Audio clip to be played
function SetNewClip(str:String):void {
	_currentClip = str;
	_newClip = true;
}