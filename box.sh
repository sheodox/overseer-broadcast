#!/usr/bin/env bash
touch video/stream.mp4
rm video/stream.mp4
MP4Box -add pivideo.h264:fps=$1 video/stream.mp4
rm pivideo.h264
