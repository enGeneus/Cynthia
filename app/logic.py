# !/usr/bin/env python

from neo4j.v1 import GraphDatabase, basic_auth
import config
import json
import html


def query_db(query):
    db_url = "bolt://{host:s}:{port:d}".format(**{'host': config.GRAPH_DB_HOST, 'port': config.GRAPH_DB_PORT})
    driver = GraphDatabase.driver(db_url, auth=basic_auth(config.GRAPH_DB_USER, config.GRAPH_DB_PASS))
    session = driver.session()
    result = session.run(query)
    session.close()
    return result


def get_query_results(query):
    query_results = query_db(html.unescape(query))
    result_json = build_json_from_query_results(query_results)
    return result_json


def build_json_from_query_results(query_results):
    #ogni record è composto da (non sempre): una n, una r, una t che sono in keys()
    emptystr="{ 'data' : {"
    counter=0    
    for i in query_results.records():

        emptystr+=" 'record_"+str(counter)+"' : { "
        
        for contnrt in range(len(i.keys())):
            chiave = i.keys()[contnrt]

            properties = i.values()[contnrt].properties

            #0:1 because it can be n0, n1..
            if chiave[0:1] == "n":
                #is a node
                nome = i.values()[contnrt].labels        
            elif chiave[0:1] == "r":
                #is a relation
                nome = i.values()[contnrt].type        
            elif chiave[0:1] == "t":
                #is a target
                nome = i.values()[contnrt].labels        

            emptystr+=str("'result_"+str(contnrt)+"' : ")
            emptystr+=str("{ 'result_type' : ")
            emptystr+=str("'"+str(chiave[0:1])+"', ")
            emptystr+=str("'label' : ")
            emptystr+=str("'"+str(nome)[2:-2]+"', ")
            emptystr+=str("'properties' : ")
            emptystr+=str(properties)
            emptystr+=str("},")
            #for each key i have a record

        emptystr=emptystr[0:-1]
        counter+=1
        emptystr+="},"

    emptystr=emptystr[0:-1]
    emptystr+="}}}"
    return emptystr[0:-1].replace("'", '"')
    

def transform_entry(entry):

    # This transform is used for just nodes as well so first check to see if there is a relation
    if 'relation' not in entry:
        node = entry
        relation = {'weight':1}
    elif entry['relation'] is None:
        node = entry['node']
        relation = {'weight':1}
    else:
        node = entry['node']
        relation = entry['relation']

    # Skip anything that isn't a dict or doesn't have an ntype property (bookmarks are skipped here)
    if type(node) is not dict or 'ntype' not in node:
        return None
    if node['ntype'] == 'user':
        return {'user': {'name': node['name'], 'user_id': node['userId'], 'weight': relation['weight']}}
    elif node['ntype'] == 'a':
        return {'answer': {'post_id': node['postId'], 'favorite_count': node['favoriteCount'], 'score': node['score'], 'weight': relation['weight']}}
    elif node['ntype'] == 'q':
        return {'question': {'post_id': node['postId'], 'favorite_count': node['favoriteCount'], 'score': node['score'], 'weight': relation['weight']}}
    elif node['ntype'] == 'tag':
        return {'tag': {'name': node['tagName'], 'weight': relation['weight']}}
    else:
        return None


def get_node_labels():
    query = "MATCH (n:Node_info) RETURN n.name "
    result = query_db(query)
    label_list = []
    for record in result:
        if record["n.name"] != "Target":
            label_list.append(record["n.name"])
    return label_list


def get_node_properties_keys(node_type):
    query = "MATCH (n:{type:s}) RETURN distinct keys(n) as propertyKeys".format(**{'type': node_type})
    result = query_db(query)
    property_list = []
    for record in result:
        for key in record["propertyKeys"]:
            if key not in property_list and key != "species":
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


# TO DO: Complete this method acquiring species list from db
def get_species():
    species = list()
    species.append('mus musculus')
    return species


def build_query(data):
    j = json.loads(data)

    query = ""

    rel_num = 0

    # aggiorna il numero di relazioni
    if j['relations'] != []:
        rel_num = (len(j['relations']))

    start_node_num = 0

    # aggiorna il numero di nodi di partenza (precendete al where)
    if j['startingNodes'] != []:
        start_node_num = (len(j['startingNodes']))

    # costruzione della prima parte della query
    for i in range(start_node_num):

        if i == 0:
            query = query + "MATCH "
        else:
            query = query + " MATCH "

        if rel_num > 0:
            query = query + "(n" + str(i) + ":" + j['startingNodes'][i]['type'] + ")-[r" + str(i) + "]->(t)"
        else:
            query = query + "(n" + str(i) + ":" + j['startingNodes'][i]['type'] + ")"

    # aggiunta delle clausole sui nodi di partenza (se sono presenti)
    num_of_values = 0

    for i in range(start_node_num):
        if j['startingNodes'][i]['properties'] != []:
            num_of_values = num_of_values + len(j['startingNodes'][i]['properties'][0]['values'])

    if num_of_values != 0 or rel_num != 0:

        query = query + " WHERE "

        if num_of_values != 0:
            for i in range(start_node_num):

                if j['startingNodes'][i]['properties'] != []:
                    num_of_value = (len(j["startingNodes"][i]["properties"][0]["values"]))
                else:
                    num_of_value = 0

                if num_of_value != 0:
                    query = query + "("

                if num_of_value == 1:
                    query = query[0:-1]

                for k in range(num_of_value):

                    if num_of_value == 1:
                        query = query + "n" + str(i) + "." + j['startingNodes'][i]['properties'][0]['name'] + " = '" + \
                                j['startingNodes'][i]['properties'][0]['values'][k] + "'"
                    elif num_of_value > 1:
                        query = query + "n" + str(i) + "." + j['startingNodes'][i]['properties'][0]['name'] + " = '" + \
                                j['startingNodes'][i]['properties'][0]['values'][k] + "' OR "

                if num_of_value > 1 and k == num_of_value - 1:
                    query = query[0:-4]

                if num_of_value != 0:
                    query = query + ")"

                if num_of_value == 1:
                    query = query[0:-1]

                if num_of_value != 0:
                    query = query + " AND "

                if i == start_node_num - 1:
                    query = query[0:-5]

        # aggiunta delle clausole sulle relazioni (se sono presenti)

        if rel_num > 0:

            if num_of_values != 0:
                query = query + " AND "

            for i in range(start_node_num):

                query = query + "("

                for a in range(rel_num):

                    if j['relations'][a]['cutoffValue'] == "":
                        query = query + "r" + str(i) + ".name = '" + j['relations'][a]['relationName'] + "'"
                    else:
                        query = query + "(r" + str(i) + ".name = '" + j['relations'][a][
                            'relationName'] + "' AND r" + str(i) + ".score > '" + j['relations'][a][
                                    'cutoffValue'] + "')"

                    query = query + " OR "

                    if a == rel_num - 1:
                        query = query[0:-4]

                query = query + ")"

                query = query + " AND "

                if i == start_node_num - 1:
                    query = query[0:-4]

    if num_of_values != 0 and rel_num > 0:
        query = query + "RETURN "
    else:
        query = query + " RETURN "

    for i in range(start_node_num):
        query = query + "n" + str(i) + ","

    if rel_num > 0:
        for i in range(start_node_num):
            query = query + "r" + str(i) + ","
    if start_node_num > 0 and rel_num > 0:
        query = query + "t"
    else:
        query = query[0:-1]

    if j["limit"] == -1:
        query = query + " LIMIT 25"
    elif j["limit"] != 0:
        query = query + " LIMIT " + str(j["limit"])

    return query