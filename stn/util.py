from functools import wraps
from elixir import session

def transactional(func):

    @wraps(func)
    def _t(*args, **kwargs):
        commit = False
        try:
            res = func(*args, **kwargs)
            commit = True
            return res
        finally:
            if commit:
                session.commit()
            else:
                session.rollback()

    return _t
