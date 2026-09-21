import io
import json
import unittest
from unittest.mock import patch
from notify import deployment_payload, enrich_deployment

class DeploymentTest(unittest.TestCase):
    def test_commit_author_and_actor_are_distinct(self):
        env={'DEPLOY_REPOSITORY':'Pawpong/example','DEPLOY_COMMIT':'a'*40,'DEPLOY_BRANCH':'a'*40,'DEPLOY_ACTOR':'vercel[bot]','APP_ENV':'preview','DEPLOY_STATUS':'success'}
        commit={'commit':{'author':{'name':'희영'},'message':'fix: 화면 수정함\n상세'},'author':{'login':'hiaeng'}}
        responses=[io.BytesIO(json.dumps(commit).encode()),io.BytesIO(b'[{"name":"dev"}]')]
        with patch('urllib.request.urlopen',side_effect=responses): result=enrich_deployment(env)
        fields={f['name']:f['value'] for f in deployment_payload(result)['embeds'][0]['fields']}
        self.assertEqual(fields['커밋 작성자'],'희영 (@hiaeng)')
        self.assertEqual(fields['실행자'],'vercel[bot]')
        self.assertEqual(fields['브랜치'],'dev')
        self.assertEqual(fields['커밋 메시지'],'fix: 화면 수정함')
    def test_metadata_failure_preserves_failure_notification(self):
        env={'DEPLOY_REPOSITORY':'Pawpong/example','DEPLOY_COMMIT':'a'*40,'APP_ENV':'production','DEPLOY_STATUS':'failure'}
        with patch('urllib.request.urlopen',side_effect=OSError): result=enrich_deployment(env)
        self.assertEqual(result['DEPLOY_STATUS'],'failure')
        self.assertIn('조회 실패',result['DEPLOY_AUTHOR'])
    def test_long_untrusted_commit_is_bounded_and_never_mentions(self):
        payload=deployment_payload({'APP_ENV':'production','DEPLOY_STATUS':'success','DEPLOY_MESSAGE':'@everyone'*2000})
        self.assertEqual(payload['allowed_mentions'],{'parse':[]})
        self.assertLess(sum(len(f['name'])+len(f['value']) for f in payload['embeds'][0]['fields']),6000)

if __name__=='__main__': unittest.main()
