# !/usr/bin/env python

from neo4j.v1 import GraphDatabase, basic_auth
import config


def query_db(query):
    db_url = "bolt://{host:s}:{port:d}".format(**{'host': config.EXTERNAL_DB_HOST, 'port': config.EXTERNAL_DB_PORT})
    driver = GraphDatabase.driver(db_url, auth=basic_auth(config.EXTERNAL_DB_USER, config.EXTERNAL_DB_PASS))
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
    species=[]
    species.append('mus musculus')
    species.append('human')
    return species


# TO DO: Complete this method building the query, executing it and sending back the results
def build_and_query(form_data):
    return form_data
