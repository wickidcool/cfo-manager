#!/bin/bash

# Workaround for Node.js 25+ localStorage security error
# This script runs jest without the permission model restrictions

# Run jest with Node options
node --run test-no-permission 2>/dev/null || \
NODE_ENV=test jest "$@"

