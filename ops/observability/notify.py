#!/usr/bin/env python3
"""환경별 Discord 전달과 배포 결과 형식을 공유함. 비밀값은 출력하지 않음."""
import json, os, re, sys, time, urllib.request, urllib.error
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

def enrich_deployment(env):
    """배포 SHA의 작성 정보를 읽음. 알림 실행 봇을 커밋 작성자로 표시하지 않음."""
    env = dict(env)
    # 실행 SHA와 실제 롤백 대상 SHA를 혼동하지 않음. 기존 배포 로그의 공개 상태만 읽음.
    log_path = Path('rollback.log' if 'rollback' in env.get('DEPLOY_SERVICE', '') else 'deploy.log')
    if log_path.is_file():
        log = re.sub(r'\x1b\[[0-9;]*m', '', log_path.read_text(errors='replace'))
        active = re.findall(r'Active Container: (blue|green) \(port (\d+)\)', log)
        if active: env['DEPLOY_CONTAINER'] = active[-1][0] + ' (포트 ' + active[-1][1] + ')'
        if 'rollback' in env.get('DEPLOY_SERVICE', ''):
            target = re.search(r'Rolling back to: ([0-9a-fA-F]{40})', log)
            env['DEPLOY_COMMIT'] = target[1] if target else '롤백 대상 확인 불가 · 실행 로그 확인'
            env['DEPLOY_BRANCH'] = '롤백 대상 커밋'
    repo, sha = env.get('DEPLOY_REPOSITORY', ''), env.get('DEPLOY_COMMIT', '')
    if not repo or not re.fullmatch(r'[0-9a-fA-F]{40}', sha):
        return env
    base = 'https://api.github.com/repos/' + repo + '/commits/' + sha
    headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'Pawpong-Ops/1.0'}
    if env.get('GH_TOKEN'): headers['Authorization'] = 'Bearer ' + env['GH_TOKEN']
    try:
        with urllib.request.urlopen(urllib.request.Request(base, headers=headers), timeout=8) as response:
            commit = json.load(response)
        author = commit.get('commit', {}).get('author', {}).get('name', '미확인')
        login = (commit.get('author') or {}).get('login', '')
        env['DEPLOY_AUTHOR'] = author + (' (@' + login + ')' if login else '')
        env['DEPLOY_MESSAGE'] = commit.get('commit', {}).get('message', '').split('\n')[0]
        env['DEPLOY_COMMIT_URL'] = 'https://github.com/' + repo + '/commit/' + sha
        if not env.get('DEPLOY_BRANCH') or re.fullmatch(r'[0-9a-fA-F]{40}', env['DEPLOY_BRANCH']):
            with urllib.request.urlopen(urllib.request.Request(base + '/branches-where-head', headers=headers), timeout=8) as response:
                branches = [branch['name'] for branch in json.load(response)]
            env['DEPLOY_BRANCH'] = ', '.join(branches) or 'SHA 배포 · 브랜치 확인 불가'
    except Exception:
        env.setdefault('DEPLOY_AUTHOR', '조회 실패 · 커밋 링크 확인')
    return env


def deployment_payload(env):
    service = env.get('DEPLOY_SERVICE', 'backend + ai-agent')
    status = env.get('DEPLOY_STATUS', 'unknown')
    labels = {'success': '성공', 'failure': '실패', 'error': '오류', 'cancelled': '취소'}
    environment = env.get('APP_ENV', '미확인')
    fields = [('서비스', service), ('환경', environment), ('브랜치', env.get('DEPLOY_BRANCH', '미확인')),
              ('배포 방식', env.get('DEPLOY_METHOD', '미확인')), ('대상 서버', env.get('DEPLOY_TARGET', '미확인')),
              ('실행자', env.get('DEPLOY_ACTOR', '미확인')), ('커밋 작성자', env.get('DEPLOY_AUTHOR', '미확인')),
              ('커밋 SHA', env.get('DEPLOY_COMMIT', '미확인')[:12]), ('커밋 메시지', env.get('DEPLOY_MESSAGE', '미확인')),
              ('결과', labels.get(status, status)), ('헬스체크', env.get('DEPLOY_HEALTH', '미확인'))]
    for key, label in [('DEPLOY_CONTAINER', '활성 컨테이너'), ('DEPLOY_URL', '배포 주소'),
                       ('DEPLOY_COMMIT_URL', '커밋 보기'), ('DEPLOY_RUN_URL', '실행 로그')]:
        if env.get(key): fields.append((label, env[key]))
    # Discord embed 총 6000자 한도 안에서 사용자 작성 커밋 메시지를 안전하게 표시함.
    return {'allowed_mentions': {'parse': []}, 'embeds': [{
        'title': '[' + environment + '] ' + service + ' 배포 ' + labels.get(status, status),
        'color': 3066993 if status == 'success' else 15158332,
        'fields': [{'name': k, 'value': str(v)[:350] or '-', 'inline': k not in ('커밋 메시지', '배포 주소', '커밋 보기', '실행 로그')} for k, v in fields],
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}]}

if __name__ == '__main__':
    try:
        env = enrich_deployment(os.environ)
        url = env.get('DISCORD_DEPLOY_WEBHOOK_URL') if env.get('APP_ENV') == 'production' else env.get('DISCORD_DEV_DEPLOY_WEBHOOK_URL')
        send(url, deployment_payload(env))
        print('deployment_notification_delivered')
    except Exception:
        print('deployment_notification_failed', file=sys.stderr); sys.exit(1)
