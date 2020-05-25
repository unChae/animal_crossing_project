// lib
const sequelize = require("sequelize");
const Op = sequelize.Op;

// modules
const response = require("../../utils/u_res");

// models
const models = require("../../models");
const Chat = models.Chat;
const Board = models.Board;
const User = models.User;

var get_room = async (req, res) => {
    var us_id = req.body.us_id;
    // chat table에서 보낸 사람 or 받은 사람 중에 사용자 id가 존재한 채팅방 room 이름 반환
    var chat = await Chat.findAll({
        where: { 
            [Op.or]: [
                {ch_send_us_id: us_id}, 
                {ch_receive_us_id: us_id}
            ] 
        }, 
        group:'ch_id',
        raw: true
    })
    .catch((error) => {
        response(res, 500, false, "[에러] 서버 문제로 채팅방을 로드하지 못했습니다", error);
    })
    
    
    var send_data = new Array();
    console.log(chat);
    for(var i = 0; i < chat.length; i++){
        
        var bo_id = chat[i].ch_bo_id;
        
        var board = await Board.findOne({
            where: {bo_id},
            raw: true
        })
        
        var user;
        if(chat[i].ch_send_us_id !== us_id){
            user = await User.findOne({
                    where: { us_id: chat[i].ch_send_us_id}
            })
        } else {
            user = await User.findOne({
                where: { us_id: chat[i].ch_receive_us_id}
            })
        }
        send_data[i] = { board ,user };
    }
    console.log(send_data);
    response(res, 200, true, "[완료] 채팅방을 모두 반환했습니다", send_data);
}

module.exports = get_room;

