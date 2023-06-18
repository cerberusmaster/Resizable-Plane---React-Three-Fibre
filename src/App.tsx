import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UIContextProvider } from './context/UIContextProvider';

import {
  Home,
  NoPage
} from './page';
import './App.css';

function App() {
  return (
    <div className="card flex justify-content-center app">
      <UIContextProvider>
        <BrowserRouter>
          <Routes>
            {/* <Route index path='/' element={<Layout />} /> */}
            <Route index path='/' element={<Home />} />
            <Route path='*' element={<NoPage />} />
          </Routes>
        </BrowserRouter>
      </UIContextProvider>
    </div>
  );
}

export default App;