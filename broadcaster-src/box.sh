#!/usr/bin/env bash
MP4Box -dash 15000 -add $3/pivideo.h264:fps=$1 $3/stream.mp4
rm $3/pivideo.h264
curl http://$2:3200/update
