import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { AnalyticsData } from '../../../types';

interface ChartProps {
  isLoading: boolean;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const SKELETON_CLASS = "w-full h-full bg-zinc-100 animate-pulse rounded-xl";

// Common clean tooltip style for light mode
const tooltipStyle = {
  borderRadius: '14px',
  border: '1px solid #e4e4e7',
  backgroundColor: '#ffffff',
  color: '#18181b',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  padding: '10px 14px',
  fontSize: '12px',
  fontWeight: 600
};

// 1. Booking Growth Line Chart
export const BookingGrowthChart: React.FC<ChartProps & { currentYear: AnalyticsData[], previousYear: AnalyticsData[] }> = ({ isLoading, currentYear = [], previousYear = [] }) => {
  if (isLoading) return <div className={SKELETON_CLASS} />;
  
  const data = (currentYear || []).map((cy, i) => ({
    month: cy.month,
    'This Year': cy.bookings,
    'Last Year': (previousYear && previousYear[i]?.bookings) || Math.max(0, cy.bookings - 3)
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#71717a' }} />
        <Line type="monotone" dataKey="This Year" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="Last Year" stroke="#a1a1aa" strokeWidth={2} strokeDasharray="4 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// 2. Revenue Trend Area Chart
export const RevenueTrendChart: React.FC<ChartProps & { data: AnalyticsData[] }> = ({ isLoading, data = [] }) => {
  if (isLoading) return <div className={SKELETON_CLASS} />;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#71717a' }}
          tickFormatter={(value) => `₹${(value / 1000)}k`}
        />
        <Tooltip 
          formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, 'Revenue']}
          contentStyle={tooltipStyle}
        />
        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// 3. Occupancy Donut Chart
export const OccupancyDonutChart: React.FC<ChartProps & { data?: { name: string; value: number }[] }> = ({ isLoading, data }) => {
  if (isLoading) return <div className={SKELETON_CLASS} />;
  
  const chartData = data && data.length > 0 ? data : [
    { name: 'Occupied', value: 31 },
    { name: 'Available', value: 12 },
    { name: 'Maintenance', value: 2 },
  ];
  const donutColors = ['#4f46e5', '#10b981', '#f59e0b'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={75}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// 4. Property Performance Bar Chart
export const PropertyPerformanceChart: React.FC<ChartProps & { data: any[] }> = ({ isLoading, data = [] }) => {
  if (isLoading) return <div className={SKELETON_CLASS} />;
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
        <XAxis 
          dataKey="propertyName" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 11, fill: '#71717a' }} 
          tickFormatter={(name) => name ? String(name).split(' ')[0] : 'Property'} 
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
        <Tooltip 
          cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
          contentStyle={tooltipStyle}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#71717a' }} />
        <Bar dataKey="totalRooms" name="Total Rooms" fill="#e4e4e7" radius={[6, 6, 0, 0]} />
        <Bar dataKey="bookedRooms" name="Booked Rooms" fill="#4f46e5" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// 5. Booking Status Pie Chart
export const BookingStatusChart: React.FC<ChartProps & { data: any[] }> = ({ isLoading, data = [] }) => {
  if (isLoading) return <div className={SKELETON_CLASS} />;
  
  const validData = data && data.length > 0 ? data : [
    { name: 'Confirmed', value: 8 },
    { name: 'Pending', value: 3 },
    { name: 'Cancelled', value: 1 }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={validData}
          cx="50%"
          cy="50%"
          outerRadius={65}
          dataKey="value"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            if (!percent || percent < 0.08) return null;
            return (
              <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
          labelLine={false}
        >
          {validData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
