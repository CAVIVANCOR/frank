/* eslint-disable no-unused-vars */

import React from 'react';
import MenuBar from './MenuBar';
import Home from './home/Home';
import { Route, Routes } from 'react-router-dom';
import Media from './media/Media';
import Usuarios from './crud/usuarios/Usuarios';
import Accesos from './crud/accesos/Accesos';
import Medias from './crud/medias/Medias';
import Categories from './crud/medias/Categories';
export default function App() {
    return (
      <div>
      <MenuBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/media" element={<Media />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/accesos" element={<Accesos />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/medias" element={<Medias />} />
      </Routes>
      </div>
    );
}
        