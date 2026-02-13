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

  const isHealthy = statusData?.status === 'healthy';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white/90 mb-2">
          System Status
        </h1>
        <p className="text-white/40 text-sm">
          Real-time health of all services. Auto-refreshes every 30 seconds.
        </p>
      </div>

      {loading ? (
        <div className="glass p-8 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl loading-shimmer"
            />
          ))}
        </div>
      ) : (
        statusData && (
          <div className="space-y-6">
            {/* Overall status banner */}
            <div
              className={`glass p-5 flex items-center gap-4 ${
                isHealthy ? 'border-emerald-400/20' : 'border-amber-400/20'
              }`}
              style={{
                borderColor: isHealthy
                  ? 'rgba(52,211,153,0.2)'
                  : 'rgba(251,191,36,0.2)',
              }}
            >
              <div
                className={`relative flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isHealthy
                    ? 'bg-emerald-500/15'
                    : 'bg-amber-500/15'
                }`}
              >
                {isHealthy ? (
                  <svg
                    className="w-6 h-6 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                )}
                {/* Pulse indicator */}
                <span
                  className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${
                    isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                >
                  <span
                    className={`absolute inset-0 rounded-full animate-ping ${
                      isHealthy ? 'bg-emerald-400/60' : 'bg-amber-400/60'
                    }`}
                  />
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white/85">
                  {isHealthy ? 'All Systems Operational' : 'Degraded Performance'}
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  {statusData.checks.filter((c) => c.status === 'healthy').length}
                  /{statusData.checks.length} services healthy
                </p>
              </div>
            </div>

            {/* Service checks */}
            <div className="glass overflow-hidden divide-y divide-white/[0.04]">
              {statusData.checks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        check.status === 'healthy'
                          ? 'bg-emerald-400'
                          : 'bg-red-400'
                      }`}
                    />
                    <span className="text-sm font-medium text-white/75">
                      {check.service}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {check.message && (
                      <span className="text-xs text-white/30 max-w-[250px] truncate hidden sm:inline">
                        {check.message}
                      </span>
                    )}
                    {check.status === 'healthy' ? (
                      <span className="badge-success">Healthy</span>
                    ) : (
                      <span className="badge-error">Error</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
