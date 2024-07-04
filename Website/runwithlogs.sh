#!/bin/bash

nohup gunicorn -w 4 -b 0.0.0.0:8000 main:app > /home/ubuntu/logs/cloudmain/8000.log 2> /home/ubuntu/logs/cloudmain/8000.err < /dev/null &
nohup gunicorn -w 4 -b 0.0.0.0:8001 main:app > /home/ubuntu/logs/cloudmain/8001.log 2> /home/ubuntu/logs/cloudmain/8001.err < /dev/null &
nohup gunicorn -w 4 -b 0.0.0.0:8002 main:app > /home/ubuntu/logs/cloudmain/8002.log 2> /home/ubuntu/logs/cloudmain/8002.err < /dev/null &
nohup gunicorn -w 4 -b 0.0.0.0:8003 main:app > /home/ubuntu/logs/cloudmain/8003.log 2> /home/ubuntu/logs/cloudmain/8003.err < /dev/null &