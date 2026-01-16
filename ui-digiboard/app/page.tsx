'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { FlightData } from '@/types/flight';


export default function Home() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/digital-board');
        if (!response.ok) {
          throw new Error('Failed to fetch flight data');
        }
        const data = await response.json();
        setFlightData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-indigo-800 text-xl font-medium tracking-wide">Loading Flights...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-white max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-lg shadow-indigo-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Departures
              </h1>
            </div>
            <p className="text-gray-500 font-medium ml-1 text-lg">
              {flightData && formatDate(flightData.date)}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-5xl font-light text-slate-900 tracking-tighter">
              {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-indigo-600 font-bold text-sm mt-2 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              {flightData?.total_flights} Scheduled Flights
            </div>
          </div>
        </div>

        {/* Main Board Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Flight</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Airline</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Destination</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Gate</th>
                  <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {flightData?.flights.map((flight) => (
                  <tr
                    key={flight.id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <span className="font-mono text-xl font-bold text-gray-900">
                        {flight.departure_time.substring(0, 5)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{flight.flight_number}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 relative flex-shrink-0 bg-white rounded-xl p-2 border border-gray-100 flex items-center justify-center shadow-sm">
                          <Image
                            src={`http://localhost:8001/storage/${flight.airline.logo}`}
                            alt={flight.airline.name}
                            width={36}
                            height={36}
                            className="object-contain"
                            unoptimized
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{flight.airline.name}</div>
                          <div className="text-xs text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md inline-block mt-1">{flight.airline.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-xl">{flight.destination.city}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 text-sm font-medium">{flight.destination.name}</span>
                          <span className="text-[10px] font-mono text-gray-400 border border-gray-200 px-1 rounded">
                            {flight.destination.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-600 font-bold text-xl border border-gray-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all duration-300">
                        {flight.gate}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className="inline-flex px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm"
                        style={{
                          backgroundColor: flight.status.name === 'On Time' ? '#d1fae5' : flight.status.color,
                          color: flight.status.name === 'On Time' ? '#065f46' : '#ffffff',
                          boxShadow: flight.status.name === 'On Time' ? '0 2px 10px rgba(16, 185, 129, 0.2)' : '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                      >
                        {flight.status.name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-gray-400 px-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
            System Operational • Live Updates
          </div>
          <p className="font-medium">DigiBoard System v1.0</p>
        </div>
      </div>
    </div>
  );
}
