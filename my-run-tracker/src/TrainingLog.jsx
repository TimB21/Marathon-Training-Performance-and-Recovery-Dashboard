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
        setRuns(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Loading runs...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Training Log</h1>
      {runs.length === 0 ? (
        <p>No runs found.</p>
      ) : (
        <ul className="space-y-4">
          {runs.map((run, idx) => (
            <li
              key={idx}
              className="p-4 border rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              // You can add onClick here later for detailed run view
            >
              <h2 className="text-xl font-semibold">{run.name || 'Unnamed Run'}</h2>
              <p>Date: {new Date(run.start_date_local).toLocaleString()}</p>
              <p>Distance: {(run.distance / 1000).toFixed(2)} km</p>
              <p>Moving Time: {Math.floor(run.moving_time / 60)} min</p>
              <p>Elevation Gain: {run.total_elevation_gain} m</p>
              <p>Average Speed: {(run.average_speed * 3.6).toFixed(2)} km/h</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
