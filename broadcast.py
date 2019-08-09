import picamera
import datetime as dt

camera = picamera.PiCamera(resolution=(1280, 720), framerate=12)
camera.start_preview()
camera.annotate_background = picamera.Color('black')
camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
camera.start_recording('pivideo.h264', quality=28)
start = dt.datetime.now()
while (dt.datetime.now() - start).seconds < 5:
    camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    camera.wait_recording(0.2)
camera.stop_recording()
