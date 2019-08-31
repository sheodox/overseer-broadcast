import os
import picamera
import datetime as dt
import subprocess
import json

try:
    file = open('config.json')
    config = json.load(file)
    file.close()
except FileNotFoundError:
    print('no config.json, make one with these properties:')
    print('overseer-server: IP/domain name of the overseer server')
    print('save-directory: directory path to a web server root to save videos to (a small ram disk is recommended)')

print("Overseer Broadcast camera running!")

recording_time = 10
fps = 10
quality = 32

camera = picamera.PiCamera(resolution=(1280, 720), framerate=fps)
# buffer more seconds than we actually will save
stream = picamera.PiCameraCircularIO(camera, seconds=recording_time)

camera.annotate_background = picamera.Color('black')
camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
camera.start_recording(stream, format='h264', quality=quality)
start = dt.datetime.now()

while True:
    while (dt.datetime.now() - start).seconds < recording_time:
        camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        camera.wait_recording(0.1)
    stream.copy_to(os.path.join(config['save-directory'], 'pivideo.h264'), seconds=recording_time)
    # requesting a keyframe now will mean it will have a key frame to split the video at,
    # instead of having to throw away a section of video until the first keyframe for the next segment
    start = dt.datetime.now()
    camera.request_key_frame()
    
    subprocess.Popen(['./box.sh', str(fps), config['overseer-server'], config['save-directory']])

camera.stop_recording()
