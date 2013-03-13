public var bgTex:MovieTexture;
private var _played:boolean = false;

function OnGUI() {
	GUI.DrawTexture(Rect(0,0,Screen.width,Screen.height), bgTex);
	if (!bgTex.isPlaying && _played == false) {
		bgTex.Play();
		_played = true;
	}
	
	if (!bgTex.isPlaying && _played == true) {
		Debug.Log("done");
		Application.LoadLevel ("Splash");
	}
	
	if(Input.GetKeyDown("return")) {
		Application.LoadLevel ("Splash");
	}
}