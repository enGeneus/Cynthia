from flask import render_template, send_from_directory, request
from app import app


@app.route('/assets/<path:path>')
def send_asset(path):
    return send_from_directory('templates/assets/', path)


@app.route('/')
@app.route('/index')
def index():
    return render_template("cynthia.html",
                           title='Home')


@app.route('/query')
def query():
    return render_template("query.html")


@app.route('/results', methods=['GET', 'POST'])
def results():
    var = request.form.get("request")
    return render_template("results.html", requested_string=var)


@app.route('/error')
def error():
    return render_template("error.html")