import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

import CurlVerboseOutput from './Verbose';


//


// Single-request timing details
function TimingPanel({ data }) {
  if (!data) return null;
  return (
    <div>
      <strong>Protocol:</strong> {data.protocol} <br />
      <strong>Total time:</strong> {data.time ? `${data.time} ms` : 'N/A'}<br />
      <strong>Connect time:</strong> {data.connect ? `${data.connect} ms` : 'N/A'}<br />
      <strong>TLS handshake:</strong> {data.tls ? `${data.tls} ms` : 'N/A'}<br />
      <strong>Time to First Byte (TTFB):</strong> {data.ttfb ? `${data.ttfb} ms` : 'N/A'}<br />
      <strong>Response snippet:</strong>
      {/* <pre className="snippet">{data.snippet}</pre> */}
      <CurlVerboseOutput output={data.snippet} />

      <details>
        <summary>Show Response Headers</summary>
        <pre>{data.headers}</pre>
      </details>
    </div>
  );
}

// Multiplexing: only show TTFB list
function MultiplexPanel({ data }) {
  if (!data) return null;
  return (
    <div>
      <strong>Protocol:</strong> {data.protocol}
      <pre className="snippet">{data.output}</pre>
    </div>
  );
}

function App() {
  const [resultHttp2, setResultHttp2] = useState(null);
  const [resultHttp3, setResultHttp3] = useState(null);
  const [resultHttp2Multi, setResultHttp2Multi] = useState(null);
  const [resultHttp3Multi, setResultHttp3Multi] = useState(null);
  const [loading, setLoading] = useState(false);

  const testProtocol = async (type) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:4000/api/${type}`);
      switch (type) {
        case 'http2': setResultHttp2(res.data); break;
        case 'http3': setResultHttp3(res.data); break;
        case 'http2-multi': setResultHttp2Multi(res.data); break;
        case 'http3-multi': setResultHttp3Multi(res.data); break;
        default: break;
      }
    } catch (err) {
      const errorContent = { protocol: type.toUpperCase(), output: '', error: err.message };
      switch (type) {
        case 'http2': setResultHttp2(errorContent); break;
        case 'http3': setResultHttp3(errorContent); break;
        case 'http2-multi': setResultHttp2Multi(errorContent); break;
        case 'http3-multi': setResultHttp3Multi(errorContent); break;
        default: break;
      }
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <h1>HTTP/2 vs HTTP/3 – Practical Demo</h1>
      <div style={{ marginBottom: 20 }}>
        <button className="button" onClick={() => testProtocol('http2')} disabled={loading}>
          Test HTTP/2
        </button>
        <button className="button" onClick={() => testProtocol('http3')} disabled={loading}>
          Test HTTP/3
        </button>
      </div>
      <div className="result-container" >
        <div style={{ flex: 1 }}>
          <h2>HTTP/2 Timing</h2>
          {resultHttp2?.error ? <span style={{ color: "red" }}>Error: {resultHttp2.error}</span>
            : <TimingPanel data={resultHttp2} />}
        </div>
        <div style={{ flex: 1 }}>
          <h2>HTTP/3 Timing</h2>
          {resultHttp3?.error ? <span style={{ color: "red" }}>Error: {resultHttp3.error}</span>
            : <TimingPanel data={resultHttp3} />}
        </div>
      </div>

      <hr style={{ margin: '40px 0' }} />

      <h2>Multiplexing Demo (Parallel Requests)</h2>
      <div style={{ marginBottom: 20 }}>
        <button className="button" onClick={() => testProtocol('http2-multi')} disabled={loading}>
          Test HTTP/2 Multiplexing
        </button>
        <button className="button" onClick={() => testProtocol('http3-multi')} disabled={loading}>
          Test HTTP/3 Multiplexing
        </button>
      </div>
      <div className="result-container">
        <div style={{ flex: 1 }}>
          <h3>HTTP/2 Multiplexing</h3>
          {resultHttp2Multi?.error ? <span style={{ color: "red" }}>Error: {resultHttp2Multi.error}</span>
            : <MultiplexPanel data={resultHttp2Multi} />}
        </div>
        <div style={{ flex: 1 }}>
          <h3>HTTP/3 Multiplexing</h3>
          {resultHttp3Multi?.error ? <span style={{ color: "red" }}>Error: {resultHttp3Multi.error}</span>
            : <MultiplexPanel data={resultHttp3Multi} />}
        </div>
      </div>
    </div>
  );
}

export default App;
