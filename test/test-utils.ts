// biome-ignore-all lint/suspicious/noExplicitAny: used for testing utilities
/**
 * Test utilities for edge-stats API tests
 * Provides helpers for mocking and testing
 */

/**
 * Mock response factory for creating consistent test responses
 */
export const MockResponseFactory = {
   /**
    * Create a mock paginated response
    */
   paginatedResponse<T>(data: T[], total: number = data.length) {
      return {
         data,
         total,
         limit: data.length,
         start: 0,
      };
   },

   /**
    * Create a mock skater stats response
    */
   skaterStats(overrides: Partial<any> = {}) {
      return {
         playerId: 8476791,
         firstName: 'Connor',
         lastName: 'McDavid',
         seasonId: '20232024',
         gamesPlayed: 76,
         goals: 32,
         assists: 72,
         points: 104,
         plusMinus: 15,
         penaltyMinutes: 24,
         ...overrides,
      };
   },

   /**
    * Create a mock goalie stats response
    */
   goalieStats(overrides: Partial<any> = {}) {
      return {
         playerId: 8474141,
         firstName: 'Connor',
         lastName: 'Hellebuyck',
         seasonId: '20232024',
         gamesPlayed: 63,
         wins: 37,
         losses: 15,
         overtimeLosses: 8,
         shutouts: 8,
         goalsAgainstAverage: 2.57,
         savePercentage: 0.92,
         ...overrides,
      };
   },

   /**
    * Create a mock team response
    */
   team(overrides: Partial<any> = {}) {
      return {
         id: 10,
         name: 'Toronto Maple Leafs',
         abbreviation: 'TOR',
         franchiseId: 5,
         ...overrides,
      };
   },

   /**
    * Create a mock team stats response
    */
   teamStats(overrides: Partial<any> = {}) {
      return {
         id: 10,
         name: 'Toronto Maple Leafs',
         abbreviation: 'TOR',
         seasonId: '20232024',
         gamesPlayed: 82,
         wins: 43,
         losses: 23,
         overtimeLosses: 16,
         points: 102,
         shotsForPerGame: 28.5,
         shotsAgainstPerGame: 27.2,
         ...overrides,
      };
   },

   /**
    * Create a mock season response
    */
   season(overrides: Partial<any> = {}) {
      return {
         id: '20232024',
         seasonId: '20232024',
         regularSeasonStartDate: '2023-10-10',
         regularSeasonEndDate: '2024-04-14',
         playoffsStartDate: '2024-04-15',
         playoffsEndDate: '2024-06-24',
         ...overrides,
      };
   },

   /**
    * Create a mock game response
    */
   game(overrides: Partial<any> = {}) {
      return {
         gameId: '2023020001',
         date: '2023-10-10',
         homeTeam: { id: 10, abbreviation: 'TOR' },
         awayTeam: { id: 17, abbreviation: 'OTT' },
         homeTeamScore: 4,
         awayTeamScore: 3,
         status: 'FINAL',
         ...overrides,
      };
   },

   /**
    * Create a mock country response
    */
   country(overrides: Partial<any> = {}) {
      return {
         code: 'CAN',
         name: 'Canada',
         ...overrides,
      };
   },

   /**
    * Create a mock glossary entry
    */
   glossaryEntry(overrides: Partial<any> = {}) {
      return {
         term: 'GAA',
         definition: 'Goals Against Average',
         ...overrides,
      };
   },
};

/**
 * Mock fetch implementation for testing without real HTTP calls
 */
export class MockFetch {
   private responses: Map<string, any> = new Map();
   private callHistory: Array<{ url: string; params?: any }> = [];

   /**
    * Register a mock response for a URL
    */
   register(url: string, response: any) {
      this.responses.set(url, response);
   }

   /**
    * Register a response for a URL pattern with callback
    */
   registerPattern(
      pattern: RegExp,
      callback: (url: string, params: any) => any,
   ) {
      this.register(pattern.toString(), callback);
   }

   /**
    * Get the fetch mock function
    */
   getMockFetch() {
      return async (url: string, options?: any) => {
         this.callHistory.push({ url, params: options?.params });

         const response = this.responses.get(url);
         if (!response) {
            return {
               ok: false,
               status: 404,
               statusText: 'Not Found',
               json: async () => ({ error: 'Not found' }),
            };
         }

         const data =
            typeof response === 'function' ? response(url) : response;

         return {
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => data,
         };
      };
   }

   /**
    * Get call history
    */
   getCallHistory() {
      return [...this.callHistory];
   }

   /**
    * Clear call history
    */
   clearHistory() {
      this.callHistory = [];
   }

   /**
    * Reset all mocks
    */
   reset() {
      this.responses.clear();
      this.clearHistory();
   }
}

/**
 * Test helper functions
 */
export const testHelpers = {
   /**
    * Create a mock response for a successful API call
    */
   successResponse: <T extends unknown[]>(data: T, total?: number) =>
      MockResponseFactory.paginatedResponse(data, total),

   /**
    * Create a mock error response
    */
   errorResponse: (status: number, message: string) => ({
      ok: false,
      status,
      statusText: message,
   }),

   /**
    * Wait for async operations
    */
   wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

   /**
    * Compare two objects ignoring certain fields
    */
   compareObjects: (obj1: any, obj2: any, ignoreFields: string[] = []) => {
      const obj1Copy = { ...obj1 };
      const obj2Copy = { ...obj2 };
      ignoreFields.forEach((field) => {
         delete obj1Copy[field];
         delete obj2Copy[field];
      });
      return JSON.stringify(obj1Copy) === JSON.stringify(obj2Copy);
   },
};

/**
 * Test data sets
 */
export const testData = {
   seasonId: '20232024',
   gameTypeId: 2, // Regular season
   playerId: 8476791, // Connor McDavid
   teamId: 10, // Toronto Maple Leafs
   gameId: '2023020001',

   // Sample players for testing
   players: [
      { playerId: 8476791, name: 'Connor McDavid', position: 'C' },
      { playerId: 8480793, name: 'Leon Draisaitl', position: 'LW' },
      { playerId: 8471214, name: 'Sidney Crosby', position: 'C' },
   ],

   // Sample teams
   teams: [
      { id: 10, abbreviation: 'TOR', name: 'Toronto Maple Leafs' },
      { id: 17, abbreviation: 'OTT', name: 'Ottawa Senators' },
      { id: 1, abbreviation: 'MTL', name: 'Montreal Canadiens' },
   ],

   // Sample countries
   countries: [
      { code: 'CAN', name: 'Canada' },
      { code: 'USA', name: 'United States' },
      { code: 'SWE', name: 'Sweden' },
   ],

   // Sample glossary entries
   glossaryEntries: [
      { term: 'GAA', definition: 'Goals Against Average' },
      { term: 'SV%', definition: 'Save Percentage' },
      { term: '+/-', definition: 'Plus/Minus' },
   ],
};
