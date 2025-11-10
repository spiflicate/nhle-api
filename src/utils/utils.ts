/**
 * Helper to construct API path with parameters
 */
export function route(
   template: string,
   params: Record<string, string | number | undefined>,
): string {
   let route = template;
   for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      route = route.replace(`{${key}}`, String(value));
   }
   return route;
}
