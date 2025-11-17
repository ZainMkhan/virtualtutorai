import React from 'react';
import type { EventLogsResponse } from '../../../../services/api';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';

interface EventLogsCardProps {
  data: EventLogsResponse | null;
  loading: boolean;
  error: boolean;
}

const EventLogsCard: React.FC<EventLogsCardProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !data || !data.results) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <p className="text-red-600 font-medium">Failed to load event logs</p>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Clock className="h-5 w-5 text-indigo-600" />
        <span>Recent Events</span>
        <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
          {data?.count ?? 0} events
        </span>
      </h2>

      {(data?.results?.length ?? 0) === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No events to display</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {(data?.results ?? []).map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded border ${getSeverityColor(event.severity)}`}
            >
              <div className="flex items-start space-x-3">
                {getSeverityIcon(event.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 capitalize">
                      {(event.event_type ?? '').replace(/_/g, ' ')}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                      event.severity === 'critical' || event.severity === 'error'
                        ? 'bg-red-100 text-red-700'
                        : event.severity === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {event.severity ?? 'unknown'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{event.description ?? '-'}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      User ID: {event.user ?? 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {event.timestamp ? formatDate(event.timestamp) : 'Unknown'}
                    </p>
                  </div>
                  {Object.keys(event.metadata ?? {}).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                        Metadata
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventLogsCard;
