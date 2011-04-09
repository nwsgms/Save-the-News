from __future__ import absolute_import

import bottle
from bottle import default_app

from .newsaggregator import (
    configure_db,
    )

from .util import (
    transactional,
    )

# pull in the bottle definitions
import stn.app


def app_factory(global_config, **local_conf):
    global SLOW_LOADING
    configure_db(local_conf["dburi"])
    SLOW_LOADING = "true" == local_conf.get("slow_loading", "false")
    bottle.debug(True) #global_config.get("debug", "false") == "true")
    return default_app()


