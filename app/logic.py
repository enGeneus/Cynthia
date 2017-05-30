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


def build_and_query(form_data):
    return get_node_labels()
