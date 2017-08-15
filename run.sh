#!/usr/bin/env bash

if [ -a "options.sh" ]; then
    source "options.sh"
fi

nohup npm run devel &
