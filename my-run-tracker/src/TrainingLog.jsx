import React, { useEffect, useState } from 'react';

export default function TrainingLog() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/fetch_runs')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        console.log('Runs data:', data); // Confirm data here
        setRuns(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Fetch error:', error)
      });
  }, []);

  if (loading) return <p className="p-6">Loading runs...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="overflow-x-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Training Log</h1>
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-black">
            <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Distance (mi)</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Moving Time</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Pace (min/mi)</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Avg Speed (mph)</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Elevation Gain (ft)</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Avg HR (bpm)</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Max HR (bpm)</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Cadence (spm)</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Energy (kJ)</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run, idx) => {
            const distanceMiles = run.distance / 1609.34;
            const movingTimeMin = run.moving_time / 60;
  
            const formatDuration = (seconds) => {
              const hrs = Math.floor(seconds / 3600);
              const mins = Math.floor((seconds % 3600) / 60);
              const secs = seconds % 60;
              return [hrs, mins, secs]
                .map((v) => v.toString().padStart(2, '0'))
                .join(':');
            };
  
            const formatPace = (pace) => {
              const mins = Math.floor(pace);
              const secs = Math.round((pace - mins) * 60);
              return `${mins}:${secs.toString().padStart(2, '0')}`;
            };
  
            const movingTimeFormatted = formatDuration(run.moving_time);
            const avgSpeedMph = run.average_speed * 2.23694;
            const paceMinPerMile = distanceMiles > 0 ? (movingTimeMin / distanceMiles) : 0;
  
            return (
              <tr
                key={idx}
                className="even:bg-gray-50 hover:bg-gray-200 cursor-pointer text-black"
              >
                <td className="border border-gray-300 px-4 py-2">{run.name || 'Unnamed Run'}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(run.start_date_local).toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">{distanceMiles.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{movingTimeFormatted}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{formatPace(paceMinPerMile)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{avgSpeedMph.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {(run.total_elevation_gain * 3.28084).toFixed(0)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {run.average_heartrate || 'N/A'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {run.max_heartrate || 'N/A'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {run.average_cadence || 'N/A'}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {run.kilojoules ? run.kilojoules.toFixed(0) : 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}  