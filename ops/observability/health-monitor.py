#!/usr/bin/env python3
"""앱 프로세스 밖에서 장애/복구를 확인하고 재시작 후에도 알림 상태를 유지함."""
import fcntl, json, os, subprocess, time, urllib.request
from pathlib import Path
from notify import load_env, send

def transition(state, healthy, now):
    """연속 2회 관찰로 전이하며 실패 반복은 15분마다 집계함."""
    state = dict(state)
    state['successes'] = state.get('successes', 0) + 1 if healthy else 0
    state['failures'] = state.get('failures', 0) + 1 if not healthy else 0
    if not healthy: state['totalFailures'] = state.get('totalFailures', 0) + 1
    event = None
    if state['failures'] >= 2 and (not state.get('incident') or now - state.get('sentAt', 0) >= 900):
        event = '장애 지속' if state.get('incident') else '장애 감지'
    if state['successes'] >= 2 and state.get('incident'): event = '복구 확인'
    return state, event

def checks():
    probe = subprocess.run(['docker', 'inspect', 'pawpong_blue', 'pawpong_green', 'pawpong_ai_agent', 'kafka', 'pawpong_redis'], capture_output=True, timeout=12, text=True)
    data = json.loads(probe.stdout)
    if not data: raise RuntimeError('docker_inspection_failed')
    by_name = {d['Name'].lstrip('/'): d for d in data}
    good = lambda name: by_name.get(name, {}).get('State', {}).get('Health', {}).get('Status') == 'healthy' and by_name.get(name, {}).get('State', {}).get('Running') is True
    result = {'backend': good('pawpong_blue') or good('pawpong_green'), 'ai-agent': good('pawpong_ai_agent'), 'kafka': good('kafka'), 'redis': good('pawpong_redis')}
    try:
        with urllib.request.urlopen('https://api.pawpong.kr/api/health/ready', timeout=8) as response: result['public-api'] = response.status == 200
    except Exception: result['public-api'] = False
    return result

def main():
    env = load_env(os.environ.get('PAWPONG_ENV_FILE', '/home/colding/pawpong_backend/.env.production'))
    if env.get('APP_ENV') != 'production': raise RuntimeError('explicit_production_environment_required')
    directory = Path(os.environ.get('PAWPONG_ALERT_STATE', '/home/colding/.local/state/pawpong-alerts'))
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (directory / 'lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        path = directory / 'state.json'
        state = json.loads(path.read_text()) if path.exists() else {}
        try: observed = checks()
        except Exception: observed = {'monitor-probe': False}
        if 'monitor-probe' not in observed: observed['monitor-probe'] = True
        for service, healthy in observed.items():
            current, event = transition(state.get(service, {}), healthy, time.time())
            if event:
                payload = {'embeds': [{'title': '[production] ' + service + ' · ' + event,
                    'color': 3066993 if healthy else 15158332,
                    'description': '연속 2회 정상 헬스체크 확인함' if healthy else '헬스체크 실패 관측 횟수: ' + str(current['totalFailures']),
                    'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}]}
                try:
                    send(env.get('DISCORD_ERROR_WEBHOOK_URL'), payload)
                    current['incident'] = not healthy
                    current['sentAt'] = time.time()
                    if healthy: current['totalFailures'] = 0
                    print(service, event)
                except Exception: print(service, 'notification_pending')
            state[service] = current
        tmp = path.with_suffix('.tmp'); tmp.write_text(json.dumps(state)); tmp.chmod(0o600); tmp.replace(path)
if __name__ == '__main__': main()
