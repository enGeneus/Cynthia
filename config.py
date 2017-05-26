# !/usr/bin/env python

from cynthia_server import pages

# Server configuration
CYNTHIA_HOST = 'localhost'
CYNTHIA_PORT = 8080
HTML_BASEDIR = "/html_files/"

# Database configuration
EXTERNAL_DB_HOST = ''
EXTERNAL_DB_PORT = 0
EXTERNAL_DB_USER = ''
EXTERNAL_DB_PASS = ''

# Context / page class mapping
pages_mapping = dict()
pages_mapping['/'] = pages.WelcomePage
pages_mapping['/cynthia'] = pages.WelcomePage
pages_mapping['/query'] = pages.QueryBuildPage
pages_mapping['/results'] = pages.ResultPage

# Page / html path mapping
html_mapping = dict()
html_mapping[pages.WelcomePage] = "cynthia.html"
html_mapping[pages.QueryBuildPage] = "query.html"
html_mapping[pages.ResultPage] = "results.html"

# Error page html
error_page = "error.html"
