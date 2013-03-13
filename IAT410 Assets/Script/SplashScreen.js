public var bgTex:Texture;
public var blackTexture:Texture;
private var _fadeNow:boolean = false;
public var _alphaFadeValue:float = 0;

function Update() {
	if(Input.GetKeyDown("return")) {
		_fadeNow = true;
	}
	
	if (_alphaFadeValue > 1) {
		Application.LoadLevel ("030412");
	}
}

function OnGUI() {
	GUI.DrawTexture(Rect(0,0,Screen.width,Screen.height), bgTex);
	if (_fadeNow) {
		_alphaFadeValue += Mathf.Clamp01(Time.deltaTime / 3);
		GUI.color = new Color(0, 0, 0, _alphaFadeValue);
		GUI.DrawTexture( new Rect(0, 0, Screen.width, Screen.height ), blackTexture );
	}
}