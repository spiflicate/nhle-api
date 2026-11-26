/**
 * Endpoint discovery (scripts/check-discover.ts): reading path templates
 * out of minified bundles, and matching them with the library's paths.
 */
import { describe, expect, test } from 'bun:test';
import {
   type Finding,
   judge,
   keyOf,
   loadIgnore,
   readState,
   renderReport,
   type ScanResult,
   specTemplate,
} from '../../scripts/check-discover.ts';
import {
   chunkFiles,
   extractTemplates,
} from '../../scripts/discover/extract.ts';
import ignoreFile from '../../scripts/discover/ignore.json' with {
   type: 'json',
};
import {
   isCovered,
   isIgnored,
   libraryTemplates,
} from '../../scripts/discover/match.ts';
import {
   type App,
   declaredReports,
   wadlPaths,
} from '../../scripts/discover/sources.ts';

const extract = (source: string) => [...extractTemplates(source)].sort();

describe('extractTemplates', () => {
   test('joins concat chains, with {} for every variable', () => {
      expect(
         extract(
            'c=function(e){return s("/gamecenter/".concat(e,"/boxscore"),e)}',
         ),
      ).toEqual(['/gamecenter/{}/boxscore']);
   });

   test('drops the base URL and version, and the query string', () => {
      expect(
         extract(
            'fetch("".concat(h.webAPIBaseURL,"/").concat(M.mG.V1,"/playoff-series/carousel/").concat(s,"/"))',
         ),
      ).toEqual(['/playoff-series/carousel/{}/']);
      expect(
         extract(
            'a="".concat(window.__BASE_REST_URL__,"/game?cayenneExp=id=").concat(r,"&include=gameFormat")',
         ),
      ).toEqual(['/game']);
   });

   test('collapses neighbouring variables into one placeholder', () => {
      expect(extract('"/edge/skater-detail/".concat(e).concat(t)')).toEqual(
         ['/edge/skater-detail/{}'],
      );
   });

   test('an argument after a comparison is still an argument', () => {
      expect(
         extract('"/club-schedule/".concat(null!=A?A:"","/month/")'),
      ).toEqual(['/club-schedule/{}/month/']);
   });

   test('reads a nested call as one argument', () => {
      expect(extract('"/score/".concat(f(a,"x"),"/y".concat(b))')).toEqual([
         '/score/{}',
      ]);
   });

   test('skips concat arguments, message ids, routes and assets', () => {
      expect(
         extract(
            [
               'x.concat(e,"/landing")',
               '{id:"/avbqB",defaultMessage:[]}',
               '{path:"/skater",loader:f}',
               '{link:"/schedule/".concat(d,"/list")}',
               'g="/logos/nhl/svg/x.svg"',
               '"".concat(n,"px")',
               '"".concat(n,"/franchise=").concat(i)',
            ].join(';'),
         ),
      ).toEqual([]);
   });
});

describe('chunkFiles', () => {
   test('reads the webpack chunk filename function', () => {
      const runtime =
         'n.u=e=>"js/"+({56:"Reports",274:"Home"}[e]||e)+"."+{56:"aa11",274:"bb22",300:"cc33"}[e]+".bundle.js",n.g=x';
      expect(chunkFiles(runtime)).toEqual([
         { id: '56', name: 'Reports', file: 'js/Reports.aa11.bundle.js' },
         { id: '274', name: 'Home', file: 'js/Home.bb22.bundle.js' },
         { id: '300', name: '300', file: 'js/300.cc33.bundle.js' },
      ]);
   });

   test('returns nothing for a bundle without lazy chunks', () => {
      expect(chunkFiles('var a=1')).toEqual([]);
   });
});

describe('isCovered', () => {
   const lib = [
      'gamecenter/{gameId}/boxscore',
      'scoreboard/{date}',
      'schedule/playoff-series/{season}/{seriesLetter}',
      'skater/{report}',
   ];

   test('a {} stands for one or more segments', () => {
      expect(isCovered('/gamecenter/{}/boxscore', lib)).toBe(true);
      expect(isCovered('/gamecenter/{}', lib)).toBe(true);
      expect(isCovered('/schedule/{}', lib)).toBe(true);
   });

   test('a library parameter takes only values the site hard-codes', () => {
      expect(isCovered('/scoreboard/now', lib)).toBe(true);
      expect(isCovered('/scoreboard/20250115', lib)).toBe(true);
      expect(isCovered('/schedule/{}/list', lib)).toBe(false);
   });

   test('a static prefix of a library path is covered', () => {
      expect(isCovered('/skater', lib)).toBe(true);
   });

   test('a different path is not', () => {
      expect(isCovered('/gamecenter/{}/odds', lib)).toBe(false);
      expect(isCovered('/componentSeason', lib)).toBe(false);
   });
});

