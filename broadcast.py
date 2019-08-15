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

print 


recording_time = 10
fps = 10
quality = 32

camera = picamera.PiCamera(resolution=(1280, 720), framerate=fps)
# buffer more seconds than we actually will save
stream = picamera.PiCameraCircularIO(camera, seconds=recording_time * 2)

camera.annotate_background = picamera.Color('black')
camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
camera.start_recording(stream, format='h264', quality=quality)
start = dt.datetime.now()

while True:
    while (dt.datetime.now() - start).seconds < recording_time:
        camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        camera.wait_recording(0.2)
    start = dt.datetime.now()
    stream.copy_to('pivideo.h264', seconds=recording_time)
    
    subprocess.Popen(['./box.sh', str(fps), config['overseer-server']])

camera.stop_recording()
