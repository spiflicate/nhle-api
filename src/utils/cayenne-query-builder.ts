/**
 * Cayenne Expression Query Builder
 * A utility for constructing cayenneExp filter strings for the NHL Stats API
 * Cayenne expressions are filter strings used in the NHL Stats API to filter results
 *
 * Syntax: condition1=value1 and condition2=value2
 * Example: seasonId=20232024 and gameTypeId=2
 */

/**
 * Represents a single condition in a Cayenne expression
 */
export interface CayenneCondition {
   field: string;
   operator: '=' | '!=' | '<' | '>' | '<=' | '>=' | 'in' | 'like';
   value: string | number | (string | number)[];
   logicalOp?: 'and' | 'or';
}

/**
 * Represents a grouped set of conditions
 */
export interface CayenneGroup {
   type: 'group';
   conditions: (CayenneCondition | CayenneGroup)[];
   logicalOp?: 'and' | 'or';
}

/**
 * Type for items that can be in the conditions array
 */
export type CayenneExpression = CayenneCondition | CayenneGroup;

/**
 * Cayenne Expression Query Builder
 * Provides a fluent API for building complex filter strings
 */
export class CayenneQueryBuilder {
   private conditions: CayenneExpression[] = [];
   private currentLogicalOp: 'and' | 'or' = 'and';
   private groupStack: Array<{
      conditions: CayenneExpression[];
      logicalOp: 'and' | 'or';
   }> = [];

   /**
    * Start a new logical group
    * All subsequent conditions will be added to this group until endGroup() is called
    * @returns This builder instance for chaining
    * @example
    * builder
    *   .equals('field1', 'value1')
    *   .group()
    *   .equals('field2', 'value2')
    *   .or()
    *   .equals('field3', 'value3')
    *   .endGroup()
    *   // Generates: "field1=value1 and (field2=value2 or field3=value3)"
    */
   group(): this {
      // Save the current conditions array and the logical operator that should connect this group
      this.groupStack.push({
         conditions: this.conditions,
         logicalOp: this.currentLogicalOp,
      });
      // Start a new conditions array for the group
      this.conditions = [];
      // Reset logical operator for the new group to AND (it will be overridden by the first condition's logicalOp)
      this.currentLogicalOp = 'and';
      return this;
   }

   /**
    * End the current logical group
    * @returns This builder instance for chaining
    * @throws Error if there's no open group
    */
   endGroup(): this {
      if (this.groupStack.length === 0) {
         throw new Error('Cannot end group: no open group found');
      }

      // Create a group from the current conditions
      const groupConditions = this.conditions;

      // Restore the parent conditions array and the logical operator for this group
      const parent = this.groupStack.pop();
      if (!parent) {
         throw new Error('Failed to restore parent context');
      }

      this.conditions = parent.conditions;
      // Use the parent's saved logical operator as the group's connecting operator
      const groupLogicalOp = parent.logicalOp;
      // Restore the parent's currentLogicalOp
      this.currentLogicalOp = parent.logicalOp;

      // Add the group to the parent
      const group: CayenneGroup = {
         type: 'group',
         conditions: groupConditions,
         logicalOp: groupLogicalOp,
      };

      this.conditions.push(group);
      return this;
   }

   /**
    * Set the logical operator to AND for subsequent conditions
    * @returns This builder instance for chaining
    */
   and(): this {
      this.currentLogicalOp = 'and';
      return this;
   }

   /**
    * Set the logical operator to OR for subsequent conditions
    * @returns This builder instance for chaining
    */
   or(): this {
      this.currentLogicalOp = 'or';
      return this;
   }

   /**
    * Add an equality condition
    * @param field - The field name to filter on
    * @param value - The value to match
    * @returns This builder instance for chaining
    */
   equals(field: string, value: string | number): this {
      this.conditions.push({
         field,
         operator: '=',
         value,
         logicalOp: this.currentLogicalOp,
      });
      return this;
   }

   /**
    * Add a not-equal condition
    * @param field - The field name to filter on
    * @param value - The value to exclude
    * @returns This builder instance for chaining
    */
   notEquals(field: string, value: string | number): this {
      this.conditions.push({
         field,
         operator: '!=',
         value,
         logicalOp: this.currentLogicalOp,
      });
      return this;
   }

   /**
    * Add a less-than condition
    * @param field - The field name to filter on
    * @param value - The upper bound (exclusive)
    * @returns This builder instance for chaining
    */
   lessThan(field: string, value: number): this {
      this.conditions.push({
         field,
         operator: '<',
         value,
         logicalOp: this.currentLogicalOp,
      });
      return this;
   }

   /**
    * Add a greater-than condition
    * @param field - The field name to filter on
    * @param value - The lower bound (exclusive)
    * @returns This builder instance for chaining
    */
   greaterThan(field: string, value: number): this {
      this.conditions.push({
         field,
         operator: '>',
         value,
         logicalOp: this.currentLogicalOp,
      });
      return this;
   }

