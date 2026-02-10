/**
 * Resolves a path template by replacing placeholders with actual values from the params object.
 * Placeholders in the template should be in the format `{key}` where `key` corresponds to a key in the params object.
 * If a value in params is undefined, the placeholder will not be replaced.
 *
 * @param template - The path template containing placeholders (e.g., '/teams/{team}/stats')
 * @param params - An object mapping placeholder keys to their replacement values (e.g., { team: 'TOR' })
 * @returns The resolved path with placeholders replaced by actual values (e.g., '/teams/TOR/stats')
 *
 * @example
 * const pathTemplate = '/teams/{team}/stats';
 * const params = { team: 'TOR' };
 * const resolvedPath = resolvePath(pathTemplate, params);
 * console.log(resolvedPath); // Output: '/teams/TOR/stats'
 */
export function resolvePath(
   template: string,
   params: Record<string, string | number | undefined>,
): string {
   let resolvedPath = template;
   for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      resolvedPath = resolvedPath.replace(`{${key}}`, String(value));
   }
   return resolvedPath;
}
