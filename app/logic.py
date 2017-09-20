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
    query = "MATCH (n:Node_info) RETURN n.name "
    result = query_db(query)
    label_list = []
    for record in result:
        if record["n.name"] == "microRNA":
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


def build_query(form_data):
    j = json.loads(form_data)

    query = ""
    rel_num = 0
    if j['relations'] != []:
        rel_num = (len(j['relations']))

    return_part = " RETURN "

    for i in range(len(j['startingNodes'])):

        if i != 0:
            if rel_num != 0:
                query = query + " WITH t,"
            else:
                query = query + " WITH "

            for m in range(i):
                query = query + "n" + str(m) +","
                if rel_num > 0:
                    query = query + "r" + str(m) + ","
                if m == i - 1:
                    query = query[:-1] + " "

        prop_num = 0
        relation_part = ""

        if j['startingNodes'][i]['properties'] != []:
            prop_num = (len(j['startingNodes'][i]['properties']))

        relation_part = "MATCH (n" + str(i) + ":" + j['startingNodes'][i]['type'] + ")"

        if rel_num > 0:
            relation_part = relation_part + "-[r"+str(i)+ ":PicTar|RNA22]-> (t)"

        diz_prop = {}

        if prop_num > 1 or (rel_num > 0 and prop_num > 0):
            relation_part = relation_part + " WHERE ("
        elif (prop_num == 1 and rel_num == 0) or (prop_num == 0 and rel_num >= 1):
            relation_part = relation_part + " WHERE "


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
                where_part = where_part + "(r"+str(i)+ ".name = '" + j['relations'][a]['relationName']+ "'"

                if j['relations'][a]['cutoffValue'] != "" :
                    where_part =  where_part +" AND r"+str(i)+ ".score > '"+ j['relations'][a]['cutoffValue']+"')"
                else :
                    where_part = where_part +")"

            if rel_num > 1:
                if a == 0:
                    where_part = where_part + "("

                if j['relations'][a]['cutoffValue'] == "" :
                    where_part = where_part + "r"+str(i) + ".name = '" + j['relations'][a]['relationName'] + "' OR "
                else:
                    where_part = where_part + "(r"+str(i) + ".name = '" + j['relations'][a]['relationName'] + "' AND r"+str(i)+ ".score > '"+ j['relations'][a]['cutoffValue']+"')"+" OR "

                if a == rel_num - 1:
                    where_part = where_part[:-4]
                    where_part = where_part + ")"

        query = query + relation_part + where_part



        return_part = return_part + "n" + str(i)+","

        if rel_num > 0 :
            return_part = return_part + "r"+str(i)+","

    return_part = return_part[:-1]

    if rel_num > 0:
        return_part = return_part + ",t"

    if j["limit"] == 0 :
        query = query + return_part

    elif j["limit"] == -1 :
        query = query + return_part + " LIMIT 25"
    else:
        query = query + return_part + " LIMIT " + str(j["limit"])

    return(query)


def build_query_v2(data):

    j = json.loads(data)

    query = ""

    rel_num = 0
    if j['relations'] != []:
        rel_num = (len(j['relations']))

    start_node_num = 0
    if j['startingNodes'] != []:
        start_node_num = (len(j['startingNodes']))

    for i in range(start_node_num):

        if i == 0:
            query = query + "MATCH "
        else:
            query = query + " MATCH "

        query = query + "p" + str(i) + "=(m" + str(i) + ":" + j['startingNodes'][i]['type'] + ")-["

        for k in range(rel_num):
            query = query + ":" + j['relations'][k]['relationName'] + "|"

        query = query[0:-1]

        query = query + "]->(t" + str(i) + ":Target)"

    query = query + " WHERE "

    for i in range(start_node_num):

        num_of_value = (len(j["startingNodes"][i]["properties"][0]["values"]))

        query = query + "("

        if num_of_value == 0:
            query = query[0:-1]

        for k in range(num_of_value):

            if num_of_value == 1:
                query = query + "m" + str(i) + "." + j['startingNodes'][i]['properties'][0]['name'] + " = " + \
                        j['startingNodes'][i]['properties'][0]['values'][k]
            elif num_of_value > 1:
                query = query + "m" + str(i) + "." + j['startingNodes'][i]['properties'][0]['name'] + " = " + \
                        j['startingNodes'][i]['properties'][0]['values'][k] + " OR "

            if k == num_of_value - 1:
                query = query[0:-4]

        query = query + ")"

        query = query + " AND "

        if num_of_value == 0:
            query = query[0:-6]

    if start_node_num > 1:

        for i in range(start_node_num):
            query = query + "t" + str(i) + ".name="

        query = query[0:-1]
    else:
        query = query[0:-4]

    query = query + " RETURN "

    for i in range(start_node_num):
        query = query + "p" + str(i) + ","

    query = query[0:-1]

    query = query + " LIMIT 25"

    #print(query)
    return(query)