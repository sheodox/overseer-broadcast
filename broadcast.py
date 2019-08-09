import picamera
import datetime as dt
import subprocess

recording_time = 10
fps = 10
quality = 32

camera = picamera.PiCamera(resolution=(1280, 720), framerate=fps)
# buffer more seconds than we actually will save
stream = picamera.PiCameraCircularIO(camera, seconds=recording_time * 2)

camera.annotate_background = picamera.Color('black')
camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
camera.start_recording(stream, format='h264', quality=quality)

while True:
    start = dt.datetime.now()

    while (dt.datetime.now() - start).seconds < recording_time:
        camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        camera.wait_recording(0.2)
    stream.copy_to('pivideo.h264', seconds=recording_time)
    
    subprocess.Popen(['./box.sh', str(fps)])

camera.stop_recording()
