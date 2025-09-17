import { useEffect } from 'react';

const TestFacebookPixel = () => {
  useEffect(() => {
    // Check if Facebook Pixel is loaded
    const checkFacebookPixel = () => {
      console.log('🔍 Checking Facebook Pixel status...');
      
      if (typeof window === 'undefined') {
        console.log('❌ Not in browser environment');
        return;
      }
      
      console.log('-window.fbq:', typeof window.fbq);
      console.log('-window.fbq:', window.fbq);
      
      if (typeof window.fbq !== 'undefined') {
        console.log('✅ Facebook Pixel is loaded');
        // fbq is a function, so we can't access queue directly
        // but we can check if it has queue-like behavior
        console.log('fbq function exists');
      } else {
        console.log('❌ Facebook Pixel is not loaded');
      }
      
      // Check if the script is in the DOM
      const pixelScript = document.getElementById('facebook-pixel-script');
      if (pixelScript) {
        console.log('✅ Facebook Pixel script found in DOM');
        console.log('Script content:', pixelScript.textContent?.substring(0, 100) + '...');
      } else {
        console.log('❌ Facebook Pixel script not found in DOM');
      }
      
      // Check if the noscript is in the DOM
      const pixelNoscript = document.getElementById('facebook-pixel-noscript');
      if (pixelNoscript) {
        console.log('✅ Facebook Pixel noscript found in DOM');
      } else {
        console.log('❌ Facebook Pixel noscript not found in DOM');
      }
    };
    
    // Check immediately
    checkFacebookPixel();
    
    // Check again after a delay to allow for script loading
    const timer = setTimeout(checkFacebookPixel, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Facebook Pixel Test</h1>
      <p>Check the browser console for Facebook Pixel status.</p>
    </div>
  );
};

export default TestFacebookPixel;