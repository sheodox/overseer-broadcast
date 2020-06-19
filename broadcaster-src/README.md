1. Install docker and docker-compose
2. Setup the camera to be accessible from within docker
 (Instructions originally from https://www.losant.com/blog/how-to-access-the-raspberry-pi-camera-in-docker)
 create a file at /etc/udev/rules.d/99-camera.rules with the text: SUBSYSTEM=="vchiq",MODE="0666"
3. ./start_broadcast.sh
