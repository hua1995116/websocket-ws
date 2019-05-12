
## 前置知识

1 kb = 1024 byte

1 byte = 8 bit

## websocket 数据帧

前面已经说过了WebSocket在客户端与服务端的“Hand-Shaking”实现，所以这里讲数据传输。
WebSocket传输的数据都是以Frame（帧）的形式实现的，就像TCP/UDP协议中的报文段Segment。下面就是一个Frame：（以bit为单位表示）

```
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-------+-+-------------+-------------------------------+
 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 | |1|2|3|       |K|             |                               |
 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 |     Extended payload length continued, if payload len == 127  |
 + - - - - - - - - - - - - - - - +-------------------------------+
 |                               |Masking-key, if MASK set to 1  |
 +-------------------------------+-------------------------------+
 | Masking-key (continued)       |          Payload Data         |
 +-------------------------------- - - - - - - - - - - - - - - - +
 :                     Payload Data continued ...                :
 + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 |                     Payload Data continued ...                |
 +---------------------------------------------------------------+
```


### FIN： 1bit
```
表示此帧是否是消息的最后帧。第一帧也可能是最后帧。
```

### RSV1，RSV2，RSV3： 各1bit
```
必须是0，除非协商了扩展定义了非0的意义。如果接收到非0，且没有协商扩展定义  此值的意义，接收端必须使WebSocket连接失败。
```
### Opcode： 4bit
```
定义了"Payloaddata"的解释。如果接收到未知的操作码，接收端必须使WebSocket       连接失败。下面的值是定义了的。

%x0 表示一个后续帧

%x1 表示一个文本帧

%x2 表示一个二进制帧

%x3-7 为以后的非控制帧保留

%x8 表示一个连接关闭

%x9 表示一个ping

%xA 表示一个pong

%xB-F 为以后的控制帧保留
```
 

### Mask： 1bit
```
定义了"Payload data"是否标记了。如果设为1，必须有标记键出现在masking-key，用   来unmask "payload data"，见5.3节。所有从客户端发往服务器的帧必须把此位设为1。
```
 

### Payload length： 7bit, 7 + 16bit, 7 + 64bit
```
"Payloaddata"的长度，字节单位。如果值是0-125，则是有效载荷长度。如果是126，   接下来的2字节解释为16位无符号整数，作为有效载荷长度。如果127，接下来的8  字节解释为64位无符号整数（最高位必须是0），作为有效载荷长度。多字节长度数值    以网络字节序表示。注意，在任何情况下，必须用最小数量的字节来编码长度，例如，       124字节 长的字符串不能编码为序列126, 0, 124。有效载荷长度是"Extension data"的长     度加上"Application data"的长度。"Extension data"的长度可能是0，在这种情况下，    有效载荷长度是"Applicationdata"的长度。
```

### Masking-key：0或4字节
```
所有从客户端发往服务器的帧必须用32位值标记，此值在帧里。如果mask位设为1， 此字段（32位值）出现，否则缺失。更多的信息在5.3节，客户端到服务器标记。
```
 

### Payload data： (x + y)字节
```
"Payloaddata" 定义为"extensiondata" 后接"application data"。
```
 

### Extension data： x 字节
```
"Extensiondata"是0字节，除非协商了扩张。所有扩张必须指定"extensiondata"的长度，      或者如何计算长度，如何使用扩展必须在打开握手时进行协商。如果有，"Extension data"包括在有效载荷长度。
```
 

### Application data： y字节
```
任意"Applicationdata"占据了帧的剩余部分，在"Extensiondata"之后。 "Applicationdata"的长度等于有效载荷长度减去"Extensiondata"的长度。
```


**示意图**

![ws.png](https://s3.qiufengh.com/blog/ws.png)


## parse

## generate


## 工具

1. 进制转化工具 https://tool.lu/hexconvert/
2. js 进制转化 num.toStrong(2); (十进制转二进制)， parseInt(stringNum, 2); (二进制转十进制)
3. js 数字氛围 -(2 ** 53 - 1) ~ (2 ** 53 -1)
4. websocket 规范 https://tools.ietf.org/html/rfc6455#page-32