import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrainingLog from './TrainingLog';
import RunDetail from './RunDetail'; // You'll create this next

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrainingLog />} />
        <Route path="/run/:id" element={<RunDetail />} />
      </Routes>
    </Router>
  );
}

export default App;