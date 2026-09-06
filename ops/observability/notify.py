#!/usr/bin/env python3
"""환경별 Discord 전달과 배포 결과 형식을 공유함. 비밀값은 출력하지 않음."""
import json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

def load_env(path):
    result = {}
    for line in Path(path).read_text().splitlines():
        if '=' not in line or line.lstrip().startswith('#'): continue
        key, value = line.split('=', 1)
        result[key.strip()] = value.strip().strip('\"\'')
    return result

def send(url, payload):
    if not url: raise RuntimeError('webhook_not_configured')
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, json.dumps({'allowed_mentions': {'parse': []}, **payload}).encode(), {'Content-Type': 'application/json', 'User-Agent': 'Pawpong-Ops/1.0'})
            with urllib.request.urlopen(request, timeout=8) as response:
                if response.status not in (200, 204): raise RuntimeError('discord_delivery_failed')
            return
        except urllib.error.HTTPError as error:
            if error.code != 429 and error.code < 500: raise RuntimeError('discord_delivery_rejected') from None
            if attempt == 2: raise RuntimeError('discord_delivery_failed') from None
            time.sleep(min(10, max(1, float(error.headers.get('Retry-After', 2)))))
        except (OSError, TimeoutError):
            if attempt == 2: raise RuntimeError('discord_unavailable') from None
            time.sleep(2)

def deployment_payload(env):
    fields = [("서비스", env.get('DEPLOY_SERVICE', 'backend + ai-agent')), ("환경", env['APP_ENV']),
              ("커밋", env.get('DEPLOY_COMMIT', 'unknown')), ("결과", env['DEPLOY_STATUS']),
              ("헬스체크", env.get('DEPLOY_HEALTH', '미확인'))]
    if env.get('DEPLOY_RUN_URL'): fields.append(('실행 로그', env['DEPLOY_RUN_URL']))
    return {'embeds': [{'title': 'Pawpong 배포 결과', 'color': 3066993 if env['DEPLOY_STATUS'] == 'success' else 15158332,
        'fields': [{'name': k, 'value': str(v)[:1024] or '-', 'inline': k != '실행 로그'} for k, v in fields],
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}]}

if __name__ == '__main__':
    try:
        env = dict(os.environ)
        url = env.get('DISCORD_DEPLOY_WEBHOOK_URL') if env.get('APP_ENV') == 'production' else env.get('DISCORD_DEV_DEPLOY_WEBHOOK_URL')
        send(url, deployment_payload(env))
        print('deployment_notification_delivered')
    except Exception:
        print('deployment_notification_failed', file=sys.stderr); sys.exit(1)
