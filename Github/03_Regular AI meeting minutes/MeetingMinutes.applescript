-- Meeting Minutes Generator App
-- Double-click to generate meeting minutes

set scriptPath to "/Users/yamanakashota/Desktop/AI開発/Github/03_Regular AI meeting minutes"

-- DIALOG 1: Get transcript via paste
set transcriptContent to ""
try
	set dialogResult to display dialog "Paste the transcript here (Cmd+V):" default answer "" buttons {"Cancel", "OK"} default button "OK" with title "Meeting Minutes - Step 1/2"
	set transcriptContent to text returned of dialogResult
on error
	return
end try

if transcriptContent is "" then
	display alert "No transcript" message "Please paste the transcript text." as warning
	return
end if

-- DIALOG 2: Get URL via paste
set videoURL to ""
try
	set dialogResult to display dialog "Paste the video URL here (Cmd+V):" & return & "(Optional - click Skip if not needed)" default answer "" buttons {"Skip", "OK"} default button "OK" with title "Meeting Minutes - Step 2/2"
	if button returned of dialogResult is "OK" then
		set videoURL to text returned of dialogResult
	end if
end try

-- Write transcript to file
set transcriptFile to scriptPath & "/input/transcript.txt"
do shell script "mkdir -p " & quoted form of (scriptPath & "/input")

set fileRef to open for access POSIX file transcriptFile with write permission
set eof of fileRef to 0
write transcriptContent to fileRef as «class utf8»
close access fileRef

-- Build python command with pyenv support
set pythonCmd to "export PATH=\"$HOME/.pyenv/shims:$HOME/.pyenv/bin:$PATH\" && eval \"$(pyenv init -)\" 2>/dev/null || true && cd " & quoted form of scriptPath & " && python src/main.py --file input/transcript.txt"

if videoURL is not "" then
	set pythonCmd to pythonCmd & " --video-url " & quoted form of videoURL
end if

try
	do shell script pythonCmd
	display notification "Meeting minutes posted to Teams!" with title "Meeting Minutes" sound name "Glass"
on error errMsg
	display alert "Error" message errMsg as critical
end try
