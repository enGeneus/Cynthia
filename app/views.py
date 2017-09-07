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




@app.route('/build_query_v2')
def query_page_v2():
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
    return render_template("build_query_v2.html",
                           node_labels=node_labels,
                           species=species,
                           relations=relations,
                           message=message)


@app.route('/results', methods=['POST'])
def query_handler():
    form_data = request.form
    results = logic.build_and_query(form_data['json'])
    return render_template("results.html", results=results)


@app.route('/executes_query', methods=['POST'])
def executes_query():
    form_data = request.form
    results = form_data['query']
    results=html.unescape(results)
    #TEMP
    #query_results=logic.query_db(results)
    query_results=logic.query_db("match(n:microRNA {name:'mmu-let-7g-3p'})-[r]->(t) RETURN n,r,t LIMIT 25")


    #for i in query_results.data():
    #    return render_template("empty.html", query_results=html.unescape(json.dumps(i)))
    #while(query_results.hasNext()):
    #toreturn=""
    #for i in query_results.records():
    #    toreturn=toreturn+i.values()
    #return render_template("empty.html", query_results=html.unescape(toreturn))
    #for r in query_results:
    #return render_template("empty.html", query_results=(query_results.data()))


    return render_template("empty.html", query_results=logic.build_json_from_query_results(query_results))
    #return render_template("empty.html", query_results=(query_results.keys()))


@app.route('/error')
def error_page():
    return render_template("error.html")


@app.route('/ajax/node_properties')
def get_node_keys():
    keys = logic.get_node_properties_keys(request.args.get('nodeType'))
    return jsonify(keys)
