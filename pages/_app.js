// pages/_app.js
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  
  // サービスワーカーの登録用のuseEffect
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered: ', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed: ', error);
        });
    }
  }, []);

 
  return <Component {...pageProps} />;
}

export default MyApp;