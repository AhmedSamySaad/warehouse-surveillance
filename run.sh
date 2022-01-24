#!/bin/bash
pip install virtualenv
cd "${0%/*}"
virtualenv ws-venv
source ws-venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=app.py
export FLASK_ENV=development
python -m flask run