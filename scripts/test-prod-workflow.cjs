const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const YAML = require('yaml');

const workflow = YAML.parse(fs.readFileSync(path.join(__dirname, '../.github/workflows/prod-deploy.yml'), 'utf8'));
const steps = workflow.jobs['build-and-deploy'].steps;

test('all production shell steps have valid bash syntax', () => {
    for (const step of steps.filter((item) => item.run)) {
        const script = step.run.replace(/\$\{\{.*?\}\}/g, 'test-value');
        const result = spawnSync('bash', ['-n'], { input: script, encoding: 'utf8' });
        assert.equal(result.status, 0, `${step.name}: ${result.stderr}`);
    }
});

test('deployment logs stay in a file, including on deployment failure', () => {
    const deploy = steps.find((step) => step.name === 'Deploy to Production Server').run;
    assert.match(deploy, /trap 'cat deploy\.log' EXIT/);
    assert.match(deploy, /> deploy\.log 2>&1/);
    assert.doesNotMatch(deploy, /GITHUB_ENV|DEPLOY_LOG/);
    for (const step of steps.filter((item) => item.name.startsWith('Send Discord'))) {
        assert.match(step.run, /deploy\.log/);
        assert.doesNotMatch(step.run, /\$DEPLOY_LOG/);
    }
});
