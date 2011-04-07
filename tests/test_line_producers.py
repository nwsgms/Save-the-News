
from stn.textrenderer import SimpleTextProducer


def test_simple_text_producer():
    stp = SimpleTextProducer("this is a test.")
    assert stp.line == ""
    assert stp
    stp.pop()
    stp.pop()
    assert stp.line == "this is"
    stp.next()
    assert stp.line == ""
    stp.pop()
    stp.pop()
    stp.push()
    assert stp.line == "a"
    stp.next()
    stp.pop()
    assert stp.line == "test."
    assert not stp
    try:
        stp.pop()
    except IndexError:
        pass
    else:
        assert False, "pop() after last part must raise IndexError"


