#!/usr/bin/env python3
"""개발 런타임 오류 웹훅만 갱신함. 배포 웹훅과 비밀값을 공유하지 않음."""
import json
import os
import shlex
import subprocess

REMOTE_SCRIPT = r"""
import json, os, tempfile, time
from pathlib import Path
values=json.load(__import__('sys').stdin)
assert set(values)=={'APP_ENV','DISCORD_DEV_ERROR_WEBHOOK_URL'}
assert values['APP_ENV']=='development'
assert values['DISCORD_DEV_ERROR_WEBHOOK_URL'].startswith('https://discord.com/api/webhooks/')
assert not any('\n' in v or '\r' in v for v in values.values())
p=Path('/home/colding/pawpong_backend/.env')
original=p.read_text()
backup=p.with_name('.env.before-alert-routing-'+str(time.time_ns()))
fd=os.open(backup,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w') as f: f.write(original)
lines=[line for line in original.splitlines() if line.split('=',1)[0].strip() not in values]
lines += [key+'='+value for key,value in values.items()]
fd,name=tempfile.mkstemp(dir=p.parent,prefix='.env-alerts-')
with os.fdopen(fd,'w') as f: f.write('\n'.join(lines)+'\n')
os.replace(name,p)
# PM2의 기존 process.env가 .env보다 우선하므로 두 키를 명시적으로 갱신함.
result=__import__('subprocess').run(['pm2','restart','pawpong-backend','--update-env'],env={**os.environ,**values},capture_output=True)
if result.returncode: raise SystemExit('development_alert_restart_failed')
__import__('subprocess').run(['pm2','save','--force'],check=True,capture_output=True)
print('development_alert_environment_updated')
"""

def main():
    values={'APP_ENV':'development','DISCORD_DEV_ERROR_WEBHOOK_URL':os.environ['DISCORD_DEV_ERROR_WEBHOOK_URL']}
    if not values['DISCORD_DEV_ERROR_WEBHOOK_URL']: raise SystemExit('development_error_webhook_required')
    command=['ssh','-i',os.path.expanduser('~/.ssh/deploy_key'),'-o','StrictHostKeyChecking=yes','-p',os.environ['DEV_SERVER_PORT'],os.environ['DEV_SERVER_USER']+'@'+os.environ['DEV_SERVER_HOST'],'python3 -c '+shlex.quote(REMOTE_SCRIPT)]
    subprocess.run(command,input=json.dumps(values),text=True,check=True)

if __name__=='__main__': main()
