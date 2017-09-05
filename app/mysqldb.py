# !/usr/bin/env python

import config
import pymysql.cursors


def connect():
    connection = pymysql.connect(host =config.MYSQL_DB_HOST,
                                 port=config.MYSQL_DB_PORT,
                                 user=config.MYSQL_DB_USER,
                                 password=config.MYSQL_DB_PASS,
                                 db=config.MYSQL_DB_NAME,
                                 cursorclass=pymysql.cursors.DictCursor)
    return connection


def execute_query(sql):
    connection = connect()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            result = cursor.fetchall()
            return result
    finally:
        connection.close()


def dummy_query():
    sql = 'SELECT * FROM pending_query'
    results = execute_query(sql)
    print(results)
