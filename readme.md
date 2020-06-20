# Overseer Broadcast

A security camera system for a network of Raspberry Pi cameras. This streams one or more Raspberry Pi Camera module live feeds (on a ~10-20 second delay) to be viewable in your web browser!

# Architecture
There are two run modes, one to host a Nodejs web server which displays video streams (the 'overseer' server), and another to record from the camera (a 'broadcasting' server). There should be one overseer server, but there can be multiple broadcast servers. You could probably host the overseer server from one of the broadcast servers, but I haven't tested that configuration.

The recording servers will constantly record and save ten seconds of video at a time, with each clip overwriting the same file in a directory nginx can serve from.
When the next segment of video is available, the broadcasting server will notify the overseer server of a new segment, which will then retrieve the next segment of video and send it to each client watching the streams so it appears as a constant stream of video.
 
# Setup
 
## Overseer Server

Requirements:

* `nodejs`
* `forever`
* `ffmpeg`
* `MP4Box`

## Broadcasting Server

[Specific requirements and setup are detailed in the broadcasting readme.](https://github.com/sheodox/overseer-broadcast/blob/master/broadcaster-src/README.md)

## Config
On the overseer server a `config.json` is needed at the root level of the git clone, with IPs of each camera Raspberry Pi. You will also need a Dark Sky weather API key and coordinates for your location (Dark Sky API calls should not exceed ~300 per day).
```
{
  "weather": {
    "apiKey": "somethingsecret",
    "latitude": 40.6993,
    "longitude": -74.0237
  }
  "archives": {
    "daysToKeep": 5
  }
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

## Running
On the Overseer server run `npm start`

Go to http://[overseer-host-or-ip]:3200/ in your web browser.

# Future

Currently you can only view the camera streams live, eventually I'd like to add occasional snapshots, a day of recorded video to be able to seek through and download, and possibly motion detection.

If anyone uses this project, please reach out to me with what's important for you!
