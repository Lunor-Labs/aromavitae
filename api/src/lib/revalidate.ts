import { env } from '@/config/env';
import { logger } from '@/lib/logger';

export async function revalidateFrontend(_paths: string[] = ['/']): Promise<void> {
  if (!env.GITHUB_PAT || !env.GITHUB_REPO) {
    logger.debug('GITHUB_PAT/GITHUB_REPO not set — skipping rebuild trigger');
    return;
  }
  try {
    const [owner, repo] = env.GITHUB_REPO.split('/');
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/frontend.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GITHUB_PAT}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      logger.warn({ status: res.status, body }, 'GitHub rebuild trigger failed');
    }
  } catch (error) {
    logger.warn({ error }, 'GitHub rebuild trigger threw');
  }
}
