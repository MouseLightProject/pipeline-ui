#!/usr/bin/env bash

LAST_NODE_ENV=${NODE_ENV}

export NODE_ENV=production

npm run devel

export NODE_ENV=${LAST_NODE_ENV}

sleep infinity
