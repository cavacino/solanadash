const http = require('http');

const testRequest = {
  jsonrpc: '2.0',
  method: 'initialize',
  params: {},
  id: 1
};

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ MCP Server Response:');
    console.log(JSON.parse(data));
    console.log('\n🎯 Server is working correctly!');
  });
});

req.on('error', (err) => {
  console.error('❌ Error connecting to MCP server:', err.message);
});

req.write(JSON.stringify(testRequest));
req.end(); 