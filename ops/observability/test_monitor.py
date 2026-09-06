import importlib.util, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('monitor', Path(__file__).with_name('health-monitor.py'))
monitor=importlib.util.module_from_spec(spec);spec.loader.exec_module(monitor)
from notify import deployment_payload
class AlertsTest(unittest.TestCase):
 def test_outage_recovery(self):
  state,event=monitor.transition({},False,1);self.assertIsNone(event)
  state,event=monitor.transition(state,False,61);self.assertEqual(event,'장애 감지')
  state.update(incident=True,sentAt=61)
  state,event=monitor.transition(state,False,121);self.assertIsNone(event)
  state,event=monitor.transition(state,False,962);self.assertEqual(event,'장애 지속')
  state,event=monitor.transition(state,True,1022);self.assertIsNone(event)
  state,event=monitor.transition(state,True,1082);self.assertEqual(event,'복구 확인')
 def test_initial_health_is_not_recovery(self):
  state,event=monitor.transition({},True,1);state,event=monitor.transition(state,True,61);self.assertIsNone(event)
 def test_deploy_fields_do_not_invent_health(self):
  p=deployment_payload({'APP_ENV':'production','DEPLOY_STATUS':'failure','DEPLOY_COMMIT':'a"\n'});
  self.assertIn({'name':'헬스체크','value':'미확인','inline':True},p['embeds'][0]['fields'])
if __name__=='__main__':unittest.main()
