# !/usr/bin/env python

from http.server import BaseHTTPRequestHandler, HTTPServer
import webbrowser

#Server settings
PORT = 8080
HOST = '127.0.0.1'


class CynthiaBaseServer(BaseHTTPRequestHandler):
    def do_GET(self):
        # Send response status code
        self.send_response(200)

        # Send headers
        self.send_header('Content-type', 'text/html')
        self.end_headers()

        # Send message back to client
        message = "Welcome to Cynthia!"
        # Write content as utf-8 data
        self.wfile.write(bytes(message, "utf8"))
        return


def run():
    print('Starting Cynthia server...')

    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, CynthiaBaseServer)
    print(u'Cynthia server online, visit {host:s}:{port:d} from your browser to use the tool'
          .format(**{'host': HOST, 'port': PORT}))
    webbrowser.open('{host:s}:{port:d}'.format(**{'host': HOST, 'port': PORT}), new=2)
    httpd.serve_forever()


run()