const http = require('http');
const crypto = require('crypto');
const static = require('node-static');
const parse = require('./parser');

const file = new static.Server('./');

const server = http.createServer((req, res) => {
    req.addListener('end', () => file.serve(req, res)).resume();
});
server.on('upgrade', function (req, socket) {
    if (req.headers['upgrade'] !== 'websocket') {
        socket.end('HTTP/1.1 400 Bad Request');
        return;
    }
    const acceptKey = req.headers['sec-websocket-key'];
    const hash = generateAcceptValue(acceptKey);

    const responseHeaders = ['HTTP/1.1 101 Web Socket Protocol Handshake', 'Upgrade: WebSocket', 'Connection: Upgrade', `Sec-WebSocket-Accept: ${hash}`];
    const protocol = req.headers['sec-websocket-protocol'];

    const protocols = !protocol ? [] : protocol.split(',').map(s => s.trim());
    if (protocols.includes('json')) {
        responseHeaders.push(`Sec-WebSocket-Protocol: json`);
    }

    socket.on('data', buffer => {
        const message = parse(buffer);

        if (message) {
            console.log(message);
            socket.write(constructReply({ message: 'Hello from the server!' })); 
        } else if (message === null) { 
            console.log('WebSocket connection closed by the client.'); 
        }
    });
    
    socket.write(responseHeaders.join('\r\n') + '\r\n\r\n');

});
function generateAcceptValue(acceptKey) {
    return crypto
        .createHash('sha1')
        .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
        .digest('base64');
}

const port = 3210;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));

function constructReply (data) {
    const json = JSON.stringify(data)
    // 获取 buffer 长度
    const jsonByteLength = Buffer.byteLength(json);
    // 判断长度
    const lengthByteCount = jsonByteLength < 126 ? 0 : 2; 
    const payloadLength = lengthByteCount === 0 ? jsonByteLength : 126; 
    // 构造 buffer 长度 =  前面两个字节 + 后面的第三部分
    const buffer = Buffer.alloc(2 + lengthByteCount + jsonByteLength); 
    // 写入第一个字节
    buffer.writeUInt8(0b10000001, 0); 
    // 写入第二个字节
    buffer.writeUInt8(payloadLength, 1);
    let payloadOffset = 2; 
    // 如果长度大于 126
    if (lengthByteCount > 0) { 
        // 偏移 2个字节写入
        buffer.writeUInt16BE(jsonByteLength, 2); 
        payloadOffset += lengthByteCount; 
    }
    // 写入数据
    buffer.write(json, payloadOffset); 
    return buffer;
}
