const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());

const url = 'https://cloudflare-quic.com'; // Use the same URL for both
 

//
// For HTTP/2 we use curl
app.get('/api/http2', async (req, res) => {
    exec(
        `curl --http2 -s -v -D - -w "\\nTIME:%{time_total}\\nCONNECT:%{time_connect}\\nTLS:%{time_appconnect}\\nTTFB:%{time_starttransfer}\\n" "${url}"`,
        (error, stdout, stderr) => {
            if (error) {
                res.status(500).json({ error: stderr || error.message });
                return;
            }
            // Split headers and body
            const parts = stdout.split('\r\n\r\n');
            const headers = parts[0];
            const bodyAndTimes = parts.slice(1).join('\r\n\r\n');

            // Parse the timings
            const timeMatch = bodyAndTimes.match(/TIME:([0-9.]+)/);
            const connectMatch = bodyAndTimes.match(/CONNECT:([0-9.]+)/);
            const tlsMatch = bodyAndTimes.match(/TLS:([0-9.]+)/);
            const ttfbMatch = bodyAndTimes.match(/TTFB:([0-9.]+)/);

            res.json({
                protocol: 'HTTP/2',
                time: timeMatch ? Math.round(parseFloat(timeMatch[1]) * 1000) : null,
                connect: connectMatch ? Math.round(parseFloat(connectMatch[1]) * 1000) : null,
                tls: tlsMatch ? Math.round(parseFloat(tlsMatch[1]) * 1000) : null,
                ttfb: ttfbMatch ? Math.round(parseFloat(ttfbMatch[1]) * 1000) : null,
                snippet: stderr, 
                headers: headers,
            });
        }
    );
});

// Same for HTTP/3:
app.get('/api/http3', async (req, res) => {
    exec(
        `curl --http3 -s -v -D - -w "\\nTIME:%{time_total}\\nCONNECT:%{time_connect}\\nTLS:%{time_appconnect}\\nTTFB:%{time_starttransfer}\\n" "${url}"`,
        (error, stdout, stderr) => {
            if (error) {
                res.status(500).json({ error: stderr || error.message });
                return;
            }
            // Split headers and body
            const parts = stdout.split('\r\n\r\n');
            const headers = parts[0];
            const bodyAndTimes = parts.slice(1).join('\r\n\r\n');

            // Parse the timings
            const timeMatch = bodyAndTimes.match(/TIME:([0-9.]+)/);
            const connectMatch = bodyAndTimes.match(/CONNECT:([0-9.]+)/);
            const tlsMatch = bodyAndTimes.match(/TLS:([0-9.]+)/);
            const ttfbMatch = bodyAndTimes.match(/TTFB:([0-9.]+)/);

            res.json({
                protocol: 'HTTP/3',
                time: timeMatch ? Math.round(parseFloat(timeMatch[1]) * 1000) : null,
                connect: connectMatch ? Math.round(parseFloat(connectMatch[1]) * 1000) : null,
                tls: tlsMatch ? Math.round(parseFloat(tlsMatch[1]) * 1000) : null,
                ttfb: ttfbMatch ? Math.round(parseFloat(ttfbMatch[1]) * 1000) : null,
                snippet: stderr, // skip the body/content
                headers: headers,
            });
        }
    );
});


// Helper to build parallel curl commands
const runCurlRequest = (protocol, index) => {
    const cmd = `curl --${protocol} -s -w "REQ${index} TTFB:%{time_starttransfer}\\n" "${url}"`;
    console.log('[DEBUG] Executing:', cmd);
    return new Promise((resolve) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`[ERROR] REQ${index}:`, stderr || error.message);
          return resolve(`REQ${index} ERROR: ${stderr || error.message}`);
        }
  
        // Grab only the last line (where TTFB is)
        const lines = stdout.trim().split('\n');
        const lastLine = lines[lines.length - 1];
  
        resolve(lastLine);  // Only send REQx TTFB:0.123
      });
    });
  };
  
  
  
  app.get('/api/http2-multi', async (req, res) => {
    const count = parseInt(req.query.count || '10');
    console.log(`[DEBUG] Starting ${count} parallel HTTP/2 requests`);
    const results = await Promise.all(
      Array.from({ length: count }, (_, i) => runCurlRequest('http2', i))
    );
    res.json({ protocol: 'HTTP/2', output: results.join('\n') });
  });
  
  
app.get('/api/http3-multi', async (req, res) => {
    const count = parseInt(req.query.count || '10');
    console.log(`[DEBUG] Starting ${count} parallel HTTP/3 requests`);
    const results = await Promise.all(
      Array.from({ length: count }, (_, i) => runCurlRequest('http3', i))
    );
    res.json({ protocol: 'HTTP/3', output: results.join('\n') });
  });
  


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
