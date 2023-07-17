#include <AutoItConstants.au3>
#include <MsgBoxConstants.au3>
#include <StringConstants.au3>
#include <DateTimeConstants.au3>
#include <FileConstants.au3>
#include <Date.au3>

ControlSend("[CLASS:SciTEWindow]", "", "Scintilla2", "+{F5}")
ConsoleWrite(_NowCalc() & "  " & "Started..." & @CRLF)

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
	ConsoleWrite(_NowCalc() & "  " & "Paused" & @CRLF)
EndFunc
HotKeySet("!2", "ContinueScript")
Func ContinueScript()
	$pause=false
	TrayTip("Continue", "Resumed", 1, 1)
	ConsoleWrite(_NowCalc() & "  " & "Resumed" & @CRLF)
EndFunc

TrayTip("Ready", "Started", 1, 1)

Local $interval=0;
Local $dangerCount=0;
Local $lastTitle="";
While 1
	Sleep(3000)
	If $pause Then ContinueLoop
	$interval+=1
	If Mod($interval, 60) == 0 Then
		Local $handle0=WinActivate("[REGEXPTITLE:(?i).* - Google Chrome$]")
		If $handle0 > 0 Then
			Local $pos0=WinGetPos($handle0)
			MouseClick($MOUSE_CLICK_LEFT, $pos0[0]+20, $pos0[1]+200)
		Else
			ConsoleWrite(_NowCalc() & "  " & "Chrome not activated" & @CRLF)
		EndIf
	EndIf
	
	Local $handle=WinGetHandle("[REGEXPTITLE:(?i).* - Google Chrome$]")
	If $handle > 0 Then
		Local $title=WinGetTitle($handle)
		If StringLeft($title, 3) == "!!!" Then
			ReopenChromeTab()
			$lastTitle=""
		ElseIf $lastTitle==$title Then
			If $dangerCount>20 Then
				ConsoleWrite(_NowCalc() & "  " & $lastTitle & ": " & $dangerCount & @CRLF)
			EndIf
			If $dangerCount>60 And StringLeft($title, 3) <> "$$$" Then
				ReopenChromeTab()
				$lastTitle=""
			EndIf
			$dangerCount+=1
		Else
			$lastTitle=$title
			$dangerCount=0
		EndIf
	Else
		ConsoleWrite(_NowCalc() & "  " & "Chrome not found" & @CRLF)
		$dangerCount=0
	EndIf
WEnd

Func ReopenChromeTab()
	WinActivate("[REGEXPTITLE:(?i).* - Google Chrome$]")
	Sleep(1000)
	Send("^w")
	Sleep(1000)
	Send("^T")
	Sleep(5000)
	$dangerCount=0
	ConsoleWrite(_NowCalc() & "  " & "Closed tab and re-opened" & @CRLF)
EndFunc