describe('isIgnored', () => {
   test('matches exact entries and * prefixes', () => {
      const entries = ['/now', '/nhl-edge*'];
      expect(isIgnored('/now', entries)).toBe(true);
      expect(isIgnored('/nhl-edge/skaters/{}', entries)).toBe(true);
      expect(isIgnored('/now/x', entries)).toBe(false);
   });
});

describe('ignore.json', () => {
   test('every entry is a template with a reason', () => {
      for (const [api, entries] of Object.entries(ignoreFile)) {
         if (api === '$comment') continue;
         for (const [path, reason] of Object.entries(
            entries as Record<string, string>,
         )) {
            expect(path).toMatch(/^\/[A-Za-z0-9._~{}/*-]*$/);
            expect(reason.length).toBeGreaterThan(0);
         }
      }
   });

   test('ignores no path the library calls', () => {
      const library = libraryTemplates();
      const ignore = loadIgnore();
      for (const api of ['web', 'stats'] as const) {
         for (const path of library[api]) {
            expect(isIgnored(`/${path}`, ignore[api])).toBe(false);
         }
      }
   });
});

describe('libraryTemplates', () => {
   test('lists both APIs, stats without the language', () => {
      const { web, stats } = libraryTemplates();
      expect(web).toContain('gamecenter/{gameId}/boxscore');
      expect(web).toContain('player/{playerId}/header');
      expect(stats).toContain('skater/{report}');
      expect(stats.some((p) => p.includes('{lang}'))).toBe(false);
   });
});

describe('specs', () => {
   test('wadlPaths joins nested resources', () => {
      const wadl = `<application><resources base="https://api-web.nhle.com/">
         <resource path="/v1"><resource path="score/{date}"><method name="GET"/></resource>
         <resource path="odds/{gameId}"/></resource></resources></application>`;
      expect(wadlPaths(wadl)).toEqual([
         'v1',
         'v1/score/{date}',
         'v1/odds/{gameId}',
      ]);
   });

   test('specTemplate strips the version or language', () => {
      expect(
         specTemplate(
            'https://api-web.nhle.com/application.wadl',
            'v1/odds/{id}',
         ),
      ).toEqual({ api: 'web', path: '/odds/{}' });
      expect(
         specTemplate(
            'https://api.nhle.com/stats/rest/application.wadl',
            '{lang}/componentSeason',
         ),
      ).toEqual({ api: 'stats', path: '/componentSeason' });
   });
});

describe('declaredReports', () => {
   test('reads the report unions from the types', () => {
      const reports = declaredReports();
      expect(reports.skater.has('summary')).toBe(true);
      expect(reports.goalie.has('savesByStrength')).toBe(true);
      expect(reports.team.has('goalsbyperiod')).toBe(true);
   });
});

describe('judge and report', () => {
   const app: App = { api: 'stats', page: 'p', bundle: /x/ };
   const scan: ScanResult = {
      apps: [
         {
            app,
            bundleUrl: 'https://example.test/main.js',
            chunks: { listed: 1, fetched: 1 },
            found: new Map([
               ['/season', new Set(['main'])],
               ['/componentSeason', new Set(['main'])],
               ['/pending', new Set(['main'])],
            ]),
         },
      ],
      specs: [],
      reports: { skater: ['summary', 'newReport'], goalie: [], team: [] },
   };
   const library = { web: [], stats: ['season', 'skater/{report}'] };
   const ignore = { web: [], stats: ['/pending'] };
   const declared = {
      skater: new Set(['summary']),
      goalie: new Set<string>(),
      team: new Set<string>(),
   };

   test('reports uncovered, unignored paths and undeclared reports', () => {
      const { findings, unseen } = judge(scan, library, ignore, declared);
      expect(findings).toEqual([
         {
            kind: 'path',
            api: 'stats',
            path: '/componentSeason',
            where: ['main'],
         },
         { kind: 'report', entity: 'skater', name: 'newReport' },
      ] satisfies Finding[]);
      expect(unseen.stats).toEqual(['skater/{report}']);
   });

   test('first-seen dates round-trip through the report', () => {
      const { findings, unseen } = judge(scan, library, ignore, declared);
      const firstSeen = Object.fromEntries(
         findings.map((f) => [keyOf(f), '2026-11-01']),
      );
      const report = renderReport(scan, findings, unseen, firstSeen);
      expect(readState(report)).toEqual(firstSeen);
      expect(report).toContain('`/componentSeason`');
      expect(readState('no state here')).toEqual({});
   });
});
