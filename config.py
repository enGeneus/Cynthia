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

# Page / html path mapping
html_mapping = dict()
html_mapping[pages.WelcomePage] = "cynthia.html"

# Error page html
error_page = "error.html"
