# Giess-o-mat-Webserver

sudo cp giessomat-webserver.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl status giessomat-webserver.service
journalctl -u giessomat-webserver