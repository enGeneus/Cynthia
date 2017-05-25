# !/usr/bin/env python

from cynthia_server import request_handler
from http.server import HTTPServer
import webbrowser
import config


def run():
    try:
        print('Starting Cynthia server...')

        server_address = (config.CYNTHIA_HOST, config.CYNTHIA_PORT)
        server = HTTPServer(server_address, request_handler.CynthiaRequestHandler)
        print('Cynthia server online, visit {host:s}:{port:d} from your browser to use the tool'
              .format(**{'host': config.CYNTHIA_HOST, 'port': config.CYNTHIA_PORT}))
        webbrowser.open('{host:s}:{port:d}'.format(**{'host': config.CYNTHIA_HOST, 'port': config.CYNTHIA_PORT}), new=2)
        server.serve_forever()
    except KeyboardInterrupt:
        print('Keyboard interrupt received, stopping Cynthia server')
        server.socket.close()

run()
