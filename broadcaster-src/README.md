# Camera Pi Setup
1. Install `docker` and `docker-compose`
2. Setup the camera to be accessible from within docker:
 create a file at /etc/udev/rules.d/99-camera.rules with the text: `SUBSYSTEM=="vchiq",MODE="0666"`
 ([Instructions from here](https://www.losant.com/blog/how-to-access-the-raspberry-pi-camera-in-docker))
3. Create a .env file with an `OVERSEER_SERVER` key which is the IP/host of the Overseer server, the machine
 that hosts the website.
4. From within this folder run `./start_broadcast.sh`
