/**********************************************************************************************************************************
	
	MovementEngine.js
	Methods to allow physical control of character in game space
	Requires CharacterController
	
**********************************************************************************************************************************/
@script RequireComponent (CharacterController);
@script RequireComponent (CombatEngine);


/*******************************************
	Variables
********************************************/


public var walkSpeed:float = 80;					// Walking speed of avatar
public var runMultipler:float = 1.5;				// How much faster will avatar be moving if he is running?
public var airMoveMultiplier:float = 0.6;			// How much faster/slower will avatar move if he is in the air?
public var jumpHeight:float = 140;					// How high will he jump?
public var doubleJumpHeight:float = 60;				// How much to jump by if double jumping
public var jumpCooldown:float = 0.5;				// Cooldown before next jump is allowed
public var gravity:float = 250;						// How much gravity to apply

public var charDummy:GameObject;					// Var to hold value of animation dummy

private var _doubleJumped:boolean;					// Is avatar double jumping right now?
private var _jumpTimer:float = 0;					// Timer to store current cooldown for jump
private var _isJumping:boolean;						// Did character already jump?
private var _jumpCooling:boolean;					// Is character's jump still cooling?
private var _jumpCooldownClock:float;				// What is the current clock count on the jump cooldown
private var _collisionFlags:CollisionFlags;			// Current flags for collisions
private var _moveDirection:Vector3;					// Store which direction avatar should be moving. x should be 1 for right, -1 for left
private var _thisTransform:Transform;				// Transform component for this avatar
private var _controller:CharacterController;		// Character Controller for this avatar
private var _facing:Quaternion;						// Where should character be facing?
													// Quaternion.Euler(0,90,0); for left, 270 for right
private var _isFacingRight:boolean;					// Is avatar facing direction right? to allow other methods to query current facing
private var _endGame:boolean = false;				// Are we in the end game state? ie. Boss animation playing etc.

static var FACE_RIGHT:Quaternion = Quaternion.Euler(0,270,0);		// Preset rotation to face right
static var FACE_LEFT:Quaternion = Quaternion.Euler(0,90,0);			// Preset rotation to face left

private var _ce:CombatEngine;						// Link to this avatar's Combat Engine


/*******************************************
	Engine Methods
********************************************/


// Do at script start
// Init basic variables
function Awake() {
	_thisTransform = transform;
	_controller = GetComponent(CharacterController);
	_ce = GetComponent("CombatEngine");
	
	_doubleJumped = false;
	_isJumping = false;
	_jumpCooling = false;
	
	_facing = new Quaternion(0, 0, 0, 0);		// set initial blank value
}


// Do at initial start of script
function Start() {
	// init _moveDirection vaue
	_moveDirection = new Vector3(0, 0, 0);
}

// Do every frame
function Update () {
	// Reset Z position
	transform.position.z = 50;
		
	// Apply gravity to character
	_moveDirection.y -= gravity * Time.deltaTime;
		
	// Apply _moveDirection vectors to character
	_collisionFlags = _controller.Move(_moveDirection * Time.deltaTime);
		
	// Set facing
	charDummy.transform.rotation = _facing;
		
	// Check if character should have any horizontal velocity at all
	// for example, avatar is dead or shouldn't move for any reason
	if (!_ce.IsAlive() || !ShouldMove()) {
		MoveMeForward(0);
	}
}


/*******************************************
	Movement Methods
********************************************/


