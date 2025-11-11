export interface NetworkTVSchedule {
   date: string;
   startDate: string;
   endDate: string;
   broadcasts: Broadcast[];
}

export interface Broadcast {
   startTime: string;
   endTime: string;
   durationSeconds: number;
   title: string;
   description: string;
   houseNumber: string;
   broadcastType: 'HD' | string;
   broadcastStatus: 'LIVE' | '' | string;
   broadcastImageUrl: string;
}
