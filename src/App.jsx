import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from './components/Home';
import { Landingpage } from './components/Landingpage';
import {Deliver} from './components/Deliver';
import { Login } from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landingpage />} />
        <Route path="/order" element={<Home />} />
        <Route path="/deliver" element={<Deliver />} />

      </Routes>
    </Router>
  );
}

export default App;
