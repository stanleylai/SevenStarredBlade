/**********************************************************************************************************************************
	
	PlayerAttack.js
	Behaviour necessary to handle player specific attack capabilities.
	Requires CombatEngine.js, MovementEngine.js
	
**********************************************************************************************************************************/
@script RequireComponent (CombatEngine);
@script RequireComponent (MovementEngine);
@script RequireComponent (PlayerMovement);


/*******************************************
	Variables
********************************************/


// Attack One Vars
public var attackOneRange:float = 20;					// Range for Attack One.
public var attackOneDamage:float = 20;					// Damage for Attack One.
public var attackOneDamageMin:float = 20;					// Damage for Attack One.
public var attackOneDamageMax:float = 20;					// Damage for Attack One.

// Attack Two Vars
public var attackTwoRange:float = 20;					// Range for Attack Two.
public var attackTwoDamage:float = 20;					// Damage for Attack Two.
public var attackTwoDamageMin:float = 20;					// Damage for Attack Two.
public var attackTwoDamageMax:float = 20;					// Damage for Attack Two.
public var attackTwoSweetMultiplier:float = 1.5;		// Damage multiplier for Attack Two if made within sweet spot

// Shared Attack Vars
// public var attackKeyThreshold:float = 3.0;				// How long to charge attack before doing "heavy attack"
public var _attackKeyClock:float = 0.0;					// How long key has been held so far. Public For Debug purposes.
public var attackKeySweetMin:float = 2.0;				// Attack key sweet spot minimum time
public var attackKeySweetMax:float = 2.5;				// Attack key sweet spot maximum time
private var _defaultAttackKeySweetMin:float;
private var _defaultAttackKeySweetMax:float;

private var _defaultAttackCooldown:float = 1;			// Default Cooldown for Attack One. In Seconds. Should match with duration of normal attack animation
private var _resetAttackCooldown:float = 1;				// Cooldown to reset to for Attack One. In Seconds. Modified according to current combo multipliers
private var _attackCooldownClock:float = 1;				// Current cooldown clock. Public For Debug purposes.

public var attackSpeedModifier:float = 1.1;				// Multiplier for attack speed boosts for combo
public var attackComboTime:float = 1.0;					// Time in seconds, attacks must be made to be considered a combo
public var _attackComboClock:float = 0.0;				// Current clock for combo attacks. Public for Debug purposes
private var _newAttackCombo:boolean = true;				// Check for if a new combo is being started

private var _isHit:boolean = false;						// Check for if player has been hit, and whether to perform hit-related behaviours

// Private Vars
private var _ce:CombatEngine;							// Player's Combat Engine
private var _me:MovementEngine;							// Player's Movement Engine
private var _pm:PlayerMovement;							// Player Specific Movement


/*******************************************
	Engine Methods
********************************************/


// Do at code load
function Awake():void {
	_ce = GetComponent(CombatEngine);			// Assign Player's Combat Engine to this variable
	_me = GetComponent(MovementEngine);			// Assign Player's Movement Engine to this variable
	_pm = GetComponent(PlayerMovement);			// Assign Player Specific Movement to this variable
}

// Run at start
function Start():void {
	// Modification of attack cooldown to match animation rates set in PlayerMovement
	_defaultAttackCooldown /= _pm.defaultAttackAnimSpeed;
	_resetAttackCooldown = _defaultAttackCooldown;
	_attackCooldownClock = _defaultAttackCooldown;
	_defaultAttackKeySweetMin = attackKeySweetMin;
	_defaultAttackKeySweetMax = attackKeySweetMax;
}

// Run once every frame
function Update():void {
	// decrement cooldown timer for attack one
	if (_attackCooldownClock > 0)
		_attackCooldownClock -= Time.deltaTime;
	
	// Check Attack combo clock
	if (!_newAttackCombo && _attackComboClock < attackComboTime) {
		_attackComboClock += Time.deltaTime;
	}
	
	// Check if player was hit
	if (_isHit) {
		SendMessage("AnimateHit");
		_attackKeyClock = 0;
		ResetCombo();
		_isHit = false;
	}
	
	// Attack button is hit, and held down while player is on the ground,
	// increment clock for key held down, and prepare to wind up for big attack
	if (Input.GetButton("Attack1") && _attackCooldownClock <= 0.0 && _me.IsGrounded() && _ce.IsAlive()) {
		_attackKeyClock += Time.deltaTime;
		SendMessage("AnimateThrustWindup");
	}
	
	// Attack button is up: launch attack depending on how long it has been held down
	if (Input.GetButtonUp("Attack1") && _attackCooldownClock <= 0.0 && _me.IsGrounded() && _ce.IsAlive()) {
		if (_attackKeyClock > attackKeySweetMax) {
			// Perform Attack Two
			PerformAttackTwo(_ce.FindClosestEnemy(), false);
		} else if (_attackKeyClock > attackKeySweetMin && _attackKeyClock < attackKeySweetMax) {
			PerformAttackTwo(_ce.FindClosestEnemy(), true);
		} else {
			// Perform Attack One
			PerformAttackOne(_ce.FindClosestEnemy());
		}
		
		// Check if combo is now overtime. If yes, reset combo values
		if (!_newAttackCombo && _attackComboClock > attackComboTime) {
			ResetCombo();
		}
		
		// reset attack key clock so its ready to count for heavy attack again
		_attackKeyClock = 0;
		
		// reset attack cooldown clock
		_attackCooldownClock = _resetAttackCooldown;
	}
	
	// If player is dead, fade to black
	if (!_ce.IsAlive()) {
		GameObject.Find("Level Scripts").GetComponent("GameLevelBehaviour").SetFadeDeath(true);
	}
	
	// Check for sweet spot, and display charge marker
	if (CheckForSweetSpot()) {
		GameObject.Find("ChargeMarker").renderer.enabled = true;
	} else {
		GameObject.Find("ChargeMarker").renderer.enabled = false;
	}
}


