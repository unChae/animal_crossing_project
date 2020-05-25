/* 2020_05_23 server/api/c_auth/register.js */

// libs
const bcrypt = require("bcrypt");

// modules
const response = require("../../utils/u_res");
const gmail = require("../../utils/u_gmail");
const random = require("../../utils/u_random_number");

// models
const User = require('../../models').User;

var register = (req, res) => {
  const { us_email, us_password, us_nickname, us_islandname, us_code } = req.body;
  console.log(req.body);
  /*  encrypt password
      NOTE: 10 is saltround which is a cost factor
      cost가 10 이라는 말은 = 2^10qjs 돌린다는 뜻임. cost가 높아질수록 보안은 올라가지만, 속도가 느려진다.
      bcrypt는 단방향 해시 함수를 이용한 모듈이다.
      salt 란? 해쉬 암호화 된 비밀번호 + 기존 비밀번호를 합치는 과정을 말함.
  */
  bcrypt.hash(us_password, 10, async (error, hashedPassword) => {
    if (error) {
      console.log('', error);
      response(res, 500, false, '[에러]서버에 문제가 있어 회원 가입에 실패하였습니다', error);
    } else {
      // 랜덤 엑세스 토큰 생성
      var us_access_token = String(random.getRandomInt(1000, 9999));
      // 네트워크 에러가 없을시 => 객체 생성 후, 유저 모델에 데이터 담기.
      try {
        const user = await User.create({
          us_email,
          us_password: hashedPassword,
          us_nickname,
          us_islandname,
          us_code,
          us_thumbnail: "https://img.insight.co.kr/static/2019/11/05/700/o05x4z6gdt2hlcx358yg.jpg",
          us_access_token
        });
        // 승인 이메일 전송
        // 엑세스토큰 헤쉬후 이메일로 발송
        bcrypt.hash(user.us_access_token, 10, async (error, hashed_access_token) => {
          if (error) {
            console.log('', error);
            response(res, 500, false, '[에러]서버에 문제가 있어 인증 메일 전송에 실패하였습니다', error);
          } else {
            try {
              let emailParam = {
                toEmail : user.us_email
                ,subject  : '인증 메일'
                ,text : 'https://anicro.org/auth/access/' + hashed_access_token.replace(/\//g, "slash") + '/' + user.us_id
              };
              gmail.sendGmail(emailParam);
            } catch (error) {
              response(res, 409, false, '[에러]사용자 아이디가 이미 존재하여 회원 가입이 실패하였습니다', error);
            }
          }
        });
        await response(res, 200, true, '[완료]가입이 정상적으로 완료되었습니다');
      } catch (error) {
        response(res, 409, false, '[에러]사용자 아이디가 이미 존재하여 회원 가입이 실패하였습니다', error);
      }
    }
  });
}

module.exports = register;