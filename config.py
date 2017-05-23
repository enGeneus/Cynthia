# !/usr/bin/env python

from cynthia_server import cynthia_pages

# Server configuration
HOST = 'localhost'
PORT = 8080

HTML_BASEDIR = "/html_files/"

# Context / page class mapping
pages_mapping = dict()
pages_mapping['/'] = cynthia_pages.WelcomePage
pages_mapping['/cynthia'] = cynthia_pages.WelcomePage

# Page / html path mapping
html_mapping = dict()
html_mapping[cynthia_pages.WelcomePage] = "cynthia.html"
