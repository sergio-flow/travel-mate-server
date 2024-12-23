@echo off
for /r %%i in (*.jpg) do (
    magick "%%i" -resize 540x370^ -gravity center -crop 540x370+0+0 +repage -quality 80 "%%i"
)