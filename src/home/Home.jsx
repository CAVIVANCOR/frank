import React, { useEffect, useState } from "react";
import './home.css';

export default function Home() {
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    setApiUrl(apiUrl);
  }, []);

  return (
    <div className="cuerpoConImagenFondo" style={{ backgroundImage: `url(${apiUrl}/media/fotos/arboldelavida.webp)` }}>
      <h1>
        <div>Frank Barmak Raich</div>
        <div>My Life</div>
      </h1>
    </div>
  );
}