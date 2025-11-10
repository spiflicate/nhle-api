# Cayenne Query Builder Guide

## Overview

The `CayenneQueryBuilder` is a fluent TypeScript API for building complex filter expressions for the NHL API's Cayenne query engine. It supports comparison operators, logical operators (AND/OR), the IN operator for multiple values, the LIKE operator for pattern matching, and logical grouping for complex filter logic.

## Quick Start

### Basic Queries

```typescript
import { CayenneQueryBuilder } from "./utils/cayenne-query-builder";

// Simple equality
const query = new CayenneQueryBuilder()
  .equals("seasonId", "20232024")
  .equals("gameTypeId", 2)
  .build();
// Result: "seasonId=20232024 and gameTypeId=2"

// Using OR
const orQuery = new CayenneQueryBuilder()
  .equals("teamId", "NYR")
  .or()
  .equals("teamId", "BOS")
  .build();
// Result: "teamId=NYR or teamId=BOS"
```

## Operators

### Comparison Operators

Use these for basic field comparisons:

| Method                 | Example                            | Output             |
| ---------------------- | ---------------------------------- | ------------------ |
| `equals()`             | `.equals("teamId", "NYR")`         | `teamId=NYR`       |
| `notEquals()`          | `.notEquals("status", "inactive")` | `status!=inactive` |
| `lessThan()`           | `.lessThan("goals", 20)`           | `goals<20`         |
| `greaterThan()`        | `.greaterThan("goals", 20)`        | `goals>20`         |
| `lessThanOrEqual()`    | `.lessThanOrEqual("age", 35)`      | `age<=35`          |
| `greaterThanOrEqual()` | `.greaterThanOrEqual("age", 25)`   | `age>=25`          |

### IN Operator

Match a field against multiple values:

```typescript
// Multiple numeric values
builder.in("playerId", [8476791, 8477933, 8478402]);
// Generates: "playerId in (8476791, 8477933, 8478402)"

// String values
builder.in("teamId", ["NYR", "BOS", "TOR"]);
// Generates: "teamId in (NYR, BOS, TOR)"

// Single value
builder.in("gameTypeId", [2]);
// Generates: "gameTypeId in (2)"
```

**Note:** The IN operator requires at least one value; an empty array will throw an error.

### LIKE Operator

Pattern matching with wildcard support (`%`):

```typescript
// Match containing text
builder.like("playerName", "%McDavid%");
// Generates: "playerName like '%McDavid%'"

// Match starting with text
builder.like("firstName", "Connor%");
// Generates: "firstName like 'Connor%'"

// Match ending with text
builder.like("teamName", "%Rangers");
// Generates: "teamName like '%Rangers'"
```

### Logical Operators (AND/OR)

Control how conditions are combined:

```typescript
// AND is default (explicit)
builder.equals("seasonId", "20232024").and().equals("gameTypeId", 2).build();
// Generates: "seasonId=20232024 and gameTypeId=2"

// OR operator
builder.equals("status", "active").or().equals("status", "pending").build();
// Generates: "status=active or status=pending"

// Mixing AND and OR
builder
  .equals("seasonId", "20232024")
  .and()
  .equals("gameTypeId", 2)
  .or()
  .equals("status", "archived")
  .build();
// Generates: "seasonId=20232024 and gameTypeId=2 or status=archived"
```

### Grouping with Parentheses

Use grouping to control operator precedence:

```typescript
// Simple grouping: x AND (y OR z)
builder
  .equals("seasonId", "20232024")
  .and()
  .group()
  .equals("teamId", "NYR")
  .or()
  .equals("teamId", "BOS")
  .endGroup()
  .build();
// Generates: "seasonId=20232024 and (teamId=NYR or teamId=BOS)"

// Nested groups
builder
  .group()
  .equals("teamId", "NYR")
  .or()
  .equals("teamId", "BOS")
  .endGroup()
  .and()
  .group()
  .greaterThan("goals", 20)
  .or()
  .greaterThan("assists", 40)
  .endGroup()
  .build();
// Generates: "(teamId=NYR or teamId=BOS) and (goals>20 or assists>40)"
```

**Important:** Always call `endGroup()` to close each opened group. An unclosed group will throw an error when `build()` is called.

### Raw Conditions

