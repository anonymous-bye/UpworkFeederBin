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
	TrayTip("Pause", "Paused", 1, 1)
	ConsoleWrite("Paused" & @CRLF)
EndFunc
HotKeySet("!2", "ContinueScript")
Func ContinueScript()
	$pause=false
	TrayTip("Continue", "Resumed", 1, 1)
	ConsoleWrite("Resumed" & @CRLF)
EndFunc

TrayTip("Ready", "Started", 1, 1)

Local $interval=0;
Local $dangerCount=0;
Local $lastTitle="";
While 1
	Sleep(3000)
	If $pause Then ContinueLoop
	$interval+=1
	if Mod($interval, 60) == 0 Then
		Local $handle0=WinActivate("[REGEXPTITLE:(?i).* - Google Chrome$]")
		If $handle0 > 0 Then
			Local $pos0=WinGetPos($handle0)
			MouseClick($MOUSE_CLICK_LEFT, $pos0[0]+20, $pos0[1]+200)
		Else
			ConsoleWrite("Chrome not activated" & @CRLF)
		EndIf
	EndIf
	
	Local $handle=WinGetHandle("[REGEXPTITLE:(?i).* - Google Chrome$]")
	If $handle > 0 Then
		Local $title=WinGetTitle($handle)
		if $lastTitle==$title Then
			If $dangerCount>20 Then
				ConsoleWrite($lastTitle & ": " & $dangerCount & @CRLF)
			EndIf
			If $dangerCount>60 Then
				WinActivate("[REGEXPTITLE:(?i).* - Google Chrome$]")
				Sleep(1000)
				Send("^w")
				Sleep(1000)
				Send("^T")
				Sleep(5000)
				$dangerCount=0
				ConsoleWrite("Closed tab and re-opened" & @CRLF)
			EndIf
			$dangerCount+=1
		Else
			$lastTitle=$title
			$dangerCount=0
		EndIf
	Else
		ConsoleWrite("Chrome not found" & @CRLF)
		$dangerCount=0
	EndIf
WEnd
