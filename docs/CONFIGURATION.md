# NHL API Client - Configuration

The shared API clients read the exported `config` object on every request,
so changing it at runtime applies everywhere, even after the API modules
are loaded.

```ts
import { config } from 'nhle-api';

config.timeout = 10000;
config.language = 'fr';
config.logLevel = 'error';
```

## Options

- `timeout`: Request timeout in milliseconds. Default: `5000`.
- `language`: API response language, either `'en'` or `'fr'`. Default: `'en'`.
  It sets the `Accept-Language` header and the default `lang` argument of
  the `stats` functions.
- `logLevel`: One of `'silent'`, `'error'`, `'warn'`, `'info'`, or `'debug'`.
  Default: `'warn'`. Failed requests are logged at a level that depends on
  the error: network and server errors at `error`, rate limits at `warn`,
  4xx responses at `info`, validation errors at `debug`.

## Inspecting Configuration

```ts
import { config, logConfig } from 'nhle-api';

console.log(config.timeout, config.language, config.logLevel);
logConfig();
```

## Per-Client Configuration

Use `NHLClient` (or `createNHLClient`) when one client needs settings
different from the shared configuration. Options you leave out follow
`config`.

```ts
import { ErrorLogLevel, NHLClient } from 'nhle-api';

const client = new NHLClient({
   baseUrl: 'https://api-web.nhle.com/v1',
   timeout: 15000,
   language: 'fr',
   headers: { 'User-Agent': 'my-app' },
   errorConfig: { logLevel: ErrorLogLevel.NONE }, // never log errors
});

const result = await client.get('score/now');
if (result.success) console.log(result.data);
```

`new NHLClient('https://api-web.nhle.com/v1')` also works when only the
base URL differs. `BASE_URLS` lists the URLs the library uses.
