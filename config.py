# !/usr/bin/env python

from cynthia_server import pages

# Server configuration
HOST = 'localhost'
PORT = 8080

HTML_BASEDIR = "/html_files/"

# Context / page class mapping
pages_mapping = dict()
pages_mapping['/'] = pages.WelcomePage
pages_mapping['/cynthia'] = pages.WelcomePage

# Page / html path mapping
html_mapping = dict()
html_mapping[pages.WelcomePage] = "cynthia.html"
