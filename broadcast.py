import picamera
import datetime as dt
import os

recording_time = 10

camera = picamera.PiCamera(resolution=(1280, 720), framerate=12)
stream = picamera.PiCameraCircularIO(camera, seconds=recording_time)

camera.annotate_background = picamera.Color('black')
camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
camera.start_recording(stream, format='h264', quality=32)

while True:
    start = dt.datetime.now()

    while (dt.datetime.now() - start).seconds < recording_time:
        camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        camera.wait_recording(0.2)
    stream.copy_to('pivideo.h264', seconds=recording_time)
    os.system('touch video/stream.mp4')
    os.system('rm video/stream.mp4')
    os.system('MP4Box -add pivideo.h264:fps=12 video/stream.mp4')
    os.system('rm pivideo.h264')

camera.stop_recording()