   /**
    * Add a less-than-or-equal condition
    * @param field - The field name to filter on
    * @param value - The upper bound (inclusive)
    * @returns This builder instance for chaining
    */
   lessThanOrEqual(field: string, value: number): this {
      this.conditions.push({
         field,
         operator: '<=',
         value,
         logicalOp: this.currentLogicalOp,
      });
      return this;
   }

   /**
    * Add a greater-than-or-equal condition
    * @param field - The field name to filter on
    * @param value - The lower bound (inclusive)
    * @returns This builder instance for chaining
    */
   greaterThanOrEqual(field: string, value: number): this {
      this.conditions.push({
         field,
         operator: '>=',
         value,
         logicalOp: this.currentLogicalOp,
      });
      return this;
   }

   /**
    * Add an IN condition to match multiple values
    * @param field - The field name to filter on
    * @param values - Array of values to match against
    * @returns This builder instance for chaining
    * @example
    * builder.in('playerId', [8476791, 8477933, 8478402])
    * // Generates: "playerId in (8476791, 8477933, 8478402)"
    */
   in(field: string, values: (string | number)[]): this {
      if (values.length === 0) {
         throw new Error('IN condition requires at least one value');
      }
      this.conditions.push({
         field,
         operator: 'in',
         value: values,
         logicalOp: this.currentLogicalOp,
      });
      return this;
   }

   /**
    * Add a LIKE condition for pattern matching
    * @param field - The field name to filter on
    * @param pattern - The pattern to match (supports % for wildcards)
    * @returns This builder instance for chaining
    * @example
    * builder.like('playerName', '%McDavid%')
    * // Generates: "playerName like '%McDavid%'"
    */
   like(field: string, pattern: string): this {
      this.conditions.push({
         field,
         operator: 'like',
         value: pattern,
         logicalOp: this.currentLogicalOp,
      });
      return this;
   }

   /**
    * Add a raw condition string
    * Useful for complex expressions or unsupported operators
    * @param condition - The raw condition string (e.g., "playerId=8476791")
    * @returns This builder instance for chaining
    */
   raw(condition: string): this {
      // Store as a special marker for raw conditions
      this.conditions.push({
         field: '__raw__',
         operator: '=',
         value: condition,
         logicalOp: this.currentLogicalOp,
      });
      return this;
   }

   /**
    * Build the cayenneExp string
    * @returns The formatted cayenneExp string ready for API consumption
    */
   build(): string {
      if (this.groupStack.length > 0) {
         throw new Error(
            `Cannot build: ${this.groupStack.length} group(s) still open. Call endGroup() to close them.`,
         );
      }

      const buildExpression = (
         items: CayenneExpression[],
         depth = 0,
      ): string => {
         return items
            .map((item, index) => {
               let expr = '';

               if ('type' in item && item.type === 'group') {
                  // Handle grouped conditions
                  const groupExpr = buildExpression(
                     item.conditions,
                     depth + 1,
                  );
                  expr = `(${groupExpr})`;
               } else if ('field' in item) {
                  // Handle regular conditions
                  const condition = item as CayenneCondition;

                  if (condition.field === '__raw__') {
                     expr = String(condition.value);
                  } else if (condition.operator === 'in') {
                     // Format IN operator with parentheses
                     const values = Array.isArray(condition.value)
                        ? condition.value.join(', ')
                        : condition.value;
                     expr = `${condition.field} in (${values})`;
                  } else if (condition.operator === 'like') {
                     // Format LIKE operator
                     expr = `${condition.field} like '${condition.value}'`;
                  } else {
                     // Standard operators (=, !=, <, >, <=, >=)
                     expr = `${condition.field}${condition.operator}${condition.value}`;
                  }
               }

               // Add logical operator between conditions
               if (index < items.length - 1) {
                  const nextItem = items[index + 1];
                  if (nextItem) {
                     const nextLogicalOp: string =
                        ('logicalOp' in nextItem
                           ? nextItem.logicalOp
                           : undefined) || 'and';
                     expr += ` ${nextLogicalOp}`;
                  }
               }

               return expr;
            })
            .join(' ');
      };

      return buildExpression(this.conditions);
   }

   /**
    * Clear all conditions
    * @returns This builder instance for chaining
    */
   clear(): this {
      this.conditions = [];
      return this;
   }

   /**
    * Get the number of conditions currently in the builder
    */
   count(): number {
      return this.conditions.length;
   }
}

/**
 * Create a new CayenneQueryBuilder instance
 * @returns A new builder instance
 */
export function createCayenneQuery(): CayenneQueryBuilder {
   return new CayenneQueryBuilder();
}

/**
 * Quick helper to build a simple cayenneExp from an object
 * @param filters - An object where keys are field names and values are expected values
 * @returns The formatted cayenneExp string
 * @example
 * buildCayenneExp({ seasonId: '20232024', gameTypeId: 2 })
 * // Returns: "seasonId=20232024 and gameTypeId=2"
 */
export function buildCayenneExp(
   filters: Record<string, string | number>,
): string {
   const builder = new CayenneQueryBuilder();
   Object.entries(filters).forEach(([field, value]) => {
      builder.equals(field, value);
   });
   return builder.build();
}
