# !/usr/bin/env python

from http.server import BaseHTTPRequestHandler, HTTPServer
from os import curdir, sep
import webbrowser

# Server settings
PORT = 8080
HOST = 'localhost'


class CynthiaRequestHandler(BaseHTTPRequestHandler):

    def write_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(bytes(message, "utf8"))

    def write_output_from_file(self, mime_type, file_path):
        try:
            f = open(curdir + sep + "../html_files/" + file_path)
            self.send_response(200)
            self.send_header('Content-type', mime_type)
            self.end_headers()
            self.wfile.write(bytes(f.read(), "utf8"))
            f.close()
        except FileNotFoundError:
            self.write_error(404, "Not found")

    def do_GET(self):
        if self.path == "/":
            path = "/cynthia.html"
        else:
            path = self.path

        mime_type = 'text/html'
        if path.endswith(".jpg"):
            mime_type = 'image/jpg'
        if path.endswith(".gif"):
            mime_type = 'image/gif'
        if path.endswith(".js"):
            mime_type = 'application/javascript'
        if path.endswith(".css"):
            mime_type = 'text/css'
        if path.endswith(".ico"):
            mime_type = 'image/x-icon'

        self.write_output_from_file(mime_type, path)

        return


def run():
    try:
        print('Starting Cynthia server...')

        server_address = (HOST, PORT)
        server = HTTPServer(server_address, CynthiaRequestHandler)
        print('Cynthia server online, visit {host:s}:{port:d} from your browser to use the tool'
              .format(**{'host': HOST, 'port': PORT}))
        webbrowser.open('{host:s}:{port:d}'.format(**{'host': HOST, 'port': PORT}), new=2)
        server.serve_forever()

    except KeyboardInterrupt:
        print('Keyboard interrupt received, stopping Cynthia server')
        server.socket.close()

run()