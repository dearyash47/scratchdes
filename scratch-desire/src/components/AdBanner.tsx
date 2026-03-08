import React, { useEffect, useRef } from 'react';

const AdBanner: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.firstChild) {
      const script = document.createElement('script');
      const configScript = document.createElement('script');
      
      configScript.innerHTML = `
        atOptions = {
          'key' : '3eb20287c1b79fb8866fb1861546fdc8',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;
      
      script.src = 'https://defrostgauntlet.com/3eb20287c1b79fb8866fb1861546fdc8/invoke.js';
      script.async = true;
      
      adRef.current.appendChild(configScript);
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-4 min-h-[50px] overflow-hidden" ref={adRef} />
  );
};

export default AdBanner;
