# Overseer Broadcast

A security camera system for a network of Raspberry Pi cameras. This streams one or more Raspberry Pi Camera module live feeds (on a ~10-20 second delay) to be viewable in your web browser!

# Architecture
There are two run modes, one to host a Nodejs web server which displays video streams (the 'overseer' server), and another to record from the camera (a 'broadcasting' server). There should be one overseer server, but there can be multiple broadcast servers. You could probably host the overseer server from one of the broadcast servers, but I haven't tested that configuration.

The recording servers will constantly record and save ten seconds of video at a time, with each clip overwriting the same file in a directory nginx can serve from.
When the next segment of video is available, the broadcasting server will notify the overseer server of a new segment, which will then retrieve the next segment of video and send it to each client watching the streams so it appears as a constant stream of video.
 
# Setup
 
`MP4Box`, [`Nodejs`](https://nodejs.org/en/) and [`forever`](https://github.com/foreversd/forever) are required on each machine this is used on. On every broadcasting server `curl`, and `nginx` are required. Static IPs should be used for every machine.

## Config
On the overseer server a `config.json` is needed at the root level of the git clone, with IPs of each camera Raspberry Pi:
```
{
 "broadcasters": [
   {
     "ip": "192.168.1.180"
   },
   {
     "ip": "192.168.1.181"
   }
 ]
}
```
Additionally you will need to run `npm install` to install the web server's dependencies.

On each broadcasting server a `config.json` is needed like this:
```
{
    "overseer-server": "192.168.1.200",
    "save-directory": /mnt/overseer-broadcast"
}
```
The `save-directory` should be a web root configured on an nginx server. Since it's saving files constantly you may want to make a small (~32MB) tmpfs ram disk for this purpose.

You may need to add these caching related headers to your nginx config:
```
add_header Cache-Control "no-cache, no-store, must-revalidate";
add_header Pragma "no-cache";
add_header Expires "0";
```

## Running
On the overseer machine run `npm start`

On each broadcaster run `npm run broadcast`

Go to http://[overseer-host-or-ip]:3200/ in your web browser.

# Future

Currently you can only view the camera streams live, eventually I'd like to add occasional snapshots, a day of recorded video to be able to seek through and download, and possibly motion detection.

If anyone uses this project, please reach out to me with what's important for you!
