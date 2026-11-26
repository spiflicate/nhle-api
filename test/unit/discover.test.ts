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
   type Api,
   isCovered,
   isIgnored,
   type Library,
   libraryTemplates,
} from '../../scripts/discover/match.ts';
import {
   type App,
   declaredReports,
   wadlPaths,
} from '../../scripts/discover/sources.ts';

const extract = (source: string) =>
   extractTemplates(source)
      .map((e) => e.path)
      .sort();

const versions = (source: string) =>
   extractTemplates(source).map((e) => `${e.version ?? '-'} ${e.path}`);

describe('extractTemplates', () => {
   test('reads the version from the call the path is passed to', () => {
      expect(
         versions(
            'x=(0,le.xo)("/player/".concat(w,"/bio"),void 0!==w,void 0,le.mG.V2)',
         ),
      ).toEqual(['v2 /player/{}/bio']);
   });

   test('reads the version from the chain of a direct fetch', () => {
      expect(
         versions(
            'fetch("".concat(h.webAPIBaseURL,"/").concat(M.mG.V1,"/playoff-series/carousel/").concat(s,"/"),{credentials:"include"})',
         ),
      ).toEqual(['v1 /playoff-series/carousel/{}/']);
   });

   test('leaves the version unset when the request states none', () => {
      expect(versions('s("/gamecenter/".concat(e,"/landing"),e)')).toEqual([
         '- /gamecenter/{}/landing',
      ]);
   });

   test('lists a path once per version it is requested with', () => {
      expect(
         versions(
            'a=xo("/player/".concat(p,"/game-log"),!0);b=xo("/player/".concat(p,"/game-log"),!0,void 0,le.mG.V2)',
         ).sort(),
      ).toEqual(['- /player/{}/game-log', 'v2 /player/{}/game-log']);
   });

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
      for (const [api, paths] of Object.entries(library)) {
         for (const path of paths) {
            expect(isIgnored(`/${path}`, ignore(api as Api))).toBe(false);
         }
      }
   });

   test('web entries apply to every api-web version, not stats', () => {
      const ignore = loadIgnore({
         '*': { '/pending': 'r' },
         web: { '/scores': 'r' },
         v2: { '/only-v2': 'r' },
      });
      expect(ignore('v1')).toEqual(['/pending', '/scores']);
      expect(ignore('v2')).toEqual(['/pending', '/scores', '/only-v2']);
      expect(ignore('v3')).toEqual(['/pending', '/scores']);
      expect(ignore('stats')).toEqual(['/pending']);
   });
});

describe('libraryTemplates', () => {
   test('lists v1, v2 and stats, stats without the language', () => {
      const { v1, v2, stats } = libraryTemplates();
      expect(v1).toContain('gamecenter/{gameId}/boxscore');
      expect(v1).toContain('player/{playerId}/landing');
      expect(v1).not.toContain('player/{playerId}/header');
      expect(v2).toEqual([
         'player/{playerId}/header',
         'player/{playerId}/home',
         'player/{playerId}/bio',
         'player/{playerId}/player-stats',
         'player/{playerId}/game-log/{season}/{gameType}',
      ]);
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

   test('specTemplate takes the version from the path or the URL', () => {
      expect(
         specTemplate(
            'https://api-web.nhle.com/application.wadl',
            'v2/player/{id}/odds',
         ),
      ).toEqual({ api: 'v2', path: '/player/{}/odds' });
      expect(
         specTemplate(
            'https://api-web.nhle.com/v2/application.wadl',
            'player/{id}/odds',
         ),
      ).toEqual({ api: 'v2', path: '/player/{}/odds' });
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
   const files = new Set(['main']);
   const web: App = { kind: 'web', page: 'p', bundle: /x/ };
   const stats: App = { kind: 'stats', page: 'p', bundle: /y/ };
   const scan: ScanResult = {
      apps: [
         {
            app: web,
            bundleUrl: 'https://example.test/web.js',
            chunks: { listed: 1, fetched: 1 },
            found: new Map([
               [
                  'v1',
                  new Map([
                     ['/score/{}', files],
                     // only on v2 in the library
                     ['/player/{}/bio', files],
                  ]),
               ],
               ['v2', new Map([['/player/{}/bio', files]])],
               ['v3', new Map([['/score/{}', files]])],
            ]),
         },
         {
            app: stats,
            bundleUrl: 'https://example.test/stats.js',
            chunks: { listed: 1, fetched: 1 },
            found: new Map([
               [
                  'stats',
                  new Map([
                     ['/season', files],
                     ['/componentSeason', files],
                     ['/pending', files],
                  ]),
               ],
            ]),
         },
      ],
      specs: [],
      reports: { skater: ['summary', 'newReport'], goalie: [], team: [] },
   };
   const library: Library = {
      v1: ['score/{date}'],
      v2: ['player/{playerId}/bio', 'player/{playerId}/home'],
      stats: ['season', 'skater/{report}'],
   };
   const ignore = loadIgnore({ stats: { '/pending': 'action type' } });
   const declared = {
      skater: new Set(['summary']),
      goalie: new Set<string>(),
      team: new Set<string>(),
   };

   test('matches each API against its own library paths', () => {
      const { findings, unseen } = judge(scan, library, ignore, declared);
      expect(findings).toEqual([
         { kind: 'report', entity: 'skater', name: 'newReport' },
         {
            kind: 'path',
            api: 'v1',
            path: '/player/{}/bio',
            where: ['main'],
         },
         { kind: 'path', api: 'v3', path: '/score/{}', where: ['main'] },
         {
            kind: 'path',
            api: 'stats',
            path: '/componentSeason',
            where: ['main'],
         },
      ] satisfies Finding[]);
      expect(unseen).toEqual([
         { api: 'v2', path: 'player/{playerId}/home' },
         { api: 'stats', path: 'skater/{report}' },
      ]);
   });

   test('labels paths with their version, and keeps first-seen dates', () => {
      const { findings, unseen } = judge(scan, library, ignore, declared);
      const firstSeen = Object.fromEntries(
         findings.map((f) => [keyOf(f), '2026-11-01']),
      );
      const report = renderReport(scan, findings, unseen, firstSeen);
      expect(readState(report)).toEqual(firstSeen);
      expect(report).toContain(
         '| api-web.nhle.com/v1 | `/player/{}/bio` | main | 2026-11-01 |',
      );
      expect(report).toContain('| api-web.nhle.com/v3 | `/score/{}`');
      expect(report).toContain(
         'api-web.nhle.com/v2: `player/{playerId}/home`',
      );
      expect(readState('no state here')).toEqual({});
   });
});
