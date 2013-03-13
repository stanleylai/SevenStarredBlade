/**********************************************************************************************************************************
	
	GameLevelBehaviour.js
	Behaviour for Game Level
	
**********************************************************************************************************************************/


/*******************************************
	Variables
********************************************/

// GUI Health Vars

// Reference Objects
private var _player:GameObject;
private var _playerCE:CombatEngine;
private var _pa:PlayerAttack;

private var _fadeInNow:boolean = true;			// check for fade ins
private var _fadeDeathNow:boolean = false;		// check for death fade outs
private var _fadeGameEndNow:boolean = false;	// check for end game fade outs
private var _deathScreen:boolean = false;		// check for death screen
public var _alphaFadeValue:float = 1;			// hold current alpha value for fade

public var blackTexture:Texture;				// texture to use for fades
public var deathScreenTexture:Texture;			// texture for death screen

public var spawnPoint:GameObject;				// reference to spawn point
public var leftLimit:GameObject;				// reference to left limit of game area
public var rightLimit:GameObject;				// reference to right limit of game area

/*******************************************
	Engine Methods
********************************************/


// Do at script start
// Init basic variables
function Awake() {
	_player = GameObject.FindGameObjectWithTag("Player");
	_playerCE = _player.GetComponent("CombatEngine");
	_pa = _player.GetComponent("PlayerAttack");
	_spawn = GameObject.FindGameObjectWithTag("Respawn");
	
	// Spawn player at designated level spawn
	_player.transform.position = spawnPoint.transform.position;
	
	// Designate level left and right limit gameobject markers
	leftLimit = GameObject.Find("Left Limit");
	rightLimit = GameObject.Find("Right Limit");
}

// Do at initial start of script
function Start() {
	// Run actions on initial start of script
	// Stop play surface of level from rendering
	GameObject.FindGameObjectWithTag("Play Surface").GetComponent(MeshRenderer).enabled = false;
}

// Run on every frame
function Update() {
	// Check if player is past the left limit, and if yes stop player from moving further
	if (_player.transform.position.x > leftLimit.transform.position.x) {
		_player.transform.position.x = leftLimit.transform.position.x;
	}
	// Check if player is past the right limit, and if yes stop player from moving further
	if (_player.transform.position.x < rightLimit.transform.position.x) {
		_player.transform.position.x = rightLimit.transform.position.x;
	}
	// Check if player is past the bottom limit of level, if yes respawn
	if (_player.transform.position.y < 0) {
		_player.transform.position = spawnPoint.transform.position;
	}
}

// Run for when rendering GUI
function OnGUI() {
	// Fade In
	if (_fadeInNow) {
		_alphaFadeValue -= Mathf.Clamp01(Time.deltaTime / 3);
		GUI.color = new Color(0, 0, 0, _alphaFadeValue);
		GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height ), blackTexture);
	}
	// Stop fade in decrementor
	if (_fadeInNow && _alphaFadeValue <= 0) {
		_fadeInNow = false;
		_alphaFadeValue = 0;
	}
	
	// For Death Fade Out
	if (_fadeDeathNow) {
		GameObject.FindGameObjectWithTag("MainCamera").GetComponent("AudioFade").SetAudioTheme("DEATH");
		_alphaFadeValue += Mathf.Clamp01(Time.deltaTime / 3);
		GUI.color = new Color(0, 0, 0, _alphaFadeValue);
		GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height ), deathScreenTexture);
	}
	// Stop death fade out incrementor
	if (_fadeDeathNow && _alphaFadeValue >= 1) {
		_alphaFadeValue = 1;
		_deathScreen = true;
	}
	
	// End Game Fade Out
	if (_fadeGameEndNow) {
		GameObject.FindGameObjectWithTag("MainCamera").GetComponent("AudioFade").SetAudioTheme("DEATH");
		_alphaFadeValue += Mathf.Clamp01(Time.deltaTime / 3);
		GUI.color = new Color(0, 0, 0, _alphaFadeValue);
		GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height ), blackTexture);
	}
	// Stop end game fade out incrementor
	if (_fadeGameEndNow && _alphaFadeValue >= 1) {
		_alphaFadeValue = 1;
		Application.LoadLevel ("Credits");
	}
	
	
	// Hit Enter to restart when death screen is up
	if (_deathScreen && Input.GetKeyDown("return")) {
		Application.LoadLevel ("030412");
		Debug.Log("restart");
	}
	
	
	GUI.color = Color.red;
	
	// If player health is not 0, render health bar
	if (_playerCE._currHealth > 0) {
		// Rendering health bar
		GUI.Box(new Rect(10, 10, 
					Screen.width / 2 / (_playerCE.maxHealth / _playerCE._currHealth), 20), 
					_playerCE._currHealth+"/"+_playerCE.maxHealth
				);
	}
	
}


/*******************************************
	Helper Methods
********************************************/
function SetFadeDeath(b:boolean):void {
	_fadeDeathNow = b;
}

function SetFadeIn(b:boolean):void {
	_fadeInNow = b;
}

function SetFadeEndGame(b:boolean):void {
	_fadeGameEndNow = b;
}