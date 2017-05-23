# !/usr/bin/env python

from http.server import BaseHTTPRequestHandler
from os import curdir, sep
from cynthia_server import utils
import config
import mimetypes


class CynthiaRequestHandler(BaseHTTPRequestHandler):

    def write_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(bytes(message, "utf8"))

    def write_output_from_file(self, mime_type, file_path):
        try:
            f = open(curdir + sep + config.HTML_BASEDIR + file_path, "rb")
            self.send_response(200)
            self.send_header('Content-type', mime_type)
            self.end_headers()
            self.wfile.write(f.read())
            f.close()
        except FileNotFoundError:
            self.write_error(404, "Not found")

    def write_output_page(self, templated_page):
        self.send_response(200)
        self.send_header('Content-type', "text/html")
        self.end_headers()
        self.wfile.write(bytes(templated_page, "utf8"))

    def forward_to_target(self, parameters):
        context = utils.get_context(self.path)
        try:
            template_filename = config.html_mapping[config.pages_mapping[context]]
            page = config.pages_mapping[context](context, parameters, template_filename)
        except Exception:
            self.write_error(404, "Not found")
            return
        self.write_output_page(page.render())

    def do_GET(self):
        context = utils.get_context(self.path)

        if context in config.pages_mapping:
            parameters = utils.get_params_dictionary(self.path)
            self.forward_to_target(parameters)
        else:
            mime_type = mimetypes.guess_type(curdir + sep + config.HTML_BASEDIR + self.path)[0]
            self.write_output_from_file(mime_type, self.path.split("?", 1)[0])
        return

    def do_POST(self):
        length = int(self.headers['Content-length'])
        param_string = str(self.rfile.read(length))
        parameters = utils.get_params_dictionary(param_string[2:-1])
        self.forward_to_target(parameters)
        return
