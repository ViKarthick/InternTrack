import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import InternshipForm from './components/InternshipForm';
import InternshipList from './components/InternshipList';
import CoordinatorView from './components/CoordinatorView';
import FacultyView from './components/FacultyView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/internship-form" element={<InternshipForm />} />
        <Route path="/internship-list" element={<InternshipList />} />
        <Route path="/coordinator" element={<CoordinatorView />} />
        <Route path="/faculty" element={<FacultyView />} />
      </Routes>
    </Router>
  );
}

export default App;