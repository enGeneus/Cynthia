# !/usr/bin/env python

from flask import render_template, send_from_directory, request, jsonify
from app import app
from app import logic
import neo4j


@app.route('/assets/<path:path>')
def send_asset(path):
    return send_from_directory('templates/assets/', path)


@app.route('/')
@app.route('/index')
def index_page():
    return render_template("cynthia.html")


@app.route('/build_query')
def query_page():
    try:
        node_labels = logic.get_node_labels()
        message = {}
    except neo4j.exceptions.ServiceUnavailable:
        node_labels = []
        message = {'type': 'error', 'message': 'NO_CONN'}
    return render_template("build_query.html", node_labels=node_labels, message=message)


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


@app.route('/ajax/relations_form')
def get_node_relations():
    relations = logic.get_name_of_relations_on_relation_general_info()
    return render_template("form_elements/relations_filter.html", relations=relations)


@app.route('/ajax/property_form')
def send_form_element():
    return render_template("form_elements/property_filter.html")
