'use client';

import { useEffect, useState } from 'react';
import type { DashboardStatistics, TodayFlightsResponse } from '@/types/dashboard';
import { fetchWithAuth } from '@/utils/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [recentFlights, setRecentFlights] = useState<TodayFlightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, flightsRes] = await Promise.all([
          fetchWithAuth('http://localhost:8001/api/dashboard/statistics'),
          fetchWithAuth('http://localhost:8001/api/dashboard/today-flights')
        ]);

        if (!statsRes.ok || !flightsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const statsData = await statsRes.json();
        const flightsData = await flightsRes.json();

        setStats(statsData);
        setRecentFlights(flightsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl shadow-xl border border-white max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 font-medium text-lg">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-4">
          <span className="px-5 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-gray-600 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            System Operational
          </span>
          <span className="px-5 py-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Flights Card */}
        <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 group">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-blue-50 text-blue-600 rounded-2xl p-4 w-14 h-14 flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <span className="text-2xl">✈️</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+12%</span>
          </div>
          <div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Flights Today</p>
            <p className="text-4xl font-extrabold text-gray-900">
              {stats?.summary.total_flights_today || 0}
            </p>
          </div>
        </div>

        {/* Total Airlines Card */}
        <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 group">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-violet-50 text-violet-600 rounded-2xl p-4 w-14 h-14 flex items-center justify-center transition-colors group-hover:bg-violet-600 group-hover:text-white">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Active Airlines</p>
            <p className="text-4xl font-extrabold text-gray-900">
              {stats?.summary.total_airlines || 0}
            </p>
          </div>
        </div>

        {/* Total Gates Card */}
        <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 group">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-amber-50 text-amber-600 rounded-2xl p-4 w-14 h-14 flex items-center justify-center transition-colors group-hover:bg-amber-600 group-hover:text-white">
              <span className="text-2xl">🚪</span>
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              {stats ? Math.round((stats.summary.active_gates_today / stats.summary.total_gates) * 100) : 0}% Load
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Active Gates</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-gray-900">
                {stats?.summary.active_gates_today || 0}
              </p>
              <span className="text-lg text-gray-400 font-bold">/ {stats?.summary.total_gates || 0}</span>
            </div>
          </div>
        </div>

        {/* Flight Status Distribution */}
        <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6">Status Overview</h3>
          <div className="space-y-4">
            {stats?.flights_by_status.slice(0, 3).map((status, idx) => (
              <div key={idx} className="flex justify-between items-center group cursor-default">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full shadow-sm ${status.status === 'On Time' ? 'bg-emerald-500 shadow-emerald-200' :
                    status.status === 'Delayed' ? 'bg-amber-500 shadow-amber-200' :
                      status.status === 'Cancelled' ? 'bg-red-500 shadow-red-200' : 'bg-blue-500 shadow-blue-200'
                    }`}></span>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{status.status}</span>
                </div>
                <span className="font-extrabold text-gray-900 text-sm bg-gray-50 px-3 py-1 rounded-lg">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Flights Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-extrabold text-gray-900">Today's Schedule</h3>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">
              View All Flights
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 font-bold tracking-wider pl-8">Time</th>
                  <th className="px-8 py-5 font-bold tracking-wider">Flight</th>
                  <th className="px-8 py-5 font-bold tracking-wider">Destination</th>
                  <th className="px-8 py-5 font-bold tracking-wider text-center">Gate</th>
                  <th className="px-8 py-5 font-bold tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentFlights?.flights.slice(0, 5).map((flight) => (
                  <tr key={flight.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5 pl-8 font-mono text-gray-900 font-bold text-lg">{flight.departure_time.substring(0, 5)}</td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors">{flight.flight_number}</div>
                      <div className="text-xs text-gray-400 font-bold mt-0.5">{flight.airline}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-gray-900 font-bold text-base">{flight.destination_city}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5 bg-gray-50 px-1.5 py-0.5 rounded inline-block">{flight.destination_code}</div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="bg-gray-50 text-gray-700 px-3 py-2 rounded-xl font-mono font-bold text-sm border border-gray-200 group-hover:border-indigo-200 group-hover:bg-white group-hover:text-indigo-700 transition-all shadow-sm">
                        {flight.gate}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm
                        ${flight.status === 'On Time' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          flight.status === 'Delayed' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            flight.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                              flight.status === 'Boarding' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                        {flight.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Airline Distribution & Upcoming */}
        <div className="space-y-8">
          {/* Top Airlines */}
          <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6">Top Airlines</h3>
            <div className="space-y-6">
              {stats?.flights_by_airline.slice(0, 4).map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="text-gray-900 font-bold text-base">{item.airline}</span>
                    <span className="text-gray-500 text-xs font-bold bg-gray-50 px-3 py-1 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{item.count} flights</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full shadow-sm group-hover:bg-indigo-600 transition-colors"
                      style={{ width: `${(item.count / (stats?.summary.total_flights_today || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gate Utilization Mini-Chart */}
          <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6">Gate Activity</h3>
            <div className="flex flex-wrap gap-3">
              {stats?.gate_utilization.slice(0, 8).map((gate, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-3 rounded-2xl text-center flex-1 min-w-[70px] hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 transition-all cursor-default group">
                  <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Gate</div>
                  <div className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">{gate.gate}</div>
                  <div className="text-xs text-gray-400 font-bold group-hover:text-indigo-500">{gate.flights} ops</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
