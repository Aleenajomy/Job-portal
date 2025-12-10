import {BrowserRouter, Routes, Route} from 'react-router-dom';
import React from 'react';
import Auth from './components/Auth/Auth';
import './app.css'
function App() {

  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Auth/>}/>
   </Routes>
   </BrowserRouter>

  );
}

export default App;
