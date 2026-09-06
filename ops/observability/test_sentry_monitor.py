import importlib.util
from pathlib import Path
import unittest
s = importlib.util.spec_from_file_location('monitor', Path(__file__).with_name('sentry-monitor.py'))
m = importlib.util.module_from_spec(s)
s.loader.exec_module(m)

class SentryTransitions(unittest.TestCase):
    def test_new_repeat_increment_and_resolution(self):
        state, notify = m.changed(None, {'count': '1', 'status': 'unresolved'})
        self.assertTrue(notify)
        self.assertFalse(m.changed(state, {'count': '1', 'status': 'unresolved'})[1])
        self.assertTrue(m.changed(state, {'count': '2', 'status': 'unresolved'})[1])
        self.assertTrue(m.changed(state, {'count': '1', 'status': 'resolved'})[1])

    def test_uses_lifetime_not_sliding_window_count(self):
        state = {'count': 20, 'status': 'unresolved'}
        self.assertFalse(m.changed(state, {'count': '2', 'lifetime': {'count': '20'}, 'status': 'unresolved'})[1])

if __name__ == '__main__': unittest.main()
