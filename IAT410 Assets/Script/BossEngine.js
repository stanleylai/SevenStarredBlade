/**********************************************************************************************************************************
	
	BossEngine.js
	Behaviour necessary to handle Boss animation introductions etc.
	
**********************************************************************************************************************************/
@script RequireComponent (CharacterController);


/*******************************************
	Variables
********************************************/


// Public Vars
public var charDummy:GameObject;					// Dummy containing animations
public var gravity:float = 250;						// gravitational force applied on boss

// Private Vars
private var _runNow:boolean = false;				// Should boss sequence begin?
private var _moveDirection:Vector3;					// Store which movement vectors (primarily for gravity in this case)
private var _controller:CharacterController;		// Character Controller for this avatar
private var _audio:AudioSource;						// Reference to Boss AS
private var _camera:GameObject;						// Reference to Camera


/*******************************************
	Engine Methods
********************************************/

// Do at initial script load
function Awake() {
	_controller = GetComponent(CharacterController);
	_audio = GetComponent(AudioSource);
	_camera = GameObject.FindGameObjectWithTag("MainCamera");
}

// Do at Start
function Start() {
	charDummy.animation["fall-roar"].wrapMode = WrapMode.ClampForever;
}

// Do every frame
function Update () {
	// run only when ready and instructed
	if (_runNow) {
		// Play Boss Music Theme
		_camera.GetComponent("AudioFade").SetAudioTheme("BOSS");

		// Reset Z position
		transform.position.z = 50;
		
		// Apply gravity to character
		_moveDirection.y -= gravity * Time.deltaTime;
		_controller.Move(_moveDirection * Time.deltaTime);
		
		if (_controller.isGrounded) {
			charDummy.animation.Play("fall-roar");
			if (!_audio.isPlaying) {
				WaitAndRoar(0.8);
				WaitAndFade(4.0);
			}
		}
	}
}


/*******************************************
	Helper Methods
********************************************/

// set boss to start playing
function RunNow():void {
	_runNow = true;
}

// wait for set amount of seconds, before playing roar
function WaitAndRoar(time:float) {
	yield WaitForSeconds(time);
	_audio.Play();
}

// wait for set amount of seconds, before going to credits
function WaitAndFade(time:float) {
	yield WaitForSeconds(time);
	GameObject.Find("Level Scripts").GetComponent("GameLevelBehaviour").SetFadeEndGame(true);
}