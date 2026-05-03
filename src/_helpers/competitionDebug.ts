/** @format */

export function logCompetitionDebug(
  scope: string,
  stage: string,
  details?: unknown,
): void {
  console.log(`[competitions:debug] ${scope} ${stage}`, details);
}
