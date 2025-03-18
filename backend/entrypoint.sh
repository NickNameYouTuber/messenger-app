#!/bin/sh
export FLASK_APP=app.py
flask db upgrade
python app.py

