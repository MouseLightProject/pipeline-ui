#!/usr/bin/env bash

if [ -a "options.sh" ]; then
    source "options.sh"
fi

nohup npm run devel &

sleep 2

chmod 775 nohup.out
