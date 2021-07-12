import os
import picamera
from datetime import datetime
import subprocess
import json
import sys
from dotenv import load_dotenv
load_dotenv()

recording_time = 10
fps = 10
quality = 32
silence_logs = os.environ['SILENCE_LOGS'] == 'true'
save_directory = '/broadcast-temp'

try:
    overseer_server = os.environ['OVERSEER_SERVER']
    overseer_token = os.environ['OVERSEER_TOKEN']
except KeyError as e:
    print(f'Missing .env file with {e.args[0]} defined.')
    sys.exit(1)

print("Overseer Broadcast camera running!")

camera = picamera.PiCamera(resolution=(1280, 720), framerate=fps)
# let it store a tiny bit more than we want to save in a clip
stream = picamera.PiCameraCircularIO(camera, seconds=recording_time + 5)

camera.annotate_background = picamera.Color('black')
camera.start_recording(stream, format='h264', quality=quality)
start = datetime.now()

while True:
    while (datetime.now() - start).seconds < recording_time:
        camera.annotate_text = datetime.now().strftime('%Y-%m-%d %I:%M:%S %p')
        camera.wait_recording(0.1)
    stream.copy_to(os.path.join(save_directory, 'pivideo.h264'))
    # reset the stream buffer since we've saved everything we've already captured.
    # since we're not specifying a 'seconds' property on copy_to it'll capture
    # everything we've recorded, since the video until now has been saved, we want
    # this to start from scratch so it doesn't repeat anything!
    stream.clear()
    start = datetime.now()
    # requesting a keyframe now will mean it will have a key frame to split the video at,
    # instead of having to throw away a section of video until the first keyframe for the next segment
    camera.request_key_frame()
    
    log_location = subprocess.DEVNULL if silence_logs else None
    subprocess.Popen(['./box.sh', str(fps), overseer_server, save_directory, overseer_token], stderr=log_location, stdout=log_location)

camera.stop_recording()
