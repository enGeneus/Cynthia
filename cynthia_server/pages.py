# !/usr/bin/env python

from cynthia_server import utils
import config
import abc
import datetime


class BasePage:

    __metaclass__ = abc.ABCMeta

    def __init__(self, context, param_dictionary, template_file):
        self.context = context
        self.param_dictionary = param_dictionary
        self.template_file = template_file

    @abc.abstractclassmethod
    def build_content_dictionary(self):
        # This method has to return the dictionary of contents that have to be inserted into the page
        return

    def render(self):
        contents = self.build_content_dictionary()
        if 'error' in contents:
            template_file = config.error_page
        else:
            template_file = self.template_file
        return utils.fill_template(template_file, contents)


class WelcomePage(BasePage):

    def build_content_dictionary(self):
        param = dict()
        param['page_content'] = "Last login at " + str(datetime.datetime.now())
        param['error'] = 404
        return param
