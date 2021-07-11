#!/usr/bin/env bash

# curl is used to install docker using the docker convenience script and to test
# to see if this device has permissions to broadcast to overseer, need to make sure we have it
which curl > /dev/null
if [[ $? -gt 0 ]]; then
	echo "curl missing! You must install curl first then re-run this script"
	exit 1
fi

if [ ! -f .env ]; then
	echo "-- creating .env file --"
	echo "What is the IP or hostname of the Overseer server? (e.g. example.com or 192.168.1.150)"
	read overseer_host

	echo "Enter an integration token generated by registering this camera"
	read overseer_token

	echo "Enter a time zone (tz database format, e.g. America/Chicago)"
	echo "(see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)"
	read timezone
	
	#attempt to verify that this pi is an allowed broadcaster
	curl -sf -H "Authorization: Bearer ${overseer_token}" "http://$overseer_host/broadcaster/verify" > /dev/null
	overseer_verify_code=$?

	if [[ $overseer_verify_code -eq 6 ]]; then
		echo "ERROR: Could not connect to '$overseer_host'. Is that the right hostname?"
		exit 1
	elif [[ $overseer_verify_code -eq 22 ]]; then
		echo "WARNING: The Overseer server reports this as an unknown device!"
		echo "An integration token must be generated for this device"
		echo "or its recordings will be rejected!"
		echo ""
		echo "Installation will continue in ten seconds."

		# warn but don't exit. they could be using ethernet to setup the pi and plan to use
		# wifi when broadcasting. things could be set up properly even though the curl shows
		# that it's not valid currently.
		sleep 10
	elif [[ $overseer_verify_code -gt 0 ]]; then
		echo "ERROR: An unexpected error occurred trying to verify the overseer"
		echo "server broadcast host permissions. curl returned exit code $overseer_verify_code"
		exit 1
	fi
	
	cat > .env <<EOL
OVERSEER_SERVER=${overseer_host}
OVERSEER_TOKEN=${overseer_token}
TZ=${timezone}
SILENCE_LOGS=true
EOL
fi

which docker > /dev/null
if [[ $? -gt 0 ]]; then
	echo "-- installing docker --"
	# installing docker is only supported via the convenience script on raspbian
	curl -fsSL https://get.docker.com | sudo sh
	sudo usermod -aG docker $(whoami)
fi

which docker-compose > /dev/null
if [[ $? -gt 0 ]]; then
	echo "-- installing docker-compose --"
	sudo pip3 install docker-compose
fi

if [ ! -f /etc/udev/rules.d/99-camera.rules ]; then
	echo "-- adjusting camera rules --"
	echo 'SUBSYSTEM=="vchiq",MODE="0666"' > 99-camera.rules
	sudo mv 99-camera.rules /etc/udev/rules.d
fi

echo "Install complete! Restart this Pi and run './start_broadcast.sh'"