# NHL API Client - Configuration

The NHL API client uses a small configuration object defined in
`src/config/index.ts`. Change the values in that file when the application
needs different defaults.

```ts
export const config = {
   timeout: 5000,
   language: 'en',
   logLevel: 'warn',
};
```

## Options

- `timeout`: Request timeout in milliseconds. Default: `5000`.
- `language`: API response language, either `'en'` or `'fr'`. Default: `'en'`.
- `logLevel`: One of `'silent'`, `'error'`, `'warn'`, `'info'`, or `'debug'`.
  Default: `'warn'`.

The configuration applies to all shared API clients and endpoint modules.

## Inspecting Configuration

```ts
import { config, logConfig } from 'nhle-api';

console.log(config.timeout, config.language, config.logLevel);
logConfig();
```

## Per-Client Configuration

Use `NHLClient` when one client needs settings different from the shared
configuration:

```ts
import { NHLClient } from 'nhle-api';

const customClient = new NHLClient('https://api-web.nhle.com/v1');
const result = await customClient.get('/en/score/now');
```
