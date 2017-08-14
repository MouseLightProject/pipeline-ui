#!/usr/bin/env bash

LAST_NODE_ENV=${NODE_ENV}

export NODE_ENV=production

nohup npm run devel &

NODE_ENV=${LAST_NODE_ENV}