/*******************************************
	Attack Methods
********************************************/


// Perform Attack One
function PerformAttackOne(enemy:GameObject):void {
	// If enemy exists, perform attack
	if (enemy != null) {
		// If enemy is found.
		
		// Attack() method takes parameters and if damage is dealt, returns true
		// If damage is indeed dealt, we start processing stuff for combos
		// if ( _ce.Attack(enemy, attackOneDamage, attackOneRange) ) {
		if ( _ce.NewAttack(enemy, attackOneDamageMin, attackOneDamageMax, attackOneRange) ) {
		
			// check if applying speed modifiers for combo
			// if its a new combo sequence, or still within time to count as a combo 
			if (_newAttackCombo || _attackComboClock < attackComboTime) {
				// apply modifier to attack animations
				_pm.ApplyAnimModifier(attackSpeedModifier);
				// apply modifier to attack cooldowns to keep things consistent
				_resetAttackCooldown /= attackSpeedModifier;
				attackKeySweetMin /= attackSpeedModifier;
				attackKeySweetMax /= attackSpeedModifier;
				_attackComboClock = 0;
				_newAttackCombo = false;
			} else {
				// this is a combo that is past time, so let's reset everything
				ResetCombo();
			}
			
			//_attackCooldownClock = _resetAttackCooldown;
		}
		
		// _ce.Attack(enemy, attackOneDamage, attackOneRange);
		// _attackCooldownClock = attackCooldown;
		
		Debug.Log("Player Using Attack One");
	} else {
		// No enemy found.
		Debug.Log("No Enemy Found.");
	}
	
	// Dispatch message to MovementEngine to play Attack One animation
	SendMessage("AnimateBasicAttack");
}


// Perform Attack Two - for charged attacks
function PerformAttackTwo(enemy:GameObject, sweetSpot:boolean):void {
	// If enemy exists, perform attack
	if (enemy != null) {
		// If enemy is found.
		// if attack made within the sweet spot...
		if (sweetSpot) {
			// Multiply damage with multiplier
			//_ce.Attack(enemy, attackTwoDamage*attackTwoSweetMultiplier, attackTwoRange);
			_ce.NewAttack(enemy, attackTwoDamageMin*attackTwoSweetMultiplier, attackTwoDamageMax*attackTwoSweetMultiplier, attackTwoRange);
			Debug.Log("Attack Two Bonus Damage: " + attackTwoDamage*attackTwoSweetMultiplier);
		} else {
			// Apply regular attack two damage
			//_ce.Attack(enemy, attackTwoDamage, attackTwoRange);
			_ce.NewAttack(enemy, attackTwoDamageMin, attackTwoDamageMax, attackTwoRange);
		}
		_attackCooldownClock = _resetAttackCooldown;
		Debug.Log("Player Using Attack Two");
	} else {
		// No enemy found.
		Debug.Log("No Enemy Found.");
	}
	
	// Dispatch message to MovementEngine to play Attack One animation
	SendMessage("AnimateThrustRelease");
}



/*******************************************
	Hit Methods - For when Player is Hit
********************************************/


// Receives message from Combat Engine that player has been hit
function Hit(i:int) {
	_isHit = true;
}


/*******************************************
	Helper Methods
********************************************/


// reset combo parameters
function ResetCombo():void {
	_pm.ResetAnimModifier();
	_resetAttackCooldown = _defaultAttackCooldown;
	_newAttackCombo = true;
	_attackComboClock = 0;
	attackKeySweetMin = _defaultAttackKeySweetMin;
	attackKeySweetMax = _defaultAttackKeySweetMax;
}


// check if attack key is currently in the sweet spot
function CheckForSweetSpot():boolean {
	if (_attackKeyClock > attackKeySweetMin &&
		_attackKeyClock < attackKeySweetMax) {
		return true;
	} else {
		return false;
	}
}