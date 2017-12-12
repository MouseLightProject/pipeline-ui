#!/usr/bin/env bash

if [ -a "options.sh" ]; then
    source "options.sh"
fi

nohup node server/pipelineClientServer.js &

sleep 2

chmod 775 nohup.out
