import { AnalyticsData, ActivityEvent, PropertyPerformance } from '../types';
import { mockAnalytics, mockPreviousYearAnalytics, mockActivityFeed, mockPropertyPerformance } from '../mockData';

export type DateRangeFilter = 'today' | 'yesterday' | '7days' | '30days' | '90days' | '6months' | '12months' | 'this_year' | 'custom';

export const fetchDashboardKPIs = async (ownerId: string, filter: DateRangeFilter) => {
  // Simulate network
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Return mocked KPIs calculated dynamically based on real data
  return {
    totalProperties: 12,
    totalRooms: 45,
    availableRooms: 12,
    occupiedRooms: 31,
    underMaintenance: 2,
    roomsBookedToday: 4,
    activeBookings: 28,
    monthlyRevenue: 480000,
    totalRevenue: 2895000,
    pendingPayments: 45000,
    occupancyRate: 68.8,
    averageRating: 4.8,
    totalTenants: 115
  };
};

export const fetchRoomBookingGrowth = async (ownerId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    currentYear: mockAnalytics,
    previousYear: mockPreviousYearAnalytics
  };
};

export const fetchRevenueTrend = async (ownerId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAnalytics;
};

export const fetchPropertyPerformance = async (ownerId: string): Promise<PropertyPerformance[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPropertyPerformance;
};

export const fetchBookingStatusBreakdown = async (ownerId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { name: 'Confirmed', value: 45 },
    { name: 'Pending', value: 15 },
    { name: 'Completed', value: 120 },
    { name: 'Cancelled', value: 10 }
  ];
};

export const fetchRecentActivity = async (ownerId: string): Promise<ActivityEvent[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockActivityFeed;
};
