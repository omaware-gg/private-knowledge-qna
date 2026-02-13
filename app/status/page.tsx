'use client';

import { useEffect, useState } from 'react';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'error';
  message?: string;
}

interface StatusResponse {
  status: 'healthy' | 'degraded';
  checks: HealthCheck[];
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatusData(data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Status</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">System Status</h1>

      {statusData && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            statusData.status === 'healthy' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {statusData.status === 'healthy' ? '✅' : '⚠️'}
              </span>
              <span className="text-lg font-semibold">
                Overall Status: {statusData.status === 'healthy' ? 'Healthy' : 'Degraded'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statusData.checks.map((check, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {check.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${
                        check.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {check.status === 'healthy' ? '✅ Healthy' : '❌ Error'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {check.message || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
