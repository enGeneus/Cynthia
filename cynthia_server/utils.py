# !/usr/bin/env python

from os import curdir, sep
from string import Template
import config


def get_context(path):
    url_elements = path.split("?")
    context = url_elements.pop(0)
    return context


def get_params_dictionary(path):
    url_elements = path.split("?")
    url_elements.pop(0)
    params = dict()
    if url_elements:
        for current_param in url_elements[0].split("&"):
            if "=" in current_param:
                name, value = current_param.split("=", 1)
                params[name] = value
    return params


def fill_template(file_path, content_dictionary):
    f = open(curdir + sep + config.HTML_BASEDIR + file_path)
    file = f.read()
    template = Template(file)
    output = template.safe_substitute(content_dictionary)
    f.close()
    return output
