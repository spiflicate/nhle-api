export interface NetworkTVSchedule {
   date: Date;
   startDate: Date;
   endDate: Date;
   broadcasts: Broadcast[];
}

export interface Broadcast {
   startTime: Date;
   endTime: Date;
   durationSeconds: number;
   title: string;
   description: string;
   houseNumber: string;
   broadcastType: 'HD' | string;
   broadcastStatus: 'LIVE' | '' | string;
   broadcastImageUrl: string;
}
