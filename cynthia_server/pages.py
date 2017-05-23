# !/usr/bin/env python

from cynthia_server import utils
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
        return utils.fill_template(self.template_file, self.build_content_dictionary())


class WelcomePage(BasePage):

    def build_content_dictionary(self):
        param = dict()
        param['page_content'] = "Last login at " + str(datetime.datetime.now())
        return param
