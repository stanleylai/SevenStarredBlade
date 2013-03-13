/**********************************************************************************************************************************
	
	PlayerAttack.js
	Behaviour necessary to handle player specific attack capabilities.
	Requires CombatEngine.js, MovementEngine.js
	
**********************************************************************************************************************************/
@script RequireComponent (CombatEngine);
@script RequireComponent (MovementEngine);


/*******************************************
	Variables
********************************************/


// Attack One Vars
public var attackOneCooldownTimer:float = 1.0;			// Cooldown for Attack One. In Seconds.
public var attackOneRange:float = 20;					// Range for Attack One.
public var attackOneDamage:float = 20;					// Damage for Attack One.
public var attackOneDamageMin:float = 20;					// Damage for Attack One.
public var attackOneDamageMax:float = 20;					// Damage for Attack One.
public var _attackOneTimer:float = 0.0;					// Current cooldown clock. Public For Debug purposes.

// Public Vars
public var attackMargin:float = 10;						// Margin to allow attack to happen

// Private Vars
private var _ce:CombatEngine;							// Avatar's Combat Engine
private var _me:MovementEngine;							// Avatar's Movement Engine
private var _em:EnemyMovement;							// Avatar's Enemy Movement
private var _player:GameObject;							// Player Game Object
private var _playerCE:CombatEngine;						// Player Combat Engine


/*******************************************
	Engine Methods
********************************************/


// Do at code load
function Awake():void {
	_ce = GetComponent(CombatEngine);						// Assign Avatar's Combat Engine to this variable
	_me = GetComponent(MovementEngine);						// Assign Avatar's Movement Engine to this variable
	_em = GetComponent(EnemyMovement);						// Assign Avatar's Enemy Movement to this variable
	_player = GameObject.FindGameObjectWithTag("Player");	// Store reference to Player Game Object
	_playerCE = _player.GetComponent("CombatEngine");
}


// Run once every frame
function Update () {
	// decrement cooldown timer for attack one
	if (_attackOneTimer != 0)
		_attackOneTimer -= Time.deltaTime;
	
	// if attack one cooldown is done, reset to zero
	if (_attackOneTimer <= 0)
		_attackOneTimer = 0;

	// if within range, timer is up and player is still alive, then attack
	if (WithinAttackRange() && _attackOneTimer == 0.0 && _playerCE.IsAlive() && _ce.IsAlive()) {
		
		// check that enemy character is facing the right way to attack player character
		if (_ce.AttackingRightWay(_player)) {
			// if yes, attack
			// _ce.Attack(_player, attackOneDamage, attackOneRange);
			_ce.NewAttack(_player, attackOneDamageMin, attackOneDamageMax, attackOneRange);
			SendMessage("AnimateBasicAttack");
			Debug.Log("Enemy attacking at distance of " + _em.DistanceToPlayer());
			_attackOneTimer = attackOneCooldownTimer;
		} else {
			// if no, turn character around
			_me.FaceOtherDirection();
		}
	}
}


/*******************************************
	Helper Methods
********************************************/


// checks if enemy avatar is within range to attack
// returns true if yes
function WithinAttackRange():boolean {
	var dist:float = _em.DistanceToPlayer();
	
	if (dist < attackOneRange) {
		return true;
	}
}
