import os
from bottle import route, run, static_file, redirect, request, default_app
import time


SLOW_LOADING = False

@route('/')
def index():
    agent = request.header.get("User-Agent", "")
    if "iPhone" in agent:
        redirect("/static/iphone3.html")
    redirect("/static/game.html")

@route('/static/:filename#.+#')
def root(filename):
    base = os.path.join(os.path.dirname(__file__), "static")
    if SLOW_LOADING and filename.endswith(".png"):
        time.sleep(1)
    return static_file(filename, root=base)



def app_factory(global_config, **local_conf):
    global SLOW_LOADING
    SLOW_LOADING = "true" == local_conf.get("slow_loading", "false")
    return default_app()


if __name__ == '__main__':
    run(host='localhost', port=8080)
