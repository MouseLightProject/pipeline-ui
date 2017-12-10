#!/usr/bin/env bash

export DEBUG=pipeline*

logName=$(date '+%Y-%m-%d%H-%M-%S');

node server/pipelineClientServer.js &> /var/log/pipeline/coordinator-ui-${logName}.log

sleep infinity
