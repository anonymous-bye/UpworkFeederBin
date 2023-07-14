#include <AutoItConstants.au3>
#include <MsgBoxConstants.au3>
#include <StringConstants.au3>
#include <FileConstants.au3>
#include <Date.au3>

ControlSend("[CLASS:SciTEWindow]", "", "Scintilla2", "+{F5}")
ConsoleWrite("Running..." & @CRLF)

HotKeySet("!`", "StopScript")
Func StopScript()
	If MsgBox(52, "Stop?", "Do you want to stop?") == 6 Then
		Exit
	EndIf
EndFunc

Global $pause=false
HotKeySet("!1", "PauseScript")
Func PauseScript()
	$pause=true
	TrayTip("Pause", "Signup paused", 1, 1)
	ConsoleWrite("Paused" & @CRLF)
EndFunc
HotKeySet("!2", "ContinueScript")
Func ContinueScript()
	$pause=false
	TrayTip("Continue", "Signup resumed", 1, 1)
	ConsoleWrite("Resumed" & @CRLF)
EndFunc

TrayTip("Ready", "Signup started", 1, 1)

Local $interval=0;
While 1
	Sleep(3000)
	If $pause Then ContinueLoop
		
	If WinActive("[TITLE:Open]") > 0 Then
		Send("{ESC}")
		Sleep(500)
		Send("{ESC}")
		Sleep(500)
	EndIf
	
	Local $handle=WinActivate("[REGEXPTITLE:\!\^\$/.*- Google Chrome]")
	If $handle== 0 Then 
		$interval+=1
		if Mod($interval, 20) == 0 Then
			Local $handle0=WinActivate("[REGEXPTITLE:(?i).* - Google Chrome$]")
			If $handle0 > 0 Then
				Local $pos0=WinGetPos($handle0)
				MouseClick($MOUSE_CLICK_LEFT, $pos0[0]+20, $pos0[1]+200)
			Else
				ConsoleWrite("Chrome not activated" & @CRLF)
			EndIf
		EndIf
		ContinueLoop
	EndIf
	
	Local $title=WinGetTitle($handle)
	Local $pos=WinGetPos($handle)
	Local $array = StringSplit($title, "/", 1)
	If $array[0]<2 Then ContinueLoop
	Local $filename=$array[2]
	For $i=1 to 3
		MouseClick($MOUSE_CLICK_LEFT, $pos[0]+200, $pos[1]+200)		;Click Upload Photo Button
		If WinWaitActive("[TITLE:Open]", "", 3) > 0 Then 
			Sleep(1000)
			Send($filename)
			Send("{ENTER}")
			ConsoleWrite($filename & @CRLF)
			ExitLoop
		EndIf
	Next
WEnd
