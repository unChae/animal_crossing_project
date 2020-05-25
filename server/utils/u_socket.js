var socket = (io) => {
    return (req, res, next) => {
        if(req.headers.msg){
            // 상대 id, 게시물 id, 유저 id, 메시지
            const { ch_id } = req.body
            io.on('connection', (socket) => {
                console.log('a user connected');
                socket.on('chat', (msg) => {
                    console.log("message" + msg);
                    io.emit('chat', msg);
                });
            });
        }
        next();
    }
}

let socket_connect = (io) => {
    console.log("socket");
    io.sockets.on('connection', (socket) => {
        console.log('a user connected');
    });
}
module.exports = socket;