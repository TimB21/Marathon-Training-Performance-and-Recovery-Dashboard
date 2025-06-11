import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

const RunDetail = () => {
  const { id } = useParams();
  const [run, setRun] = useState(null);
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
          <p className="text-sm text-gray-400">Date</p>
          <p className="text-lg font-semibold">{new Date(run.start_date_local).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Distance</p>
          <p className="text-lg font-semibold">{(run.distance / 1609.34).toFixed(2)} mi</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Moving Time</p>
          <p className="text-lg font-semibold">{(run.moving_time / 60).toFixed(1)} min</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Avg Pace</p>
          <p className="text-lg font-semibold">{(1609.34 / run.average_speed / 60).toFixed(2)} min/mi</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Avg HR</p>
          <p className="text-lg font-semibold">{run.average_heartrate || 'N/A'} bpm</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Avg Cadence</p>
          <p className="text-lg font-semibold">{run.average_cadence ? (run.average_cadence * 2).toFixed(0) : 'N/A'} spm</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Elevation Gain</p>
          <p className="text-lg font-semibold">{run.total_elevation_gain} m</p>
        </div>
      </div>

      {/* Lower Grid: Splits + Map */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Splits Box (placeholder for now) */}
        <div className="bg-[#333333] p-6 rounded-xl shadow col-span-1 h-[400px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Splits</h2>
          <p className="text-gray-400">Split data coming soon...</p>
        </div>

        {/* Right: Map */}
        <div className="col-span-2">
          <div id="map" className="rounded-xl shadow h-[400px]" />
        </div>
      </div>
    </div>
    </div>
  );
};

export default RunDetail;
