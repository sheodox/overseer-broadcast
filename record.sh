#!/bin/bash

touch video/stream.mp4
while true
do
        python3 broadcast.py
        rm video/stream.mp4
        # Wrap the raw video with an MP4 container: 
        MP4Box -add pivideo.h264:fps=12 video/stream.mp4
        # Remove the source raw file, leaving the remaining pivideo.mp4 file to play
        rm pivideo.h264
done
