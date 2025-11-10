# NHL API Client - Environment Configuration

## Overview

The NHL API client supports simple configuration through environment variables. This allows you to customize behavior without modifying code or creating custom client instances.

## Supported Environment Variables

### `NHLE_API_TIMEOUT`

**Type:** Number (milliseconds)  
**Default:** `5000` (5 seconds)  
**Description:** Request timeout for all API calls

```bash
# Set timeout to 10 seconds
export NHLE_API_TIMEOUT=10000

# Set timeout to 3 seconds
export NHLE_API_TIMEOUT=3000
```

**Note:** Invalid values (non-numeric, zero, negative) will trigger a warning and use the default.

---

### `NHLE_API_LANGUAGE`

**Type:** String (`'en'` or `'fr'`)  
**Default:** `'en'` (English)  
**Description:** Language for API responses

```bash
# Use French
export NHLE_API_LANGUAGE=fr

# Use English (default)
export NHLE_API_LANGUAGE=en
```

**Note:** Invalid values will trigger a warning and use the default (`'en'`).

---

### `NHLE_API_LOGLEVEL`

**Type:** String (`'silent'`, `'error'`, `'warn'`, `'info'`, or `'debug'`)  
**Default:** `'warn'`  
**Description:** Logging level for the NHL API client

```bash
# Disable all logging
export NHLE_API_LOGLEVEL=silent

# Show only errors
export NHLE_API_LOGLEVEL=error

# Show warnings and errors (default)
export NHLE_API_LOGLEVEL=warn

# Show informational messages
export NHLE_API_LOGLEVEL=info

# Show debug messages
export NHLE_API_LOGLEVEL=debug
```

**Note:** Invalid values will trigger a warning and use the default (`'warn'`).

---

## Configuration Methods

### Method 1: Shell Environment Variables

```bash
export NHLE_API_TIMEOUT=10000
export NHLE_API_LANGUAGE=en
export NHLE_API_LOGLEVEL=debug
npm start
```

### Method 2: `.env` File (with dotenv)

Create a `.env` file in your project root:

```env
NHLE_API_TIMEOUT=10000
NHLE_API_LANGUAGE=en
NHLE_API_LOGLEVEL=debug
```

Then load it before importing the NHL API:

```typescript
import "dotenv/config";
import { stats } from "nhle-api";

// Uses configuration from .env
await stats.skaters.getLeaders("points");
```

### Method 3: Programmatically (Node.js)

```typescript
// Must be set BEFORE importing nhle-api
process.env.NHLE_API_TIMEOUT = "10000";
process.env.NHLE_API_LANGUAGE = "fr";
process.env.NHLE_API_LOGLEVEL = "debug";

// Now import the library
import { stats } from "nhle-api";

await stats.skaters.getLeaders("points");
```

---

## Usage Examples

### Basic Usage (Default Configuration)

```typescript
import { stats } from "nhle-api";

// Uses default settings:
// - Timeout: 5000ms
// - Language: 'en'
const leaders = await stats.skaters.getLeaders("points");
```

### Custom Timeout

```bash
export NHLE_API_TIMEOUT=15000
```

```typescript
import { stats } from "nhle-api";

// Requests now timeout after 15 seconds instead of 5
const leaders = await stats.skaters.getLeaders("points");
```

### French Language Responses

```bash
export NHLE_API_LANGUAGE=fr
```

```typescript
import { stats } from "nhle-api";

// Responses will be in French
const leaders = await stats.skaters.getLeaders("points");
```

### Debugging Configuration

```typescript
import { logEnvConfig } from "nhle-api";

// Logs current environment configuration
logEnvConfig();
// Output: NHL API Environment Configuration: {
//   NHLE_API_TIMEOUT: "10000",
//   resolvedTimeout: 10000,
//   resolvedLanguage: "en"
// }
```

---

## Notes

- Environment variables are read **at import time**, not at request time
- To change configuration, you must restart your application
- Invalid values log warnings but don't crash the application
- If you need runtime configuration, consider using the programmatic `NHLClient` API directly
- This configuration applies to all API modules (`stats`, `gc`, `adv`)

---

## Advanced: Custom Client Configuration

For more fine-grained control, you can still create custom client instances:

```typescript
import { NHLClient } from "nhle-api";

// Create a client with custom settings
const customClient = new NHLClient("edge-stats", {
  timeout: 20000,
  headers: { "User-Agent": "MyApp/1.0" },
});

// Use directly
const data = await customClient.get("/en/leaders/skaters/points");
```

This approach bypasses environment variables and gives you full control.
