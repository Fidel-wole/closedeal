import CallModel from '../models/call';
import { Prospect } from '../models/prospect';
import mongoose from 'mongoose';

class DashboardService {
  async getDashboardStats(userId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [prospectStats, callStats] = await Promise.all([
      Prospect.countDocuments({ userId }),
      CallModel.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            startTime: { $gte: oneWeekAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
            callCount: { $sum: 1 },
            totalDuration: { $sum: "$duration" }, // Assuming duration is a field in CallModel
            minDuration: { $min: "$duration" }, // Assuming duration is a field in CallModel
            maxDuration: { $max: "$duration" } // Assuming duration is a field in CallModel
          }
        },
        {
          $sort: { _id: 1 }
        }
      ])
    ]);

    const stats = callStats.reduce((acc, day) => {
      acc.totalCalls += day.callCount || 0;
      acc.totalDuration += day.totalDuration || 0;
      acc.minDuration = Math.min(acc.minDuration, day.minDuration || acc.minDuration);
      acc.maxDuration = Math.max(acc.maxDuration, day.maxDuration || acc.maxDuration);
      return acc;
    }, {
      totalCalls: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: -Infinity
    });

    // Initialize daily calls data for Monday to Friday
    const dailyCallsData = new Array(5).fill(0); // Only 5 days
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const today = new Date();

    callStats.forEach(day => {
      const dayDate = new Date(day._id);
      const dayOfWeek = dayDate.getDay(); // Get day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      
      // Only process weekdays (Monday to Friday)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dayIndex = daysOfWeek.indexOf(dayDate.toLocaleDateString('en-US', { weekday: 'long' }));
        if (dayIndex >= 0) {
          dailyCallsData[dayIndex - 1] = day.callCount; // Adjust index for Monday as 0
        }
      }
    });

    const dailyCalls = dailyCallsData.map((count, index) => ({
      day: daysOfWeek[index],
      callCount: count
    }));

    return {
      averageCallDuration: stats.totalCalls > 0 ? stats.totalDuration / stats.totalCalls : 0,
      totalCalls: stats.totalCalls,
      conversionRate: prospectStats > 0 ? (stats.totalCalls / prospectStats) * 100 : 0,
      lowestCallTime: stats.minDuration === Infinity ? 0 : stats.minDuration,
      peakCallTime: stats.maxDuration === -Infinity ? 0 : stats.maxDuration,
      dailyCalls: dailyCalls 
    };
  }
}

export default new DashboardService();
