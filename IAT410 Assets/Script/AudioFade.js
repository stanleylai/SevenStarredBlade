/**********************************************************************************************************************************
	
	AudioFade.js
	Fades music out after set amount of time
	
**********************************************************************************************************************************/


/*******************************************
	Variables
********************************************/

public var fadeTime:float = 20;							// Time at which to begin fading out music
public var fadeMultiplier:float = 2;					// Multiplier for music fading
public var currentAudioTime:float;						// Display current playing time. Public for debug purposes
public var currentAudioVolume:float;					// Display current playing time. Public for debug purposes

public var introAudio:AudioClip;						// Reference to Audio Clip for intro music
public var bossAudio:AudioClip;							// Reference to Audio Clip for death music
public var deathAudio:AudioClip;						// Reference to Audio Clip for death music

private var _currentTheme:String = INTRO_THEME;			// Current Theme to be played
public static var INTRO_THEME:String = "INTRO";
public static var BOSS_THEME:String = "BOSS";
public static var DEATH_THEME:String = "DEATH";

// Reference variables
private var _audio:AudioSource;							// Reference to audio source


/*******************************************
	Engine Methods
********************************************/


// Do on script load
function Awake() {
	_audio = GetComponent(AudioSource);
}

// Do every frame
function Update () {
	currentAudioTime = _audio.time;
	currentAudioVolume = _audio.volume;
	
	switch(_currentTheme) {
		case INTRO_THEME:
			_audio.clip = introAudio;
			break;
		case BOSS_THEME:
			_audio.clip = bossAudio;
		case DEATH_THEME:
			_audio.clip = deathAudio;
			break;
	}
	
	if (currentAudioVolume > 0 && !_audio.isPlaying) {
		_audio.Play();
	}
	
	if (_currentTheme == INTRO_THEME &&
		_audio.isPlaying &&
		_audio.time > fadeTime &&
		_audio.volume > 0
		) {
			FadeOut(fadeMultiplier);
	}
}


/*******************************************
	Helper Methods
********************************************/

// Fade out music. fm is fade multiplier to control speed of fading
function FadeOut(fm:float):void {
	_audio.volume -= Time.deltaTime * fm;
}

// Fade in music. fm is fade multiplier to control speed of fading
function FadeIn(fm:float):void {
	_audio.volume += Time.deltaTime * fm;
}

function SetAudioTheme(str:String):void {
	_currentTheme = str;
}