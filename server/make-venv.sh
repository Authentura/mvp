#!/usr/bin/env bash

set -xe

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
