#!/usr/bin/env bash

export DEBUG=pipeline*

logName=$(date '+%Y-%m-%d_%H-%M-%S');

mkdir -p /var/log/pipeline

node server/pipelineClientServer.js &> /var/log/pipeline/coordinator-client-${logName}.log
