#!/bin/bash

nohup gunicorn -w 4 -b 0.0.0.0:8000 main:app > /dev/null 2> /dev/null < /dev/null &
nohup gunicorn -w 4 -b 0.0.0.0:8001 main:app > /dev/null 2> /dev/null < /dev/null &
nohup gunicorn -w 4 -b 0.0.0.0:8002 main:app > /dev/null 2> /dev/null < /dev/null &
nohup gunicorn -w 4 -b 0.0.0.0:8003 main:app > /dev/null 2> /dev/null < /dev/null &