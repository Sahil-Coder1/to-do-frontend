import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PrivateRuote from './components/ui/PrivateRoute'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
            <PrivateRuote>
              <Home />
            </PrivateRuote>
          } />
          <Route path='/login' element={<Login />} />
        </Routes>
      </BrowserRouter >
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App;
