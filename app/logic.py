# !/usr/bin/env python

from neo4j.v1 import GraphDatabase, basic_auth
import config
import json


def query_db(query):
    db_url = "bolt://{host:s}:{port:d}".format(**{'host': config.GRAPH_DB_HOST, 'port': config.GRAPH_DB_PORT})
    driver = GraphDatabase.driver(db_url, auth=basic_auth(config.GRAPH_DB_USER, config.GRAPH_DB_PASS))
    session = driver.session()
    result = session.run(query)
    session.close()
    return result


def get_node_labels():
    query = "MATCH (n) RETURN distinct labels(n) as label"
    result = query_db(query)
    label_list = []
    for record in result:
        label_list.append(record["label"][0])
    return label_list


def get_node_properties_keys(node_type):
    query = "MATCH (n:{type:s}) RETURN distinct keys(n) as propertyKeys".format(**{'type': node_type})
    result = query_db(query)
    property_list = []
    for record in result:
        for key in record["propertyKeys"]:
            if key not in property_list:
                property_list.append(key)
    return property_list


def get_node_relations(node_type, property_key, property_value):
    query = "MATCH (n:{type:s})-[r]->() WHERE n.{key:s}='{value:s}' RETURN type(r) as relations"\
        .format(**{'type': node_type, 'key': property_key, 'value': property_value})
    result = query_db(query)
    result_list = []
    for record in result:
        result_list.append(record["relations"])
    return result_list


def get_name_of_relations_on_relation_general_info():
    query = "MATCH (a:Relation_general_info) RETURN a.name as name"
    result = query_db(query)
    result_list = []
    for record in result:
        result_list.append(record["name"])
    return result_list


def get_node_whit_common_relation(node_type, relation_type, node_name):
    query = "MATCH (a:{node_type:s})-[r:{relation_type}]->(b) WHERE a.name = '{node_name}' RETURN b.name as rel_name"\
        .format(**{'node_type': node_type, 'relation_type': relation_type, 'node_name': node_name})
    result = query_db(query)
    result_list = []
    for record in result:
        result_list.append(record["rel_name"])
    return result_list


# TO DO: Complete this method acquiring species list from db
def get_species():
    species = list()
    species.append('mus musculus')
    species.append('human')
    return species


# TO DO: Complete this method building the query, executing it and sending back the results
def build_and_query(form_data):
    # j = json.loads(
    # '{"startingNodeType": "microRNA", "specie": "human", "relations": [{"relationName": "miRTarBase", "cutoffValue": ""},{"relationName": "RNA22v2", "cutoffValue": ""},{"relationName": "PicTar7", "cutoffValue": ""},{"relationName": "PicTar13", "cutoffValue": ""},{"relationName": "TargetScan", "cutoffValue": ""}], "properties": [{"propertyName": "accession", "values": ["asfasf","asfdasda","danda","asdad","42342"]},{"propertyName": "name", "values": ["weRWERFAGFAS","efadsfsadf","FASDFSADF","Sdfasdfasf","fFsdfs"]},{"propertyName": "species", "values": ["DSFA","ASDFASDF","ASDFASDF"]},{"propertyName": "mirbase_link", "values": ["sdfasdfasdf","asdfasdfas","asfasdfsda"]}]}')

    j = json.loads(form_data)

    # numero di relazioni
    rel_num = 0
    # numero di proprietà
    prop_num = 0

    # controlla se ci sono le proprietà
    if j['properties'] != []:
        prop_num = (len(j['properties']))

    # parte statica della query
    relation_part = "MATCH (n:" + j['startingNodeType'] + ")"

    # controlla se ci sono le relazioni
    if j['relations'] != []:
        rel_num = (len(j['relations']))
        relation_part = relation_part + "-[r:"

    # aggiunta delle relazioni alla query
    for i in range(rel_num):

        if rel_num == 1:
            relation_part = relation_part + j['relations'][i]['relationName'] + "]->"

        if rel_num > 1:
            relation_part = relation_part + j['relations'][i]['relationName'] + "|"
            if i == rel_num - 1:
                relation_part = relation_part[:-1]

    if rel_num > 1:
        relation_part = relation_part + "]->"

    # dizionario per le property, indica per ogni proprietà (chiave) quanti valori possiede (valore)
    diz_prop = {}

    relation_part = relation_part + " (t)"

    if rel_num == 0:
        relation_part = relation_part[:-3]

    if rel_num > 1:
        relation_part = relation_part + " WHERE ("
    else:
        relation_part = relation_part + " WHERE "

    if prop_num == 0:
        relation_part = relation_part[:-7]

    # aggiornamento del dizionario
    for i in range(prop_num):
        prop = (len(j['properties'][i]['values']))
        upd = {i: prop}
        diz_prop.update(upd)

    where_part = ""

    # aggiunta delle proprietà alla query
    for i in range(len(diz_prop)):

        for k in range(int(diz_prop[i])):

            if diz_prop[i] == 1:
                where_part = where_part + "n." + j['properties'][i]['propertyName'] + " = " + "'" + \
                             j['properties'][i]['values'][k] + "' "

            else:
                where_part = where_part + "n." + j['properties'][i]['propertyName'] + " = " + "'" + \
                             j['properties'][i]['values'][k] + "'" + " OR "

        if int(diz_prop[i]) > 1:
            where_part = where_part[:-4]

        if len(diz_prop) > 1 and i != len(diz_prop) - 1:
            where_part = where_part + ") AND ("

    if rel_num > 1:
        where_part = where_part + ") "

    return_part = "RETURN n"

    if rel_num > 0:
        return_part = return_part+",r,t"


    query = relation_part + where_part + return_part


    #ciao
    return query