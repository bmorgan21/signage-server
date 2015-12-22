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

sudo apt-get install supervisor

# /etc/supervisor/conf.d/signage-server.conf
[program:server]
command = /usr/local/bin/node server.js
directory = /home/pi/code/signage-server

sudo nano /etc/modprobe.d/8192cu.conf

# Disable power management
options 8192cu rtw_power_mgnt=0 rtw_enusbss=0

sudo su

nano /root/wifi_recover.sh

keepalive_host='10.34.101.1'

ping -q -c1 $keepalive_host >> /dev/null

if [ "$?" -ne "0" ]; then
        echo "`date` WIFI DOWN" >> wifi_log.txt
        ifdown wlan0
        rmmod 8192cu
        modprobe 8192cu
        ifup wlan0
        echo "`date` WIFI UP" >> wifi_log.txt
fi


chmod +x wifi_recover.sh

crontab -e

*/5 * * * * /root/wifi_recover.sh

# set up screen
sudo apt-get install xautomation

@epiphany-browser "10.34.101.178:8080/?id=all.engineering.firecat"
@xte "sleep 15" "key F11" "mousemove 0 0"

# prevent monitor from sleeping (https://www.raspberrypi.org/forums/viewtopic.php?f=91&t=57552)
sudo apt-get install xscreensaver

disable screen saver

# set timezone correctly here
https://www.raspberrypi.org/documentation/configuration/raspi-config.md

# disable overscan
http://www.webtechgadgetry.com/make-raspberry-pi-use-full-resolution-monitor/
