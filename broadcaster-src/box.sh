#!/usr/bin/env bash
MP4Box -dash 15000 -add $3/pivideo.h264:fps=$1 $3/stream.mp4
rm $3/pivideo.h264

curl --data-binary "@$3/stream_dashinit.mp4" \
       	-H "Content-Type: video/mp4" \
       	--retry 3 \
	--retry-connrefused \
	--retry-max-time 7  \
	http://$2:3200/update
