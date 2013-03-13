/**********************************************************************************************************************************
	
	CombatEngine.js
	Behaviour necessary to handle combat, such as health, attacks and etc.
	Requires MovementEngine.js
	
**********************************************************************************************************************************/
@script RequireComponent (MovementEngine);


/*******************************************
	Variables
********************************************/


// Public Vars
public var spawnPoint:GameObject;			// Current spawn point for character
public var willRespawn:boolean;				// Will character respawn after death?
public var maxHealth:int = 100;				// How much health avatar begins with

// Private Vars
private var _me:MovementEngine;				// Reference to current avatar's movement engine
public var _currHealth:int;					// Current health of avatar
private var _alreadyDead:boolean = false;	// Store if avatar is already dead


/*******************************************
	Engine Methods
********************************************/

// Do at code load
function Awake():void {
	// Assign movement engine to reference
	_me = GetComponent("MovementEngine");
	// Set current health to initial health value
	_currHealth = maxHealth;
}

// Do at initial code run
function Start():void {
}

// Do every frame
function Update ():void {
	// Check how much health is left.
	// If health is 0 or less, its dead!
	if (_currHealth <= 0 && !_alreadyDead) {
		SendMessage("AnimateDeath");
		_alreadyDead = true;
	}
	
	// check if health is beyond max. if yes, reset back to max health
	if (_currHealth > maxHealth) {
		_currHealth = maxHealth;
	}
}


/*******************************************
	Attack Methods
********************************************/
/* Old Attack - Deprecated, now using the new attack system with random attack values within a range
// Perform Attack
// Check that target is the right distance, avatar is facing the right way and grounded
// before conducting the attack
function Attack(target:GameObject, damage:float, range:float):boolean {
	var targetCE:CombatEngine = target.GetComponent("CombatEngine");				// Target's CombatEngine
	var dist = Vector3.Distance(target.transform.position, transform.position);		// Distance between avatar and Target
	// If avatar is facing the right way (at the enemy) and is grounded
	if (dist < range && AttackingRightWay(target) && _me.IsGrounded()) {
		targetCE.AdjustHealth(-damage);			// Deal damage to target
		return true;
	} else {
		return false;
	}
	
	// Reset timer for cooldown
	//_attackOneTimer = attackOneCooldownTimer;
}
*/

// Perform New Attack (with random damange dealt within range
// Check that target is the right distance, avatar is facing the right way and grounded
// before conducting the attack
function NewAttack(target:GameObject, damageMin:float, damageMax:float, range:float):boolean {
	var targetCE:CombatEngine = target.GetComponent("CombatEngine");				// Target's CombatEngine
	var dist = Vector3.Distance(target.transform.position, transform.position);		// Distance between avatar and Target
	
	// If avatar is facing the right way (at the enemy) and is grounded
	if (dist < range && AttackingRightWay(target) && _me.IsGrounded()) {
		targetCE.AdjustHealth(-Random.Range(damageMin, damageMax));			// Deal damage to target
		return true;
	} else {
		return false;
	}
	
	// Reset timer for cooldown
	//_attackOneTimer = attackOneCooldownTimer;
}


/*******************************************
	Helper Methods
********************************************/


// Adjust health value of character by i
function AdjustHealth(i:int):void {
	_currHealth += i;
	// decide what animations to play
	// based on health change
	if (i > 0) {
		// health added
	} else {
		// health decreased
		SendMessage("AnimateHit");
		SendMessage("SetStatus", ""+i);
		//SendMessage("Hit", i);
	}
}

// Check if avatar is alive
function IsAlive():boolean {
	if (_alreadyDead) {
		return false;
	} else {
		return true;
	}
}

// Find closest enemy alive, and return as GameObject reference to it
function FindClosestEnemy():GameObject {
	var enemyList:GameObject[];
	var closest:GameObject;
	var distance = Mathf.Infinity;
	var pos = transform.position;
	
	enemyList = GameObject.FindGameObjectsWithTag("Enemy");
	for (var go:GameObject in enemyList) {
		var diff = (go.transform.position - pos);
		var curDistance = diff.sqrMagnitude;
		var ce:CombatEngine = go.GetComponent("CombatEngine");
		
		if (curDistance < distance && ce.IsAlive()) {
			closest = go;
			distance = curDistance;
		}
	}
	
	return closest;
}

// Check if attack is being done in the right direction, relative to input target GameObject
function AttackingRightWay(target:GameObject):boolean {
	var dist = target.transform.position.x - transform.position.x;		// difference of target and current avatar's x position
																		// used to differentiate if target is to the left or right of current avatar
	
	// check if facing the right direction
	// ie. face right, target to the right; face left, target to the left
	if (
		(_me.IsFacingRight() && dist < 0) || (!_me.IsFacingRight() && dist > 0)
		) {
		// Debug.Log("Facing the right way");
		return true;
	} else {
		// Debug.Log("Facing the wrong way");
		return false;
	}
}

// Respawn avatar
function Respawn():void {
	if (willRespawn) {
		transform.position = spawnPoint.transform.position;
	}
}