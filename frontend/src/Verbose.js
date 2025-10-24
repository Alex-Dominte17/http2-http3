import React from 'react';
import './Verbose.css';

function CurlVerboseOutput({ output }) {
  // Simple keyword-based highlighting
  const lines = output.split('\n').map((line, i) => {
    if (line.includes('using HTTP/2') || line.includes('using HTTP/3')) {
      return <div className="curl-protocol" key={i}>{line}</div>;
    }
    if (line.includes('SSL connection')) {
      return <div className="curl-tls" key={i}>{line}</div>;
    }
    if (line.startsWith('* TLS') || line.startsWith('} [') || line.startsWith('{ [')) {
      return <div className="curl-tls-step" key={i}>{line}</div>;
    }
    if (line.startsWith('>')) {
      return <div className="curl-request" key={i}>{line}</div>;
    }
    if (line.startsWith('<')) {
      return <div className="curl-response" key={i}>{line}</div>;
    }
    if (line.startsWith('*')) {
      return <div className="curl-info" key={i}>{line}</div>;
    }
    return <div className="curl-other" key={i}>{line}</div>;
  });

  return (
    <div className="curl-verbose-output">
      {lines}
    </div>
  );
}

export default CurlVerboseOutput;