// Handle Notification Calls from specific controllers
function MoveMeForward(i:float):void {
	if (_controller.isGrounded) {
		// Basic X-axis movement
		
		/*
		if (i != 0) {
			SendMessage("PlayWalkAudio");
		}
		*/
		
		if (_ce.IsAlive() && ShouldMove()) {
			_moveDirection = new Vector3(i, 0, 0);
		} else {
			_moveDirection = new Vector3(0, 0, 0);
		}
		_moveDirection = _thisTransform.TransformDirection(_moveDirection);
	
		if (Input.GetButton("Run")) {
			// If "running", apply run multiplier
			_moveDirection *= walkSpeed * runMultipler;
			//charDummy.animation.CrossFade("run-cycle", 0.2);
			SendMessage("AnimateRunCycle");
		} else {
			// else walk normally
			_moveDirection *= walkSpeed;
			//charDummy.animation.CrossFade("run-cycle", 0.2);
			SendMessage("AnimateRunCycle");
		}
	} else {
		// if avatar is in the air, apply horz movement without resetting y axis
		// and apply multiplier to affect moving while in the air
		_moveDirection.x = i * walkSpeed * airMoveMultiplier;
	}
	
	// if not moving, go to idle animation
	if (_moveDirection.x == 0)
		charDummy.animation.Play("idle");
	
	// if done jumping, play jump landing animation
	if (_controller.isGrounded && _isJumping) {
		charDummy.animation.CrossFade("jump-land", 0.2);
		_isJumping = false;
		_doubleJumped = false;
		_jumpCooling = true;
	}
	
	// if heading left, face left
	if (_moveDirection.x > 0) {
		_facing = FACE_LEFT;
		_isFacingRight = false;
	}
	
	// if heading right, face right
	if (_moveDirection.x < 0) {
		_facing = FACE_RIGHT;
		_isFacingRight = true;
	}
	
	// if jump cooldown is still active, increment counter
	// and check if cooldown is done already
	if (_jumpCooling) {
		
		// Increment jump cooldown
		_jumpCooldownClock += Time.deltaTime;
		
		// check if cooldown is done
		if (_jumpCooldownClock >= jumpCooldown) {
			// if yes, reset boolean check, and reset clock
			_jumpCooling = false;
			_jumpCooldownClock = 0;
		}
	
	}
}

// Jump character
function JumpMe():void {
	// Jump character only if its grounded
	if (_controller.isGrounded && !_jumpCooling && ShouldMove()) {
		_isJumping = true;
		charDummy.animation.Play("jump-start");
		_moveDirection.y += jumpHeight;
	} else if (_isJumping && !_doubleJumped) {
		_moveDirection.y += doubleJumpHeight;
		_doubleJumped = true;
	}
}


/*******************************************
	Animation Control Methods
********************************************/

/*
// Play Attack One animation
function AnimateBasicAttack():void {
	// check if avatar is player or enemy, and play appropriate animation
	if (tag == "Player") {
		charDummy.animation.CrossFade("slash1", 0.1);
	} else if (tag == "Enemy") {
		charDummy.animation.CrossFade("attack-melee1", 0.1);
	}
}
*/

// Play Idle animation (avatar is idling)
function AnimateIdle():void {
	charDummy.animation.Play("idle");
}


/*******************************************
	Helper/Getter/Setter Methods
********************************************/

// returns if current avatar is grounded
// essentially, it returns the CharacterController.isGrounded property
function IsGrounded():boolean {
	return _controller.isGrounded;
}

// returns true if avatar is facing right
function IsFacingRight():boolean {
	return _isFacingRight;
}

// checks if character should freeze any movement
// eg, if attack animation is playing
function ShouldMove():boolean {
	// Check if current avatar is player or enemey
	// if player...
	if (tag == "Player") {
		// list of animations that should play exclusively without horz movement
		// or if game is now in end state
		if(
			charDummy.animation.IsPlaying("slash1") ||
			charDummy.animation.IsPlaying("slash2") ||
			charDummy.animation.IsPlaying("hit") ||
			charDummy.animation.IsPlaying("thrust-release") ||
			charDummy.animation.IsPlaying("thrust-windup") ||
			_endGame
			) {
			return false;
		} else {
			return true;
		}
	}
	
	// if enemy...
	else if (tag == "Enemy") {
		// list of animations that should play exclusively without horz movement
		if(
			charDummy.animation.IsPlaying("attack-melee") ||
			charDummy.animation.IsPlaying("attack-ranged") ||
			charDummy.animation.IsPlaying("hit")
			) {
			return false;
		} else {
			return true;
		}
	}
}

// gets avatar to turn and face the opposite direction
function FaceOtherDirection():void {
	if (_facing == FACE_RIGHT) {
		_facing = FACE_LEFT;
	} else if (_facing == FACE_LEFT) {
		_facing = FACE_RIGHT;
	}
}

// lock player movement for end game state
function SetEndGame():void {
	_endGame = true;
}