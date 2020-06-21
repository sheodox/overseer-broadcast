#!/usr/bin/env bash
MP4Box -dash 15000 -add $3/pivideo.h264:fps=$1 $3/stream.mp4
rm $3/pivideo.h264

# attempt to retry if sending the video fails, make up for a flaky connection
for i in $(seq 1 4); do
	curl -s --data-binary "@$3/stream_dashinit.mp4" \
		-H "Content-Type: video/mp4" \
		--connect-timeout 1 \
		http://$2:3200/update

	curl_exit_code=$?

	if [ $curl_exit_code -eq 0 ]
	then
		exit 0
	fi

	sleep 1
	echo "curl exited with code $curl_exit_code, retrying"
done
