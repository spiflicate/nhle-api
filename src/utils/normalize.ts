const alternateAbbreviations: Record<string, string> = {
   CLS: 'CBJ',
   CAL: 'CGY',
   LA: 'LAK',
   'L.A': 'LAK',
   MON: 'MTL',
   NJ: 'NJD',
   'N.J': 'NJD',
   SJ: 'SJS',
   'S.J': 'SJS',
   TB: 'TBL',
   'T.B': 'TBL',
   UTAH: 'UTA',
   // confirm if the NHL has a standard for players with no team associated
   // NA: 'N/A',
   // '(N/A)': 'N/A',
};

export const normalizeAbbrev = (abbrev: string): string => {
   const upperAbbrev = abbrev.toUpperCase();
   return alternateAbbreviations[upperAbbrev] ?? upperAbbrev;
};
