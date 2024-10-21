import Document, { Html, Head, Main, NextScript } from "next/document";


class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="service-worker" href="/service-worker.js" />
          <link rel="apple-touch-icon" href="/report-bg-remove-icon2.png"></link>
          <meta name="theme-color" content="#50C878" />
    
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;