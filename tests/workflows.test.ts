import { expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';

interface Job {
  uses?: string;
  needs?: string[];
  'continue-on-error'?: boolean;
  steps?: { uses?: string; run?: string; with?: Record<string, unknown> }[];
}
interface Workflow { jobs: Record<string, Job> }

test('one publisher depends on successful validated platform builds', () => {
  const workflows = readdirSync('.github/workflows').filter(name => name.endsWith('.yml')).map(name => ({
    name, workflow: Bun.YAML.parse(readFileSync(`.github/workflows/${name}`, 'utf8')) as Workflow,
  }));
  const publishers = workflows.flatMap(({ name, workflow }) => Object.entries(workflow.jobs).flatMap(([id, job]) =>
    job.steps?.some(step => step.uses?.startsWith('softprops/action-gh-release') || /gh release create/.test(step.run ?? ''))
      ? [{ name, id, job, workflow }] : []));
  expect(publishers).toHaveLength(1);
  const publisher = publishers[0]!;
  expect(publisher.name).toBe('release.yml');
  const platforms = Object.entries(publisher.workflow.jobs).filter(([, job]) => job.uses?.includes('build-android.yml') || job.uses?.includes('build-ios.yml'));
  expect(platforms).toHaveLength(2);
  for (const [id, job] of platforms) {
    expect(publisher.job.needs).toContain(id);
    expect(job['continue-on-error']).not.toBe(true);
  }
  for (const { workflow } of workflows) for (const job of Object.values(workflow.jobs)) {
    for (const step of job.steps ?? []) if (step.uses?.startsWith('actions/upload-artifact')) {
      expect(step.with?.['if-no-files-found']).toBe('error');
    }
  }
});
