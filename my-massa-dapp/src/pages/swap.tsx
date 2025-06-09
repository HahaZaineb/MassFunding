import React from 'react';

const SwapPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Swap Widget Creator</h1>
      <p className="text-lg text-gray-600 text-center mb-10">
        Customize your swap widget with preferred tokens and themes, then embed it
        seamlessly into your website.
      </p>
      <iframe 
        src="https://www.eaglefi.io/swap-widget?fixFromToken=false&fixToToken=false&theme=light" 
        width="100%" 
        height="640px" 
        style={{ border: 0, margin: '0 auto', display: 'block', maxWidth: '960px', minWidth: '300px' }} 
        scrolling="no"
        title="Swap Widget"
      ></iframe>
    </div>
  );
};

export default SwapPage; 