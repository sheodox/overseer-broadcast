#!/usr/bin/env bash
touch video/stream.mp4
rm video/stream.mp4
MP4Box -dash 15000 -add pivideo.h264:fps=$1 video/stream.mp4
rm pivideo.h264
curl http://$2:3200/update
