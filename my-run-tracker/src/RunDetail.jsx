import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';
import { DateTime } from 'luxon';

const RunDetail = () => {
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [splits, setSplits] = useState([]);

  const mapRef = useRef(null);

  useEffect(() => {
    fetch(`/run/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Run not found");
        return res.json();
      })
      .then((data) => setRun(data))
      .catch((err) => {
        console.error(err);
        setRun(null);
      });

      fetch(`/splits_by_run/${id}`)
      .then((res) => res.json())
      .then((data) => setSplits(data))
      .catch((err) => {
        console.error(err);
        setSplits(null);
      });

  }, [id]);

  useEffect(() => {
    if (run && run['map.summary_polyline']) {
      if (mapRef.current) {
        mapRef.current.remove(); // reset if already initialized
        mapRef.current = null;
      }

      const coords = polyline.decode(run['map.summary_polyline']);
      const latlngs = coords.map(([lat, lng]) => ({ lat, lng }));

      const map = L.map('map');
      mapRef.current = map;
      map.fitBounds(latlngs);

      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
      }).addTo(map);
         

      L.polyline(latlngs, { color: '#CC5500' }).addTo(map);
      
    }
  }, [run]);

  if (!run) return <div className="p-6 text-white">Loading or error...</div>;
  if (!splits) return <div className="p-6 text-white">Loading or error...</div>;
  
  

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [hrs, mins, secs]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  }; 

  const formatPace = (pace) => {
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const distanceMiles = run.distance / 1609.34;
  const movingTimeMin = run.moving_time / 60;
  const paceMinPerMile = distanceMiles > 0 ? (movingTimeMin / distanceMiles) : 0;

  const formattedDate = DateTime.fromISO(run.start_date_local, { zone: 'utc' })
    .setZone('America/Chicago')
    .toFormat('EEE, MMM d • h:mm a');

    const formatCentralTime = (utcDateStr) => {
        const utcDate = new Date(utcDateStr);
        const centralOffsetDate = new Date(utcDate.getTime() + 5 * 60 * 60 * 1000); // subtract 5 hours
        return centralOffsetDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      };

  return (
    
    <div className="w-screen min-h-screen">
    <div className="p-6 text-white space-y-6">
      {/* Top Stats Box */}
      <div className="grid grid-cols-4 gap-6 bg-[#333333] p-6 rounded-xl shadow">
        <div>
          <p className="text-sm text-gray-400">Name</p>
          <p className="text-lg font-semibold">{run.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Distance</p>
          <p className="text-lg font-semibold">{(run.distance / 1609.34).toFixed(2)} mi</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Moving Time</p>
          <p className="text-lg font-semibold">{formatDuration(run.moving_time)}</p>
        </div>     
        <div>
          <p className="text-sm text-gray-400">Elevation Gain</p>
          <p className="text-lg font-semibold">{(run.total_elevation_gain * 3.28084).toFixed(0)} ft</p>
        </div>
        <div>
            <p className="text-sm text-gray-400">Date</p>
            <p className="text-lg font-semibold">{formatCentralTime(run.start_date_local)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Avg Pace</p>
          <p className="text-lg font-semibold">{formatPace(paceMinPerMile)} min/mi</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Avg HR</p>
          <p className="text-lg font-semibold">{run.average_heartrate || 'N/A'} bpm</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Avg Cadence</p>
          <p className="text-lg font-semibold">{run.average_cadence ? (run.average_cadence * 2).toFixed(0) : 'N/A'} spm</p>
        </div>
        
      </div>

      {/* Lower Grid: Splits + Map */}
<div className="grid grid-cols-12 gap-6">
  {/* Left: Splits Box */}
  <div className="bg-[#333333] p-6 rounded-xl shadow col-span-6 h-[400px] overflow-y-auto">
    <h2 className="text-xl font-semibold mb-4">Splits</h2>
    {splits.length > 0 ? (
      <div className="space-y-2">
         {splits.map((split, index) => {
      const hr = split.average_heartrate ? Math.round(split.average_heartrate) : null;

      // Calculate pace in seconds per mile
      const paceSecPerMile = split.moving_time / (split.distance / 1609.34);
      const paceFormatted = formatDuration(paceSecPerMile);

      // Effort bar logic (scale to max width, clamp if needed)
      const effortPercent = hr ? Math.min((hr - 100) / 100, 1) : 0; // crude estimate
      const effortWidth = `${effortPercent * 100}%`;
      const effortColor =
        effortPercent > 0.8 ? 'bg-red-500' :
        effortPercent > 0.6 ? 'bg-yellow-500' :
        'bg-green-500';

          return (
            <div
              key={index}
              className="flex items-center justify-between text-sm text-white bg-gray-800 px-4 py-2 rounded"
            >
              {/* Split Number */}
              <span className="w-6 text-gray-400">{split.split}</span>

              {/* Effort Bar */}
              <div className="flex-1 mx-2 bg-gray-700 rounded h-2 relative">
                <div
                  className={`absolute h-2 rounded ${effortColor}`}
                  style={{ width: effortWidth }}
                />
              </div>

              {/* Time */}
              <span className="w-[70px] text-right">{paceFormatted}</span>

              {/* Heart Rate */}
              <span className="w-[60px] text-right">
                {hr ? `${hr} bpm` : '–'}
              </span>

              {/* Elevation */}
              <span className="w-[50px] text-right text-gray-300">
                {split.elevation_difference >= 0 ? `+${(split.elevation_difference* 3.28084).toFixed(0)} ft` : `${(split.elevation_difference* 3.28084).toFixed(0)} ft`}
              </span>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-gray-400">No splits available.</p>
    )}
  </div>

  {/* Right: Map */}
  <div className="col-span-6">
    <div id="map" className="rounded-xl shadow h-[400px]" />
  </div>
</div>

    </div>
    </div>
  );
};

export default RunDetail;
