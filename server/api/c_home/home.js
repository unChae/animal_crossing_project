// lib
const sequelize = require("sequelize");
const Op = sequelize.Op;

// modules
const response = require("../../utils/u_res");

// models
const models = require("../../models");
const Board = models.Board;
const User = models.User;

var home = async (req, res) => {
    var offset = req.body.offset;
    
    console.log(offset);
    
    if( offset === undefined ) {
        offset = await Board.findAll({
            limit: 1,
            where: {
                bo_show: 0
            },
            raw: true,
            order: [ [ 'createdAt', 'DESC' ]]
        })
        .catch((error) => {
            response(res, 409, false, "[에러]게시물이 존재하지 않습니다", error);
        })
        offset = offset[0].bo_id
    }

    var board = await Board.findAll({
        include: [{
            model: User,
            attributes: ['us_id', 'us_nickname', 'us_grant']
        }],
        where: { bo_show: 0 , bo_id: {[Op.lte]: offset} },
        order: [ [ 'createdAt', 'DESC' ]],
        limit: 13
    })
    .catch((error) => {
        response(res, 500, false, "[에러]홈페이지 게시물을 받아올 수 없습니다", error);
    });
    console.log(board);
    var next_offset = board[12].bo_id;
    board.splice(12, 1);
    
    response(res, 200, true, "[완료]홈페이지 게시물 데이터 반환", {next_offset, board});
}

module.exports = home;

