import os
import picamera
import datetime as dt
import subprocess
import json

recording_time = 10
fps = 10
quality = 32
silence_logs = True
save_directory = '/broadcast-temp'

overseer_server = os.environ['OVERSEER_SERVER']
if not overseer_server:
    print("Missing .env with OVERSEER_SERVER defined.")
    sys.exit(1)

print("Overseer Broadcast camera running!")

camera = picamera.PiCamera(resolution=(1280, 720), framerate=fps)
# buffer more seconds than we actually will save
stream = picamera.PiCameraCircularIO(camera, seconds=recording_time)

camera.annotate_background = picamera.Color('black')
camera.start_recording(stream, format='h264', quality=quality)
start = dt.datetime.now()

while True:
    while (dt.datetime.now() - start).seconds < recording_time:
        camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %I:%M:%S %p')
        camera.wait_recording(0.1)
    stream.copy_to(os.path.join(save_directory, 'pivideo.h264'), seconds=recording_time)
    # requesting a keyframe now will mean it will have a key frame to split the video at,
    # instead of having to throw away a section of video until the first keyframe for the next segment
    start = dt.datetime.now()
    camera.request_key_frame()
    
    # ignore all logs, seems we can't just ignore stdout because mp4box logs stdout to stderr,
    # without this, the forever logs will grow and eventually fill the entire disk
    log_location = subprocess.DEVNULL if silence_logs else None
    subprocess.Popen(['broadcaster-src/box.sh', str(fps), overseer_server, save_directory], stderr=log_location, stdout=log_location)

camera.stop_recording()
