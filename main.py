# !/usr/bin/env python

from cynthia_server import request_handler
from http.server import HTTPServer
import webbrowser
import config


def run():
    try:
        print('Starting Cynthia server...')

        server_address = (config.HOST, config.PORT)
        server = HTTPServer(server_address, request_handler.CynthiaRequestHandler)
        print('Cynthia server online, visit {host:s}:{port:d} from your browser to use the tool'
              .format(**{'host': config.HOST, 'port': config.PORT}))
        webbrowser.open('{host:s}:{port:d}'.format(**{'host': config.HOST, 'port': config.PORT}), new=2)
        server.serve_forever()
    except KeyboardInterrupt:
        print('Keyboard interrupt received, stopping Cynthia server')
        server.socket.close()

run()
