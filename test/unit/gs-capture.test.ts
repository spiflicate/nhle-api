/**
 * The Game Summary capture campaign (scripts/gs-capture): window, caps,
 * game choice and stage coverage. No network.
 */
import { describe, expect, test } from 'bun:test';
import {
   type Campaign,
   contextOf,
   coverage,
   decide,
   LIMITS,
   newCampaign,
   type Observation,
   pickGame,
} from '../../scripts/gs-capture/campaign.ts';
import { relative, summary } from '../../scripts/gs-capture/summary.ts';

const START = '2026-11-06T00:00:00Z';
const at = (hours: number) =>
   new Date(new Date(START).getTime() + hours * 3_600_000);

function campaign(): Campaign {
   return newCampaign(at(-10), {
      id: 2026020251,
      label: 'UTA@MTL',
      startTimeUTC: START,
      selectedAt: at(-10).toISOString(),
      selectedBy: 'dispatch',
   });
}

describe('decide', () => {
   test('selects a game first', () => {
      expect(decide(newCampaign(at(0)), at(0))).toEqual({ kind: 'select' });
   });

   test('waits until six hours before the start, then polls', () => {
      const c = campaign();
      expect(decide(c, at(-7))).toEqual({
         kind: 'wait',
         until: at(-6).toISOString(),
      });
      expect(c.status as string).toBe('waiting');
      expect(decide(c, at(-6))).toEqual({ kind: 'poll' });
      expect(c.status as string).toBe('polling');
   });

   test('polls until an hour after final, then waits for the next day', () => {
      const c = campaign();
      c.status = 'polling';
      c.windowStartedAt = at(-6).toISOString();
      c.finalSeenAt = at(2.5).toISOString();
      expect(decide(c, at(3.4))).toEqual({ kind: 'poll' });
      expect(decide(c, at(3.5))).toEqual({
         kind: 'wait',
         until: at(24).toISOString(),
      });
      expect(c.status as string).toBe('awaiting-next-day');
      expect(c.notes).toEqual([]);
      expect(decide(c, at(24))).toEqual({ kind: 'next-day' });
   });

   test('caps the continuous window at twelve hours', () => {
      const c = campaign();
      c.status = 'polling';
      c.windowStartedAt = at(-6).toISOString();
      expect(decide(c, at(5.9))).toEqual({ kind: 'poll' });
      expect(decide(c, at(6))).toMatchObject({ kind: 'wait' });
      expect(c.notes[0]).toContain('twelve-hour window cap');
   });

   test('keeps requests back for the next-day snapshot', () => {
      const c = campaign();
      c.status = 'polling';
      c.windowStartedAt = at(-6).toISOString();
      c.requests = LIMITS.maxRequests - 6;
      expect(decide(c, at(0))).toEqual({ kind: 'poll' });
      c.requests = LIMITS.maxRequests - 5;
      expect(decide(c, at(0))).toMatchObject({ kind: 'wait' });
      expect(c.notes[0]).toContain('request budget');
      expect(decide(c, at(24))).toEqual({ kind: 'next-day' });
      c.requests = LIMITS.maxRequests - 1;
      expect(decide(c, at(24))).toMatchObject({ kind: 'none' });
      expect(c.status as string).toBe('done');
   });

   test('does nothing once done or stopped', () => {
      const c = campaign();
      c.status = 'stopped';
      expect(decide(c, at(0))).toEqual({
         kind: 'none',
         reason: 'campaign stopped',
      });
   });
});

describe('pickGame', () => {
   const schedule = {
      gameWeek: [
         {
            games: [
               {
                  id: 1,
                  gameState: 'FUT',
                  gameType: 2,
                  startTimeUTC: at(3).toISOString(),
               },
               {
                  id: 2,
                  gameState: 'FUT',
                  gameType: 1,
                  startTimeUTC: at(7).toISOString(),
               },
               {
                  id: 3,
                  gameState: 'FUT',
                  gameType: 2,
                  startTimeUTC: at(9).toISOString(),
                  awayTeam: { abbrev: 'TOR' },
                  homeTeam: { abbrev: 'CGY' },
               },
               {
                  id: 4,
                  gameState: 'FUT',
                  gameType: 2,
                  startTimeUTC: at(8).toISOString(),
               },
            ],
         },
      ],
   };

   test('takes the earliest regular-season game at least six hours away', () => {
      expect(pickGame(schedule, at(1))).toEqual({
         id: 4,
         label: '?@?',
         startTimeUTC: at(8).toISOString(),
      });
      expect(pickGame(schedule, at(2.5))?.id).toBe(3);
   });

   test('finds nothing in an empty schedule', () => {
      expect(pickGame({}, at(0))).toBeUndefined();
   });
});

test('contextOf reads state, period and clock from landing', () => {
   expect(
      contextOf({
         gameState: 'LIVE',
         periodDescriptor: { number: 2, periodType: 'REG' },
         clock: { timeRemaining: '20:00', inIntermission: true },
         startTimeUTC: START,
      }),
   ).toEqual({
      gameState: 'LIVE',
      period: 2,
      periodType: 'REG',
      timeRemaining: '20:00',
      inIntermission: true,
      startTimeUTC: START,
   });
   expect(contextOf(null)).toEqual({});
});

describe('coverage', () => {
   let seq = 0;
   const report = (hours: number, status: number): Observation => ({
      seq: ++seq,
      kind: 'report',
      url: 'gs',
      attempt: 1,
      requestedAt: at(hours).toISOString(),
      status,
      collector: { commit: 'x', version: 1 },
   });
   const context = (
      hours: number,
      ctx: Observation['context'],
   ): Observation => ({
      seq: ++seq,
      kind: 'context',
      url: 'landing',
      attempt: 1,
      requestedAt: at(hours).toISOString(),
      status: 200,
      context: ctx ?? {},
      collector: { commit: 'x', version: 1 },
   });

   test('places each report by the context before it', () => {
      const obs = [
         report(-6, 404),
         context(-6, { gameState: 'FUT' }),
         report(-1, 200),
         context(-1, { gameState: 'PRE' }),
         report(0.5, 200),
         context(0.5, { gameState: 'LIVE', periodType: 'REG' }),
         report(0.8, 200),
         context(0.8, { gameState: 'LIVE', inIntermission: true }),
         report(2.6, 200),
         context(2.6, { gameState: 'FINAL', periodType: 'REG' }),
         report(2.8, 200),
         report(24.1, 200),
      ];
      const stages = coverage(obs, campaign());
      const seqOf = (s: string) => stages.get(s as never)?.seq;
      expect(seqOf('report 404 before publication')).toBe(1);
      expect(seqOf('report published, game not started')).toBe(3);
      expect(seqOf('report while live')).toBe(5);
      expect(seqOf('report during an intermission')).toBe(7);
      expect(seqOf('report right after final')).toBe(9);
      expect(seqOf('next-day report')).toBe(12);
      expect(seqOf('overtime or shootout')).toBeUndefined();

      const text = summary(campaign(), obs);
      expect(text).toContain(
         '| report while live | #5 2026-11-06T00:30:00.000Z | +0h30m |',
      );
      expect(text).toContain('| overtime or shootout | **missing** | |');
      expect(text).toContain('Not covered yet: overtime or shootout.');
   });
});

test('relative', () => {
   expect(relative(at(-5.75).toISOString(), START)).toBe('-5h45m');
   expect(relative(at(1.5).toISOString(), START)).toBe('+1h30m');
});
