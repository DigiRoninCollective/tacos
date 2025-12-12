'use client';

import { useState, useRef, useEffect } from 'react';

// Hardcoded list of available images.
const availableImages = [
  { name: 'Tacos Banner', path: '/tacosbanner6-18-54.png' },
  { name: 'Hammy Banner', path: '/legacy-assets/bannerforhammy.jpg' },
];

// Hardcoded list of available wardrobe items.
const availableWardrobes = [
    { name: 'None', path: null },
    { name: 'Hat', path: '/wardrobe/hat.svg' },
    { name: 'Sunglasses', path: '/wardrobe/sunglasses.svg' },
];


export default function MemeGenerator() {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [selectedImage, setSelectedImage] = useState(availableImages[0].path);
  const [selectedWardrobe, setSelectedWardrobe] = useState(availableWardrobes[0].path);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Function to draw text with stroke
    const drawText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.font = 'bold 40px Impact'; // Increased font size
      ctx.textAlign = 'center';
      
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.toUpperCase(), x, currentY);
          ctx.strokeText(line.toUpperCase(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.toUpperCase(), x, currentY);
      ctx.strokeText(line.toUpperCase(), x, currentY);
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    const renderMeme = async () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        const img = await loadImage(selectedImage);
        
        // Calculate aspect ratio to fit image within canvas without distortion
        const aspectRatio = img.width / img.height;
        let imgWidth = canvas.width;
        let imgHeight = canvas.width / aspectRatio;

        if (imgHeight > canvas.height) {
          imgHeight = canvas.height;
          imgWidth = canvas.height * aspectRatio;
        }

        const x = (canvas.width - imgWidth) / 2;
        const y = (canvas.height - imgHeight) / 2;

        ctx.drawImage(img, x, y, imgWidth, imgHeight);

        // Draw Wardrobe (if selected)
        if (selectedWardrobe) {
          const wardrobeImg = await loadImage(selectedWardrobe);
          
          let wardrobeX = 0;
          let wardrobeY = 0;
          let wardrobeW = 0;
          let wardrobeH = 0;

          // Simple positioning based on image and canvas size
          // These values are arbitrary and might need tuning based on actual assets
          if (selectedWardrobe.includes('hat.svg')) {
            wardrobeW = imgWidth * 0.4;
            wardrobeH = wardrobeW * (wardrobeImg.height / wardrobeImg.width);
            wardrobeX = x + (imgWidth - wardrobeW) / 2;
            wardrobeY = y + imgHeight * 0.05; // Slightly below the top
          } else if (selectedWardrobe.includes('sunglasses.svg')) {
            wardrobeW = imgWidth * 0.5;
            wardrobeH = wardrobeW * (wardrobeImg.height / wardrobeImg.width);
            wardrobeX = x + (imgWidth - wardrobeW) / 2;
            wardrobeY = y + imgHeight * 0.3; // Mid-face area
          }
          
          ctx.drawImage(wardrobeImg, wardrobeX, wardrobeY, wardrobeW, wardrobeH);
        }

        // Draw Text
        const textMaxWidth = canvas.width * 0.9;
        const lineHeight = 50;

        // Top Text
        drawText(topText, canvas.width / 2, 40, textMaxWidth, lineHeight);

        // Bottom Text
        drawText(bottomText, canvas.width / 2, canvas.height - 60, textMaxWidth, lineHeight);

      } catch (error) {
        console.error("Error loading image:", error);
        // Optionally draw an error message on the canvas
        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.fillText('Error loading image', canvas.width / 2, canvas.height / 2);
      }
    };

    renderMeme();

  }, [topText, bottomText, selectedImage, selectedWardrobe]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
      <div className="space-y-4">
        <div>
          <label htmlFor="image-select" className="block text-sm font-medium text-gray-300">
            1. Choose Image
          </label>
          <select
            id="image-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedImage}
            onChange={(e) => setSelectedImage(e.target.value)}
          >
            {availableImages.map((img) => (
              <option key={img.name} value={img.path}>
                {img.name}
              </option>
            ))}
          </select>
        </div>

        <div>
            <label htmlFor="wardrobe-select" className="block text-sm font-medium text-gray-300">
                2. Choose Wardrobe
            </label>
            <select
                id="wardrobe-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedWardrobe || ''}
                onChange={(e) => setSelectedWardrobe(e.target.value || null)}
            >
                {availableWardrobes.map((item) => (
                <option key={item.name} value={item.path || ''}>
                    {item.name}
                </option>
                ))}
            </select>
        </div>

        <div>
          <label htmlFor="top-text" className="block text-sm font-medium text-gray-300">
            3. Top Text
          </label>
          <input
            type="text"
            id="top-text"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 rounded-md"
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="bottom-text" className="block text-sm font-medium text-gray-300">
            4. Bottom Text
          </label>
          <input
            type="text"
            id="bottom-text"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-600 bg-gray-700 rounded-md"
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
          />
        </div>

        <button
          onClick={handleDownload}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Download Meme
        </button>
      </div>
      
      <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-center">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
