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



def build_json_from_query_results(query_results):
    #ogni record è composto da (non sempre): una n, una r, una t che sono in keys()
    emptystr="{ 'data' : {"
    counter=0    
    
    for i in query_results.records():

        emptystr+=" 'record_"+str(counter)+"' : { "
        
        for contnrt in range(len(i.keys())):
            chiave = i.keys()[contnrt]

            properties = i.values()[contnrt].properties
        
            if chiave == "n":
                #is a node
                nome = i.values()[contnrt].labels        
            elif chiave == "r":
                #is a relation
                nome = i.values()[contnrt].type        
            elif chiave == "t":
                #is a target
                nome = i.values()[contnrt].labels        

            emptystr+=str("'result_"+str(contnrt)+"' : ")
            emptystr+=str("{ 'result_type' : ")
            emptystr+=str("'"+str(chiave)+"', ")
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
  """
  Turn the given neo4j Node into a dictionary based on the Node's type.
  The raw neo4j Node doesn't serialize to JSON so this converts it into
  something that will.
  @param entry:       the neo4j Node to transform.
  """

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
    return {'user':{'name':node['name'],'user_id':node['userId'], 'weight':relation['weight']}}
  elif node['ntype'] == 'a':
    return {'answer':{'post_id':node['postId'], 'favorite_count':node['favoriteCount'], 'score':node['score'], 'weight':relation['weight']}}
  elif node['ntype'] == 'q':
    return {'question':{'post_id':node['postId'], 'favorite_count':node['favoriteCount'], 'score':node['score'], 'weight':relation['weight']}}
  elif node['ntype'] == 'tag':
    return {'tag':{'name':node['tagName'], 'weight':relation['weight']}}
  else:
    return None


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


    return query


def build_and_query_v2(form_data):
    j = json.loads(form_data)

    query = ""
    rel_num = 0
    if j['relations'] != []:
        rel_num = (len(j['relations']))

    return_part = " RETURN "

    for i in range(len(j['startingNodes'])):

        if i != 0:
            query = query + " WITH t "

        prop_num = 0
        relation_part = ""

        if j['startingNodes'][i]['properties'] != []:
            prop_num = (len(j['startingNodes'][i]['properties']))

        relation_part = "MATCH (n" + str(i) + ":" + j['startingNodes'][i]['type'] + ")"

        if rel_num > 0:
            relation_part = relation_part + "-[r" + ":PicTar|RNA22]-> (t)"

        diz_prop = {}

        if prop_num > 1 or (rel_num > 0 and prop_num > 0):
            relation_part = relation_part + " WHERE ("
        elif (prop_num == 1 and rel_num == 0) or (prop_num == 0 and rel_num >= 1):
            relation_part = relation_part + " WHERE "

        if prop_num == 0 and rel_num == 0:
            relation_part = relation_part[:-7]

        # aggiornamento del dizionario
        for h in range(prop_num):
            prop = (len(j['startingNodes'][i]['properties'][h]['values']))
            upd = {h: prop}
            diz_prop.update(upd)

        where_part = ""

        # aggiunta delle proprietà alla query
        for m in range(len(diz_prop)):

            for k in range(int(diz_prop[m])):

                if diz_prop[m] == 1:
                    where_part = where_part + "n" + str(i) + "." + j['startingNodes'][i]['properties'][m][
                        'name'] + " = " + "'" + \
                                 j['startingNodes'][i]['properties'][m]['values'][k] + "'"

                else:
                    where_part = where_part + "n" + str(i) + "." + j['startingNodes'][i]['properties'][m][
                        'name'] + " = " + "'" + \
                                 j['startingNodes'][i]['properties'][m]['values'][k] + "'" + " OR "

            if int(diz_prop[m]) > 1:
                where_part = where_part[:-4]

            if len(diz_prop) > 1 and m != len(diz_prop) - 1:
                where_part = where_part + ") AND ("

        if prop_num > 1 or (rel_num > 0 and prop_num > 0):
            where_part = where_part + ")"

        for a in range(rel_num):
            if a == 0 and prop_num > 0:
                where_part = where_part + " AND "
            if rel_num == 1:
                where_part = where_part + "(r" + ".name = '" + j['relations'][a]['relationName'] + "')"

            if rel_num > 1:
                if a == 0:
                    where_part = where_part + "("
                where_part = where_part + "r" + ".name = '" + j['relations'][a]['relationName'] + "' OR "
                if a == rel_num - 1:
                    where_part = where_part[:-4]
                    where_part = where_part + ")"

        query = query + relation_part + where_part

        return_part = return_part + "n" + str(i) + ","

    return_part = return_part[:-1]

    if rel_num > 0:
        return_part = return_part + ",r,t"

    query = query + return_part + " LIMIT 25"

    return(query)