For cases where the builder doesn't provide a method, or for a more concise way to express subexpressions, use raw conditions:

```typescript
builder
  .equals("seasonId", "20232024")
  .and()
  .raw("(gamesPlayed>10 or toi>200)")
  .build();
// Generates: "seasonId=20232024 and (gamesPlayed>10 or toi>200)"
```

## Complex Examples

### Player Filter with Multiple Criteria

Find players from specific teams in a season with high stats:

```typescript
const query = new CayenneQueryBuilder()
  .equals("seasonId", "20232024")
  .and()
  .group()
  .in("teamId", ["NYR", "BOS", "TOR"])
  .and()
  .group()
  .greaterThan("goals", 20)
  .or()
  .greaterThan("assists", 40)
  .endGroup()
  .endGroup()
  .build();

// Result: "seasonId=20232024 and (teamId in (NYR, BOS, TOR) and (goals>20 or assists>40))"
```

### Multiple Conditions with Grouping

Find active players OR archived players with high points:

```typescript
const query = new CayenneQueryBuilder()
  .group()
  .equals("status", "active")
  .and()
  .greaterThan("points", 50)
  .endGroup()
  .or()
  .equals("status", "archived")
  .build();

// Result: "(status=active and points>50) or status=archived"
```

### Combining IN and LIKE

Find specific players or players matching a name pattern:

```typescript
const query = new CayenneQueryBuilder()
  .equals("seasonId", "20232024")
  .and()
  .group()
  .in("playerId", [8476791, 8477933])
  .or()
  .like("playerName", "%McDavid%")
  .endGroup()
  .build();

// Result: "seasonId=20232024 and (playerId in (8476791, 8477933) or playerName like '%McDavid%')"
```

## API Reference

### Methods

| Method                 | Signature                                       | Returns  |
| ---------------------- | ----------------------------------------------- | -------- |
| `equals()`             | `(field: string, value: string \| number)`      | `this`   |
| `notEquals()`          | `(field: string, value: string \| number)`      | `this`   |
| `lessThan()`           | `(field: string, value: number)`                | `this`   |
| `greaterThan()`        | `(field: string, value: number)`                | `this`   |
| `lessThanOrEqual()`    | `(field: string, value: number)`                | `this`   |
| `greaterThanOrEqual()` | `(field: string, value: number)`                | `this`   |
| `in()`                 | `(field: string, values: (string \| number)[])` | `this`   |
| `like()`               | `(field: string, pattern: string)`              | `this`   |
| `and()`                | `()`                                            | `this`   |
| `or()`                 | `()`                                            | `this`   |
| `group()`              | `()`                                            | `this`   |
| `endGroup()`           | `()`                                            | `this`   |
| `raw()`                | `(condition: string)`                           | `this`   |
| `build()`              | `()`                                            | `string` |
| `clear()`              | `()`                                            | `this`   |
| `count()`              | `()`                                            | `number` |

## Error Handling

The builder validates your queries and provides clear error messages:

```typescript
// Error: Unclosed group
builder.equals("field1", "value1").group().equals("field2", "value2");
// throws: "Cannot build: 1 group(s) still open. Call endGroup() to close them."

// Error: endGroup without matching group
builder.equals("field1", "value1").endGroup();
// throws: "Cannot end group: no open group found"

// Error: Empty IN array
builder.in("teamId", []);
// throws: Error (IN operator requires at least one value)
```

## Features

✅ **Fluent API** - Method chaining for readable query construction  
✅ **Type-safe** - Full TypeScript support  
✅ **Logical Grouping** - Support for parentheses and operator precedence  
✅ **Multiple Operators** - IN, LIKE, AND, OR, and comparison operators  
✅ **Nested Groups** - Support for complex nested logical expressions  
✅ **Error Handling** - Comprehensive validation and clear error messages  
✅ **Backward Compatible** - Default AND operator between conditions  
✅ **Fully Tested** - 47 comprehensive unit tests

## Notes

- The default logical operator between conditions is **AND**
- Comparison operators use specific methods for clarity (not chainable raw strings)
- The builder is immutable when `build()` is called; call `clear()` to reset and reuse
- GROUP operations work seamlessly with all other operators
- For complex mathematical expressions, use the `raw()` method
