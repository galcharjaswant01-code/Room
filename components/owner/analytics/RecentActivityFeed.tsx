import React from 'react';
import { ActivityEvent } from '../../../types';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, DollarSign, Home, UserPlus, Star } from 'lucide-react';

interface Props {
  events: ActivityEvent[];
  isLoading: boolean;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'BOOKING_CREATED': return <CheckCircle2 className="text-emerald-500" size={18} />;
    case 'BOOKING_CANCELLED': return <XCircle className="text-rose-500" size={18} />;
    case 'PAYMENT_RECEIVED': return <DollarSign className="text-indigo-500" size={18} />;
    case 'PROPERTY_ADDED': 
    case 'PROPERTY_UPDATED': return <Home className="text-blue-500" size={18} />;
    case 'TENANT_REGISTERED': return <UserPlus className="text-amber-500" size={18} />;
    case 'REVIEW_SUBMITTED': return <Star className="text-yellow-500" size={18} />;
    default: return <CheckCircle2 className="text-zinc-400" size={18} />;
  }
};

const RecentActivityFeed: React.FC<Props> = ({ events, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events.length) {
    return <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">No recent activity</div>;
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div key={event.id} className="flex gap-4">
          <div className="mt-1 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-full shrink-0 h-min">
            {getEventIcon(event.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{event.message}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500">
                {(() => {
                  try {
                    const d = new Date(event.timestamp);
                    if (!isNaN(d.getTime())) {
                      return formatDistanceToNow(d, { addSuffix: true });
                    }
                  } catch (e) {}
                  return event.timestamp || 'Recently';
                })()}
              </span>
              {event.amount && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{event.amount.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivityFeed;
