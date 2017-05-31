# !/usr/bin/env python

from flask import render_template, send_from_directory, request, jsonify
from app import app
from app import logic


@app.route('/assets/<path:path>')
def send_asset(path):
    return send_from_directory('templates/assets/', path)


@app.route('/')
@app.route('/index')
def index_page():
    return render_template("cynthia.html")


@app.route('/build_query')
def query_page():
    node_labels = logic.get_node_labels()
    return render_template("build_query.html", node_labels=node_labels)


@app.route('/results', methods=['POST'])
def query_handler():
    form_data = request.form
    results = logic.build_and_query(form_data)
    return render_template("results.html", results=results)


@app.route('/error')
def error_page():
    return render_template("error.html")


@app.route('/ajax/node_properties')
def get_node_keys():
    keys = logic.get_node_properties_keys(request.args.get('nodeType'))
    return jsonify(keys)
