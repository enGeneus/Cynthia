# !/usr/bin/env python

from flask import render_template, send_from_directory, request, jsonify
from app import app
from app import logic
import neo4j
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
    results = ""
    cynthia = ""
    if 'skip_all' in form_data:
        results = form_data['results']
        if 'query' not in form_data:
            if 'cynthia' in form_data:
                query = logic.build_query(form_data['cynthia'])
            else:
                query = ""
        else:
            query = form_data['query']
        cynthia = form_data['cynthia']
    elif 'skip_build' in form_data :
        query = form_data['query']
    else:
        cynthia = form_data['json']
        query = logic.build_query(form_data['json'])
    return render_template("results.html", query=query, results=results, cynthia=cynthia)


@app.route('/execute_query', methods=['POST'])
def execute_query():
    form_data = request.form
    query = form_data['query']
    result_json = logic.get_query_results(query)
    return result_json


@app.route('/ajax/get_relation_labels', methods=['POST'])
def get_relation_labels():
    return json.dumps(logic.get_name_of_relations_on_relation_general_info())


@app.route('/ajax/node_properties')
def get_node_keys():
    keys = logic.get_node_properties_keys(request.args.get('nodeType'))
    return jsonify(keys)


@app.route('/ajax/import_json', methods=['POST'])
def import_json():
    file = request.files['cynthia_json']
    text = file.read()
    return text


@app.route('/ajax/import_results', methods=['POST'])
def import_results():
    file = request.files['results_json']
    text = file.read()
    return text


@app.route('/ajax/export_cypher_query', methods=['POST'])
def export_cypher():
    form_data = request.form
    query = logic.build_query(form_data['json'])
    return query
