// modules
const response = require("../../utils/u_res");
const token = require("../../utils/u_token");
const hash = require("../../utils/u_hash");
const socket = require("../../utils/u_socket");

// models
const User = require('../../models').User;

var login = (io) => {
  return (req, res) => {
    console.log('body parse', req.body);
    // 아이디로 검색
    User.findOne({ where: { us_email: req.body.us_email } })
    .then(user => {
      // 등록된 유저가 아니면 401 오류 반환
      if (!user) {
        response(res, 401, false, '[에러]등록된 유저가 아닙니다');
      }
      // 등록된 유저인거 식별되면 bcrypt로 해쉬암호화 된 패스워드 검사 후 콜백 내려주기.
      var compare_result = hash.compare(req.body.us_password, user.us_password);
      compare_result
      .then((result) => {
        if (result) {
          // 이메일 승인된 계정인지 확인
            if(user.us_access === 0){
            // 승인되지 않은 계정일 경우
            response(res, 200, false, '[에러]이메일 인증을 먼저해 주세요');
          } else {
            // 새로운 토큰 발행하기
            const new_token = token(user);
            // 로그인 유저 정보 담기
            const us_info = {
              us_thumbnail: user.us_thumbnail,
              us_nickname: user.us_nickname,
              us_islandname: user.us_islandname,
              us_code: user.us_code,
              us_id: user.us_id
            };
            
            User.update({
            us_logintoken: new_token
            }, {
                where: {us_email: user.us_email}
            });
            
            io.on('connection', (socket) => {
                console.log('a user connected');
            });
            // 로그인 유저 담은거 최종 JSON 파싱해서 보내주기
            response(res, 200, true, '[완료]로그인 성공', {us_info, new_token});
          }
        } else {
          // 아이디는 맞는데 비밀번호가 틀린 경우
          response(res, 401, false, '[에러]비밀번호가 틀렸습니다');
        }
      })
      .catch(error => {
        response(res, 500, false, '[에러]서버에 문제가 생겼습니다');
      });
    })
    // 처음 아이디 검색하자마자 서버 에러난 경우 500 오류 반환.
    .catch(error => {
      response(res, 500, false, '[에러]서버에 문제가 생겼습니다');
      throw error;
    });
  }
};

module.exports = login;