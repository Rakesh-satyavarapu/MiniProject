import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Nav from './components/Nav';
import Home from './components/Home';
import About from './components/About';
import Services from './components/Services';
import Mail from './components/Mail'
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register';
import AllMails from './components/AllMails'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import ResultPage from './components/ResultPage';
import Logout from './components/Logout';
function App() {
  return (
    <>
    <Router>
      <Logout />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/mail" element={<Mail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/result' element={<ResultPage />} />
        <Route path='/allmails' element={<AllMails />} />
        <Route path='/logout' element={<Logout />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
