# !/usr/bin/env python

from http.server import BaseHTTPRequestHandler
from os import curdir, sep
from cynthia_server import utils
import config


class CynthiaRequestHandler(BaseHTTPRequestHandler):

    def write_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(bytes(message, "utf8"))

    def write_output_from_file(self, mime_type, file_path):
        try:
            f = open(curdir + sep + config.HTML_BASEDIR + file_path)
            self.send_response(200)
            self.send_header('Content-type', mime_type)
            self.end_headers()
            file = f.read()
            self.wfile.write(bytes(file, "utf8"))
            f.close()
        except FileNotFoundError:
            self.write_error(404, "Not found")

    def write_output_page(self, templated_page):
        self.send_response(200)
        self.send_header('Content-type', "text/html")
        self.end_headers()
        self.wfile.write(bytes(templated_page, "utf8"))

    def do_GET(self):
        context = utils.get_context(self.path)

        if context in config.pages_mapping:
            params = utils.get_params_dictionary(self.path)
            template_filename = config.html_mapping[config.pages_mapping[context]]
            page = config.pages_mapping[context](context, params, template_filename)
            self.write_output_page(page.render())

        else:
            path = self.path

            if path.endswith(".jpg"):
                mime_type = 'image/jpg'
            elif path.endswith(".gif"):
                mime_type = 'image/gif'
            elif path.endswith(".js"):
                mime_type = 'application/javascript'
            elif path.endswith(".css"):
                mime_type = 'text/css'
            elif path.endswith(".ico"):
                mime_type = 'image/x-icon'
            else:
                self.write_error(404, "Not found")

            self.write_output_from_file(mime_type, path)

        return
