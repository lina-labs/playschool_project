#!/usr/bin/python3
import os
from flask import Flask, render_template

app = Flask(__name__, template_folder = 'template/')

@app.route('/scenses/<id>')
def scenses(id):
    tmpl_file = 'test.tmpl'
    play = dict()
    play['name'] = id
    play['next'] = ''
    if int(id) % 2 == 0:
        play['next'] = 'even'
    return render_template(tmpl_file, play=play)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9090)

