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

Local $dangerCount=0;
Local $lastTitle="";
While 1
	Sleep(3000)
	If $pause Then ContinueLoop
		
	Local $handle=WinActivate("[REGEXPTITLE:^!!!.* - Google Chrome$]")
	If $handle > 0 Then
		Sleep(1000)
		Send("^w")
		Sleep(1000)
		Local $title=WinGetTitle($handle)
		If StringLeft($title, 3) == "!!!" Then 
			ConsoleWrite(_NowCalc() & "  " & $title & " - Not closed, try again..." & @CRLF)
			ContinueLoop
		EndIf
		Send("^T")
		$lastTitle=""
		$dangerCount=0
		ConsoleWrite(_NowCalc() & "  " & "Closed tab and re-opened" & @CRLF)
		ContinueLoop
	EndIf
	
	$handle=WinGetHandle("[REGEXPTITLE:(?i).* - Google Chrome$]")
	If $handle > 0 Then
		Local $title=WinGetTitle($handle)
		If $lastTitle==$title Then
			If $dangerCount>20 Then
				ConsoleWrite(_NowCalc() & "  " & $lastTitle & ": " & $dangerCount & @CRLF)
			EndIf
			If $dangerCount>60 And StringLeft($title, 3) <> "$$$" Then
				WinActivate("[REGEXPTITLE:(?i).* - Google Chrome$]")
				Sleep(1000)
				Send("^w")
				Sleep(1000)
				Send("^T")
				$lastTitle=""
				$dangerCount=0
				ConsoleWrite(_NowCalc() & "  " & "Closed tab and re-opened" & @CRLF)
			Else
				$dangerCount+=1
			EndIf
		Else
			$lastTitle=$title
			$dangerCount=0
		EndIf
	Else
		ConsoleWrite(_NowCalc() & "  " & "Chrome not found" & @CRLF)
		$dangerCount=0
	EndIf
WEnd
