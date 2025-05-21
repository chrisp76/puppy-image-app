import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import './App.css';

const App: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [breed, setBreed] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  const fetchRandomPuppyImage = async () => {
    setLoading(true);
    setError(null);
    try {
      let validImage = false;
      let image = '';

      while (!validImage) {
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        if (!response.ok) {
          throw new Error('Bild konnte nicht geladen werden');
        }
        const data = await response.json();
        image = data.message;

        // Extrahiere den Hunderassen-Namen aus der Bild-URL
        const breedName = image.split('/')[4].replace('-', ' ');
        setBreed(breedName.charAt(0).toUpperCase() + breedName.slice(1));

        // Überprüfe die Bilddimensionen
        const img = new Image();
        img.src = image;

        await new Promise((resolve) => {
          img.onload = () => {
            if (img.width >= 640 && img.width <= 1280) {
              validImage = true;
            }
            resolve(null);
          };
          img.onerror = () => resolve(null);
        });
      }

      setImageUrl(image);
    } catch (err) {
      setError('Das Bild konnte nicht geladen werden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = () => {
    if (imageUrl && !favorites.includes(imageUrl)) {
      setFavorites([...favorites, imageUrl]);
    }
  };

  const toggleShowFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  const exportFavoritesToPDF = async () => {
    if (favorites.length === 0) {
      alert('Keine Lieblingsbilder zum Exportieren!');
      return;
    }

    const pdf = new jsPDF();
    let yPosition = 10;
    const pdfWidth = 190; // PDF-Breite (A4-Größe abzüglich Ränder)

    try {
      // Lade alle Bilder und füge sie dem PDF hinzu
      await Promise.all(
        favorites.map(async (image, index) => {
          const img = new Image();
          img.src = image;

          await new Promise<void>((resolve) => {
            img.onload = () => {
              const aspectRatio = img.width / img.height;
              const imgHeight = pdfWidth / aspectRatio; // Höhe berechnen, um das Seitenverhältnis beizubehalten

              if (yPosition + imgHeight > 280) {
                // Füge eine neue Seite hinzu, wenn das Bild nicht passt
                pdf.addPage();
                yPosition = 10;
              }

              pdf.text(`Lieblingshund ${index + 1}`, 10, yPosition);
              yPosition += 10;

              pdf.addImage(img, 'JPEG', 10, yPosition, pdfWidth, imgHeight);
              yPosition += imgHeight + 10; // Abstand nach dem Bild hinzufügen

              resolve();
            };

            img.onerror = () => {
              console.error(`Bild konnte nicht geladen werden: ${image}`);
              resolve(); // Auch bei Fehlern fortfahren
            };
          });
        })
      );

      // Speichere das PDF, nachdem alle Bilder hinzugefügt wurden
      pdf.save('lieblingshunde.pdf');
    } catch (error) {
      console.error('Fehler beim Exportieren des PDFs:', error);
      alert('Beim Exportieren des PDFs ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    }
  };

  useEffect(() => {
    fetchRandomPuppyImage();
  }, []);

  return (
    <div className="app">
      <div className="top-bar">
        <button onClick={fetchRandomPuppyImage} disabled={loading}>
          {loading ? 'Lädt...' : 'Neuen Hund laden'}
        </button>
        <button onClick={toggleShowFavorites}>
          {showFavorites ? 'Alle Hunde anzeigen' : 'Lieblingshunde anzeigen'}
        </button>
        {!showFavorites && (
          <button className="favorite-button" onClick={addToFavorites}>
            ❤️ Zu Favoriten hinzufügen
          </button>
        )}
        {showFavorites && (
          <button className="export-button" onClick={exportFavoritesToPDF}>
            📄 Als PDF exportieren
          </button>
        )}
      </div>
      {loading && <p>Lädt...</p>}
      {error && <p className="error">{error}</p>}
      {!showFavorites && imageUrl && !loading && (
        <div>
          <img src={imageUrl} alt="Ein süßer Hund" className="puppy-image" />
          {breed && <h2 className="breed-info">Rasse: {breed}</h2>}
        </div>
      )}
      {showFavorites && (
        <div className="favorites">
          <h2>Deine Lieblingshunde</h2>
          {favorites.length === 0 ? (
            <p>Keine Favoriten vorhanden!</p>
          ) : (
            favorites.map((fav, index) => (
              <img key={index} src={fav} alt={`Lieblingshund ${index}`} className="puppy-image" />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default App;