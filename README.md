# server setup
https://learn.adafruit.com/node-embedded-development/installing-node-dot-js

# these may not be needed
sudo apt-get update
sudo apt-get upgrade

curl -sLS https://apt.adafruit.com/add | sudo bash

sudo apt-get install node

npm install websocket
npm install httpdispatcher
npm install mime

curl -H "Content-Type: application/json" -X POST -d '{"package": "system", "type":"utf8","utf8Data":"!!Hello World"}' http://localhost:8080/message


sudo apt-get install python-pip

# screen setup
sudo apt-get install chromium

To get Chromium to autostart follow these instructions

Type "sudo nano /etc/xdg/lxsession/LXDE-pi/autostart"
Add the following line: /usr/bin/chromium --kiosk --ignore-certificate-errors --disable-restore-session-state "http://10.34.101.178:8080/?id=all.engineering.cod-magic"
Press Ctrl-X
Press "Y"
Press "Enter"

# prevent monitor from sleeping (https://www.raspberrypi.org/forums/viewtopic.php?f=91&t=57552)
sudo apt-get install xscreensaver

disable screen saver

# set timezone correctly here
https://www.raspberrypi.org/documentation/configuration/raspi-config.md
