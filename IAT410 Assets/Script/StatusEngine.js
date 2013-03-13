/**********************************************************************************************************************************
	
	StatusEngine.js
	Manages status display updates for avatar
	
**********************************************************************************************************************************/
@script RequireComponent (MovementEngine);
@script RequireComponent (CombatEngine);


/*******************************************
	Variables
********************************************/


// Public vars
public var statusTimeout:float = 0.75;			// How long to display status before it disappears

// Private Vars
private var _me:MovementEngine;					// Link to this avatar's Movement Engine
private var _ce:CombatEngine;					// Link to this avatar's Combat Engine

private var _status:TextMesh;					// Link to this avatar's Text Mesh for text display
private var _statusDisplaying:boolean;			// Is anything being displayed right now?
public var _statusTimeoutClock:float = 0;		// What is the current Timeout countdown. Public for debug.
public var _currStatus:String;					// Current status to be displayed. Public for debug.


/*******************************************
	Engine Methods
********************************************/


// Do on script load
function Awake():void {
	// Assign references to various components
	_ce = GetComponent("CombatEngine");
	_me = GetComponent("MovementEngine");
	_status = GetComponentInChildren(TextMesh);

	// Set initial values for booleans
	_statusDisplaying = false;

	// Reset intial status to be blank
	_currStatus = "";
	_statusTimeoutClock = 0;
}

// Do on script init
function Start():void {
}

// Do on every frame
function Update():void {
	
	// check if there is a status, and see if its time to take it off
	if (_statusDisplaying) {
		// increment timeout clock
		_statusTimeoutClock += Time.deltaTime;
		
		// check if timeout is past, if yes reset status
		if (_statusTimeoutClock >= statusTimeout) {
			_statusDisplaying = false;
			_currStatus = "";
			_statusTimeoutClock = 0;
		}
	}
	
	// Update text with the current set status
	_status.text = _currStatus;
}


/*******************************************
	Helper Methods
********************************************/


// Setter method to specify what the current status should be
function SetStatus(t:String):void {
	_currStatus = t;
	_statusDisplaying = true;
}