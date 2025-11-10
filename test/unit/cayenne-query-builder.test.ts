import { describe, expect, test } from 'bun:test';
import {
   buildCayenneExp,
   CayenneQueryBuilder,
   createCayenneQuery,
} from '#/utils/cayenne-query-builder.ts';

describe('CayenneQueryBuilder', () => {
   test('should create a new builder instance', () => {
      const builder = new CayenneQueryBuilder();
      expect(builder).toBeDefined();
      expect(builder.count()).toBe(0);
   });

   test('should build a simple equals expression', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .build();
      expect(query).toBe('seasonId=20232024');
   });

   test('should build multiple conditions with AND', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .equals('gameTypeId', 2)
         .build();
      expect(query).toBe('seasonId=20232024 and gameTypeId=2');
   });

   test('should support notEquals operator', () => {
      const query = new CayenneQueryBuilder()
         .notEquals('status', 'inactive')
         .build();
      expect(query).toBe('status!=inactive');
   });

   test('should support lessThan operator', () => {
      const query = new CayenneQueryBuilder().lessThan('age', 30).build();
      expect(query).toBe('age<30');
   });

   test('should support greaterThan operator', () => {
      const query = new CayenneQueryBuilder()
         .greaterThan('gamesPlayed', 5)
         .build();
      expect(query).toBe('gamesPlayed>5');
   });

   test('should support lessThanOrEqual operator', () => {
      const query = new CayenneQueryBuilder()
         .lessThanOrEqual('age', 35)
         .build();
      expect(query).toBe('age<=35');
   });

   test('should support greaterThanOrEqual operator', () => {
      const query = new CayenneQueryBuilder()
         .greaterThanOrEqual('gamesPlayed', 10)
         .build();
      expect(query).toBe('gamesPlayed>=10');
   });

   test('should support raw expressions', () => {
      const query = new CayenneQueryBuilder()
         .raw('goals/gamesPlayed>0.5')
         .build();
      expect(query).toBe('goals/gamesPlayed>0.5');
   });

   test('should build complex queries with mixed operators', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .equals('gameTypeId', 2)
         .greaterThan('gamesPlayed', 5)
         .lessThanOrEqual('age', 35)
         .notEquals('status', 'inactive')
         .build();
      expect(query).toBe(
         'seasonId=20232024 and gameTypeId=2 and gamesPlayed>5 and age<=35 and status!=inactive',
      );
   });

   test('should allow method chaining', () => {
      const builder = new CayenneQueryBuilder();
      const result = builder
         .equals('field1', 'value1')
         .equals('field2', 'value2')
         .equals('field3', 'value3');
      expect(result).toBe(builder);
   });

   test('should track condition count', () => {
      const builder = new CayenneQueryBuilder();
      expect(builder.count()).toBe(0);
      builder.equals('field1', 'value1');
      expect(builder.count()).toBe(1);
      builder.equals('field2', 'value2');
      expect(builder.count()).toBe(2);
   });

   test('should clear all conditions', () => {
      const builder = new CayenneQueryBuilder()
         .equals('field1', 'value1')
         .equals('field2', 'value2');
      expect(builder.count()).toBe(2);
      builder.clear();
      expect(builder.count()).toBe(0);
      expect(builder.build()).toBe('');
   });

   test('should return empty string when no conditions', () => {
      const query = new CayenneQueryBuilder().build();
      expect(query).toBe('');
   });

   test('createCayenneQuery should return a builder instance', () => {
      const builder = createCayenneQuery();
      expect(builder).toBeInstanceOf(CayenneQueryBuilder);
   });

   test('buildCayenneExp should create expression from object', () => {
      const exp = buildCayenneExp({
         seasonId: '20232024',
         gameTypeId: 2,
      });
      expect(exp).toBe('seasonId=20232024 and gameTypeId=2');
   });

   test('buildCayenneExp should handle single field', () => {
      const exp = buildCayenneExp({ seasonId: '20232024' });
      expect(exp).toBe('seasonId=20232024');
   });

   test('buildCayenneExp should handle empty object', () => {
      const exp = buildCayenneExp({});
      expect(exp).toBe('');
   });

   // Tests for IN operator
   test('should support IN operator with single value', () => {
      const query = new CayenneQueryBuilder().in('gameTypeId', [2]).build();
      expect(query).toBe('gameTypeId in (2)');
   });

   test('should support IN operator with multiple values', () => {
      const query = new CayenneQueryBuilder()
         .in('playerId', [8476791, 8477933, 8478402])
         .build();
      expect(query).toBe('playerId in (8476791, 8477933, 8478402)');
   });

   test('should support IN operator with string values', () => {
      const query = new CayenneQueryBuilder()
         .in('teamId', ['NYR', 'BOS', 'TOR'])
         .build();
      expect(query).toBe('teamId in (NYR, BOS, TOR)');
   });

   test('should throw error for IN with empty array', () => {
      const builder = new CayenneQueryBuilder();
      expect(() => {
         builder.in('gameTypeId', []);
      }).toThrow('IN condition requires at least one value');
   });

   // Tests for LIKE operator
   test('should support LIKE operator', () => {
      const query = new CayenneQueryBuilder()
         .like('playerName', '%McDavid%')
         .build();
      expect(query).toBe("playerName like '%McDavid%'");
   });

   test('should support LIKE operator with leading wildcard', () => {
      const query = new CayenneQueryBuilder()
         .like('teamName', '%Rangers%')
         .build();
      expect(query).toBe("teamName like '%Rangers%'");
   });

   // Tests for AND/OR operators
   test('should default to AND between conditions', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .equals('gameTypeId', 2)
         .equals('status', 'active')
         .build();
      expect(query).toBe(
         'seasonId=20232024 and gameTypeId=2 and status=active',
      );
   });

   test('should support OR operator', () => {
      const query = new CayenneQueryBuilder()
         .equals('teamId', 'NYR')
         .or()
         .equals('teamId', 'BOS')
         .build();
      expect(query).toBe('teamId=NYR or teamId=BOS');
   });

   test('should support switching between AND and OR', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .and()
         .equals('gameTypeId', 2)
         .or()
         .equals('status', 'inactive')
         .build();
      expect(query).toBe(
         'seasonId=20232024 and gameTypeId=2 or status=inactive',
      );
   });

   test('should support mixed operators with AND/OR', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .and()
         .in('gameTypeId', [2, 3])
         .or()
         .like('teamName', '%Rangers%')
         .build();
      expect(query).toBe(
         "seasonId=20232024 and gameTypeId in (2, 3) or teamName like '%Rangers%'",
      );
   });

   test('should support complex query with IN, LIKE, AND, OR', () => {
      const query = new CayenneQueryBuilder()
         .in('playerId', [8476791, 8477933])
         .and()
         .like('playerName', '%McDavid%')
         .or()
         .greaterThan('goals', 20)
         .and()
         .lessThanOrEqual('age', 35)
         .build();
      expect(query).toBe(
         "playerId in (8476791, 8477933) and playerName like '%McDavid%' or goals>20 and age<=35",
      );
   });

   test('should support AND method to reset operator', () => {
      const query = new CayenneQueryBuilder()
         .equals('field1', 'value1')
         .or()
         .equals('field2', 'value2')
         .and()
         .equals('field3', 'value3')
         .build();
      expect(query).toBe(
         'field1=value1 or field2=value2 and field3=value3',
      );
   });

   test('should support raw conditions with logical operators', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .and()
         .raw('goals/gamesPlayed>0.5')
         .or()
         .raw('points>100')
         .build();
      expect(query).toBe(
         'seasonId=20232024 and goals/gamesPlayed>0.5 or points>100',
      );
   });

   // Tests for logical grouping with parentheses
   test('should support simple grouped expression with AND', () => {
      const query = new CayenneQueryBuilder()
         .equals('field1', 'value1')
         .and()
         .group()
         .equals('field2', 'value2')
         .and()
         .equals('field3', 'value3')
         .endGroup()
         .build();
      expect(query).toBe(
         'field1=value1 and (field2=value2 and field3=value3)',
      );
   });

   test('should support grouped expression with OR inside', () => {
      const query = new CayenneQueryBuilder()
         .equals('field1', 'value1')
         .and()
         .group()
         .equals('field2', 'value2')
         .or()
         .equals('field3', 'value3')
         .endGroup()
         .build();
      expect(query).toBe(
         'field1=value1 and (field2=value2 or field3=value3)',
      );
   });

   test('should support x AND (y OR z) pattern', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .and()
         .group()
         .equals('teamId', 'NYR')
         .or()
         .equals('teamId', 'BOS')
         .endGroup()
         .build();
      expect(query).toBe(
         'seasonId=20232024 and (teamId=NYR or teamId=BOS)',
      );
   });

   test('should support (x OR y) AND z pattern', () => {
      const query = new CayenneQueryBuilder()
         .group()
         .equals('teamId', 'NYR')
         .or()
         .equals('teamId', 'BOS')
         .endGroup()
         .and()
         .equals('seasonId', '20232024')
         .build();
      expect(query).toBe(
         '(teamId=NYR or teamId=BOS) and seasonId=20232024',
      );
   });

   test('should support nested groups', () => {
      const query = new CayenneQueryBuilder()
         .group()
         .equals('field1', 'value1')
         .and()
         .group()
         .equals('field2', 'value2')
         .or()
         .equals('field3', 'value3')
         .endGroup()
         .endGroup()
         .build();
      expect(query).toBe(
         '(field1=value1 and (field2=value2 or field3=value3))',
      );
   });

   test('should support groups with IN operator', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .and()
         .group()
         .in('playerId', [8476791, 8477933])
         .or()
         .like('playerName', '%McDavid%')
         .endGroup()
         .build();
      expect(query).toBe(
         "seasonId=20232024 and (playerId in (8476791, 8477933) or playerName like '%McDavid%')",
      );
   });

   test('should support groups with comparison operators', () => {
      const query = new CayenneQueryBuilder()
         .group()
         .greaterThan('goals', 20)
         .and()
         .lessThan('age', 30)
         .endGroup()
         .or()
         .group()
         .greaterThanOrEqual('assists', 50)
         .endGroup()
         .build();
      expect(query).toBe('(goals>20 and age<30) or (assists>=50)');
   });

   test('should support complex multi-level nested groups', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .and()
         .group()
         .group()
         .equals('teamId', 'NYR')
         .or()
         .equals('teamId', 'BOS')
         .endGroup()
         .and()
         .greaterThan('goals', 20)
         .endGroup()
         .build();
      expect(query).toBe(
         'seasonId=20232024 and ((teamId=NYR or teamId=BOS) and goals>20)',
      );
   });

   test('should throw error when endGroup is called without matching group', () => {
      const builder = new CayenneQueryBuilder().equals('field1', 'value1');
      expect(() => {
         builder.endGroup();
      }).toThrow('Cannot end group: no open group found');
   });

   test('should throw error when build is called with unclosed groups', () => {
      const builder = new CayenneQueryBuilder()
         .equals('field1', 'value1')
         .and()
         .group()
         .equals('field2', 'value2');
      expect(() => {
         builder.build();
      }).toThrow('Cannot build: 1 group(s) still open');
   });

   test('should throw error with multiple unclosed groups', () => {
      const builder = new CayenneQueryBuilder()
         .group()
         .group()
         .equals('field1', 'value1');
      expect(() => {
         builder.build();
      }).toThrow('Cannot build: 2 group(s) still open');
   });

   test('should support switching between AND and OR outside groups', () => {
      const query = new CayenneQueryBuilder()
         .group()
         .equals('field1', 'value1')
         .or()
         .equals('field2', 'value2')
         .endGroup()
         .and()
         .equals('field3', 'value3')
         .or()
         .equals('field4', 'value4')
         .build();
      expect(query).toBe(
         '(field1=value1 or field2=value2) and field3=value3 or field4=value4',
      );
   });

   test('should support raw conditions in groups', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .and()
         .group()
         .raw('goals/gamesPlayed>0.5')
         .or()
         .raw('points>100')
         .endGroup()
         .build();
      expect(query).toBe(
         'seasonId=20232024 and (goals/gamesPlayed>0.5 or points>100)',
      );
   });

   test('should support raw expression with parentheses and logical operators', () => {
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .and()
         .raw('(gamesPlayed>10 or toi>200)')
         .build();
      expect(query).toBe(
         'seasonId=20232024 and (gamesPlayed>10 or toi>200)',
      );
   });

   test('should clear conditions and grouping stack', () => {
      const builder = new CayenneQueryBuilder()
         .equals('field1', 'value1')
         .and()
         .group()
         .equals('field2', 'value2')
         .endGroup();
      builder.clear();
      expect(builder.count()).toBe(0);
      expect(builder.build()).toBe('');
   });

   test('should support multiple sequential groups', () => {
      const query = new CayenneQueryBuilder()
         .group()
         .equals('field1', 'value1')
         .or()
         .equals('field2', 'value2')
         .endGroup()
         .and()
         .group()
         .equals('field3', 'value3')
         .or()
         .equals('field4', 'value4')
         .endGroup()
         .build();
      expect(query).toBe(
         '(field1=value1 or field2=value2) and (field3=value3 or field4=value4)',
      );
   });

   test('should support complex real-world filtering pattern', () => {
      // Find players from specific teams in a season with high stats
      // OR players with specific names regardless of stats
      const query = new CayenneQueryBuilder()
         .equals('seasonId', '20232024')
         .and()
         .group()
         .in('teamId', ['NYR', 'BOS', 'TOR'])
         .and()
         .group()
         .greaterThan('goals', 20)
         .or()
         .greaterThan('assists', 40)
         .endGroup()
         .endGroup()
         .or()
         .like('playerName', '%McDavid%')
         .build();
      expect(query).toBe(
         "seasonId=20232024 and (teamId in (NYR, BOS, TOR) and (goals>20 or assists>40)) or playerName like '%McDavid%'",
      );
   });
});
