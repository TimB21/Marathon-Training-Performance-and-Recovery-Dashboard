import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OptiMileHeader from './components/layout/OptiMileHeader';
import TrainingLog from './TrainingLog';
import RunDetail from './RunDetail';

// Simple Home component with just the header and white background
const Home = () => {
  return (
    <div className="min-h-screen w-screen bg-white flex flex-col">
      <OptiMileHeader />
      <main className="p-6 w-full">
        {/* Content will go here later */}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/training-log" element={<TrainingLog />} />
        <Route path="/run/:id" element={<RunDetail />} />
      </Routes>
    </Router>
  );
}

export default App;