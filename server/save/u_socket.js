/* socket */

// controller
const ctrl = require("../api/c_chat");

// models
const models = require("../models");
const Chat = models.Chat;
const User = models.User;
const Board = models.Board;

let users = {};
let rooms = {};

var socket = (io) => {
    io.on('connection', (socket) => {
        

      
        //  let address = socket.handshake.address;
        //  address = address.substring(7);
        // 	socket.id = address;

    	console.log('connected:', socket.id);  
        console.log('users: ', users, "/ rooms: ", rooms);
    	socket.on('get_us_id', async (us_id) => {
    	    socket.name = us_id;
    	    users[us_id] = socket.id;
    	    console.log("users:", users);
            console.log("rooms: ", rooms);
            
            // 다시 새로 고침시 룸에 조인 시켜줌
            for(var i=0; i<rooms.length; i++) {
                console.log("rooms: ", rooms[i]);
            }
            
            // 채팅방들 정보 가져옴
            // console.log(us_id);
    	    let room_data = await ctrl.get_room(us_id);
    	    // console.log("test", room_data);
    	    io.to(socket.id).emit('get_chat_room', room_data);
    	});
    	
        // 메세지 전송
    	socket.on('send_message', async (payload) => {
    	    const {ch_bo_id, us_id, msg} = payload;
    	    let ch_receive_us_id = await ctrl.get_us_id(us_id, ch_bo_id);
    	    let ch_id = await ctrl.get_room_id(us_id, ch_bo_id);
    	    console.log(ch_id);
            send_message(ch_id, ch_bo_id, us_id, ch_receive_us_id, msg);
    	});
    	
    	// 구매자가 처음 채팅버튼을 눌렀을 때
    	socket.on('create_room', async (params) => {
    	    // 바로 room을 생성하고 chat에 임시글을 적어줘야
    	    // room이 생성되고 join_room에서 chat테이블을 통해서 방을 조회할 수 있다.
    	    var us_id = params.us_id;
    	    let bo_id = parseInt(params.bo_id);
    	    console.log(params);
    	    let ch_id = `${bo_id}-${us_id}`;
    	    
    	    await socket.join(ch_id);
    	    
    	    // 유저 정보를 가져와 1차 임시 메세지에 담는다
    	    let user = await User.findOne({
    	        where: {us_id}
    	    })
    	    
    	    let msg = `${user.us_nickname}님이 거래를 요청했어요!`;

    	    let board = await Board.findOne({
    	        where: {bo_id}
    	    })
    	    
    	    send_message(ch_id, bo_id, us_id, board.bo_us_id, msg);
    	});
    	
    	// 룸이 만들어져 있는 채팅방 접속
    	socket.on('join_room', async (us_id, bo_id) => {
    	    
    	    let chat = await ctrl.get_chat(us_id, bo_id);
            let ch_id = await ctrl.get_room_id(us_id, bo_id);
            
            try{
                for(let i = 0; i< rooms[ch_id].length; i++) {
                if(rooms[ch_id] && rooms[ch_id][i][us_id]) {
                    console.log("중복 있음");
                    socket.join(ch_id);
                    return;
                }
            }
            }catch(error) {
                
            }
            
            
      
    	    socket.join(ch_id);
    	    let user = {};
    	    user[socket.name] = socket.id;
    	    
    	    if(rooms[ch_id]) {
    	        rooms[ch_id].push(user);
    	    }else {
    	        rooms[ch_id] = [user]
    	    }
    	    
    	    io.to(users[us_id]).emit('get_chat_data', chat);   
    	    console.log("join rooms: ", rooms);
    	});
    	
    	socket.on('leave_room', async (us_id, bo_id) => {
    	    let ch_id = await ctrl.get_room_id(us_id, bo_id);
    	    console.log(ch_id);
    	    console.log(rooms[ch_id]);
    	    
    	    for(var i = 0; i < rooms[ch_id].length; i++) {
    	        if(Object.getOwnPropertyNames(rooms[ch_id][i])[0] === us_id) {
    	            delete rooms[ch_id][i];
    	        }
    	    }
    	    rooms[ch_id] = rooms[ch_id].filter(function (el) {return el != null;});
    	    console.log("방 삭제 후",rooms[ch_id]);
    	    if(rooms[ch_id].length == 0){
    	        delete rooms[ch_id];
    	    }
    	    socket.leave(ch_id);
    	    console.log("남은 방 목록: ", rooms);
    	});
    	
    	socket.on('disconnect', () => { 
    	    console.log('disconnected: '+ socket.id + ' ' + socket.name);
    	    
    	    delete users[socket.name];
    	    console.log({"남은 유저": users});
    	});
    	
    	async function send_message (ch_id, ch_bo_id, ch_send_us_id, ch_receive_us_id, ch_content) {
    	    let send_data = await Chat.create({
    	        ch_id,
    	        ch_bo_id,
    	        ch_send_us_id,
    	        ch_receive_us_id,
    	        ch_content
    	    });
    	    
    	    // 조건에 맞게 emit 반환
    	    if(!users[ch_receive_us_id]) {
    	        // 상대방이 앱을 꺼둔 경우 
    	        // fcm
    	    } else if(!rooms[ch_id][ch_receive_us_id]) {
    	        // 상대방이 채팅방에 없는 경우
    	        let result = ctrl.get_room(ch_receive_us_id);
    	        io.to(users[ch_receive_us_id]).emit('get_message_notification', result);
    	    }
    	    // 채팅방에 있는 사람 전부에게 보냄
    	    io.to(ch_id).emit('get_message', send_data);
    	}
    });
}

module.exports = socket;

/*
1. 안읽은 채팅이 있으면 표시
chat 테이블에 컬럼 2개 추가

send 읽엇냐 안읽었냐
receive 읽었나 안읽었나

chat 테이블 odrderby 최신 채팅 where 내가 receive 한 것 중에 읽음 처리가 안된 것 count groupby
https://github.com/sequelize/sequelize/issues/4507

2. 채팅 도중에 새로고침 되면 어케되냐

*/