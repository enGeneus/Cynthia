# !/usr/bin/env python

from flask import render_template, send_from_directory, request, jsonify
from app import app
from app import logic
import neo4j
import html
import json


@app.route('/assets/<path:path>')
def send_asset(path):
    return send_from_directory('templates/assets/', path)


@app.route('/')
@app.route('/index')
def index_page():
    return render_template("cynthia.html")


@app.route('/build_query')
def query_page():
    node_labels = []
    species = []
    relations = []
    try:
        node_labels = logic.get_node_labels()
        species = logic.get_species()
        relations = logic.get_name_of_relations_on_relation_general_info()
        message = {}
    except neo4j.exceptions.ServiceUnavailable:
        node_labels = []
        message = {'type': 'error', 'message': 'NO_CONN'}
    return render_template("build_query.html",
                           node_labels=node_labels,
                           species=species,
                           relations=relations,
                           message=message)


@app.route('/results', methods=['POST'])
def query_handler():
    form_data = request.form
    print(form_data)
    if 'skip_build' in form_data :
        query = form_data['query']
    else:
        query = logic.build_query(form_data['json'])
    return render_template("results.html", query=query)


@app.route('/execute_query', methods=['POST'])
def executes_query():
    form_data = request.form
    query = form_data['query']
    query_results=logic.query_db(html.unescape(query))
    result_json = logic.build_json_from_query_results(query_results)
    return result_json

@app.route('/get_labels', methods=['POST'])
def get_labels():
    return json.dumps(logic.get_name_of_relations_on_relation_general_info())


@app.route('/error')
def error_page():
    return render_template("error.html")


@app.route('/ajax/node_properties')
def get_node_keys():
    keys = logic.get_node_properties_keys(request.args.get('nodeType'))
    return jsonify(keys)

@app.route('/ajax/import_json', methods=['POST'])
def import_json():
    file = request.files['file']
    text = file.read()
    return text