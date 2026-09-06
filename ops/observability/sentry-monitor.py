#!/usr/bin/env python3
"""무료 플랜의 공개 읽기 API로 오류를 환경별 Discord에 중계함."""
import fcntl
import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from notify import load_env, send


def changed(previous, issue):
    """누적 건수 증가 또는 명시적인 상태 변경만 알림함."""
    count = int((issue.get('lifetime') or {}).get('count', issue.get('count', 0)))
    status = issue.get('status', 'unresolved')
    return {'count': count, 'status': status}, not previous or count > previous['count'] or status != previous['status']


def issues(env, project, environment):
    base = 'https://us.sentry.io/api/0/organizations/' + urllib.parse.quote(env['SENTRY_ORG'], safe='') + '/issues/'
    params = {'project': project, 'environment': environment, 'query': '', 'sort': 'date', 'limit': 100, 'statsPeriod': '14d'}
    cursor = ''
    for _ in range(10):
        if cursor: params['cursor'] = cursor
        request = urllib.request.Request(base + '?' + urllib.parse.urlencode(params), headers={'Authorization': 'Bearer ' + env['SENTRY_READ_TOKEN']})
        with urllib.request.urlopen(request, timeout=12) as response:
            data = json.load(response)
            link = response.headers.get('Link', '')
        yield from data
        next_page = next((part for part in link.split(',') if 'rel="next"' in part and 'results="true"' in part), '')
        match = re.search(r'cursor="([^"]+)"', next_page)
        if not match: return
        cursor = match[1]
    raise RuntimeError('sentry_pagination_limit')


def main():
    env = load_env(os.environ.get('PAWPONG_SENTRY_ENV_FILE', '/home/colding/.config/pawpong/sentry-monitor.env'))
    directory = Path(os.environ.get('PAWPONG_ALERT_STATE', '/home/colding/.local/state/pawpong-alerts'))
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (directory / 'sentry.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        path = directory / 'sentry.json'
        state = json.loads(path.read_text()) if path.exists() else {}
        failures = 0
        for environment in ('production', 'development'):
            try:
                project = env['SENTRY_' + environment.upper() + '_PROJECT']
                webhook = env['DISCORD_SENTRY_' + environment.upper() + '_WEBHOOK_URL']
                for issue in issues(env, project, environment):
                    if issue.get('project', {}).get('slug') != project: continue
                    key = environment + ':' + issue['id']
                    current, notify = changed(state.get(key), issue)
                    if notify:
                        # 오류 원문에는 사용자 입력이 섞일 수 있으므로 식별자와 집계만 전달함.
                        payload = {'embeds': [{'title': '[' + environment + '] ' + issue.get('shortId', issue['id']),
                            'url': 'https://' + env['SENTRY_ORG'] + '.sentry.io/issues/' + issue['id'] + '/',
                            'description': '프로젝트: ' + project + '\n누적 수집: ' + str(current['count']) + '\n상태: ' + current['status'],
                            'color': 3066993 if current['status'] == 'resolved' else 15158332}]}
                        send(webhook, payload)
                    state[key] = {**current, 'seenAt': time.time()}
            except Exception:
                failures += 1
                print(environment, 'sentry_poll_pending')
        state = {k: v for k, v in state.items() if time.time() - v.get('seenAt', 0) < 30 * 86400}
        temp = path.with_suffix('.tmp')
        temp.write_text(json.dumps(state)); temp.chmod(0o600); temp.replace(path)
        if failures: raise SystemExit(1)
        print('sentry_poll_ok', len(state))

if __name__ == '__main__': main()
