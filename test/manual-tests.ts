import { CayenneQueryBuilder, skaters } from '#/api/edge-stats/index.ts';

const builder = new CayenneQueryBuilder();

builder
   .equals('teamId', 10)
   .notEquals('status', 'inactive')
   .lessThan('age', 30)
   .greaterThanOrEqual('gamesPlayed', 50);

const queryConditions = builder.build();

console.log('Cayenne Query Conditions:', queryConditions);
console.log(
   'Cayenne Query Conditions:',
   encodeURIComponent(queryConditions),
);

// const stats = await skaters.getStatsWithBuilder(
//    'summary',
//    (q) => ({
//       cayenneExp: q
//          .equals('teamId', 10)
//          .notEquals('status', 'inactive')
//          .lessThan('age', 30)
//          .build(),
//       sort: 'points',
//       limit: 5,
//       dir: 'desc' as const,
//    }),
//    'en',
// );

//curl -X GET "https://api.nhle.com/stats/rest/en/skater/summary?limit=72&start=17&sort=points&cayenneExp=seasonId=20232024"

const stats = await skaters.getStatsWithParams('summary', {
   cayenneExp: 'seasonId=20232024',
   sort: 'points',
   limit: 5,
});
console.log('Skater Stats:', stats);
