/* 2020_05_23 in server/api/c_auth */

// libs
const bcrypt = require("bcrypt");

// modules
const {newToken} = require("../utils/u_auth");
const gmail = require("../utils/u_gmail");
const random = require("../utils/u_random_number");
const hash = require("../utils/u_hash");
// models
const User = require('../models').User;

exports.login = (req, res) => {
  console.log('body parse', req.body);
  // find the user
  // 아이디로 검색하고
  User.findOne({ where: { us_email: req.body.us_email } })
    .then(user => {
      // non registered user
      // 등록된 유저가 아니면 401 오류 반환.
      if (!user) {
        res.status(401).send('Authentication failed. User not found.');
      }
      // 등록된 유저인거 식별되면 bcrypt로 해쉬암호화 된 패스워드 검사 후 콜백 내려주기.
      bcrypt.compare(req.body.us_password, user.us_password, async (error, result) => {
        // 비밀번호 검색중 서버 에러 난 경우 500 오류 반환.
        
        if (error) {
          res.status(500).send('Internal Server Error');
        }
        // 아이디 && 비밀번호 모두 일치한 경우
        if (result) {
          // 이메일 승인된 계정인지 확인
          if(user.us_access === 0){
            // 승인되지 않은 계정일 경우
            // 송신할 계정 로그인 정보 입력
            res.status(200).json({
              success: true,
              message: '이메일 인증을 먼저해 주세요',
            });
          } else {
            
            // create token with user info
            // 새로운 토큰 발행하기.
            const token = newToken(user);
  
            // 로그인 유저 정보 담기.
            // current logged-in user
            const loggedInUser = {
              us_thumbnail: user.us_thumbnail,
              us_nickname: user.us_nickname,
              us_islandname: user.us_islandname,
              us_code: user.us_code
            };
            
            User.update({
            us_logintoken: token
            }, {
              where: {us_email: user.us_email}
            });

            // return the information including token as JSON
            // 로그인 유저 담은거 최종 JSON 파싱해서 보내주기.
            res.status(200).json({
              success: true,
              user: loggedInUser,
              message: 'Login Success',
              token: token,
            });
          }
          
        } else {
          // 아이디는 맞는데 비밀번호가 틀린 경우
          res.status(401).json('Authentication failed. Wrong password.');
        }
      });
    })
    // 처음 아이디 검색하자마자 서버 에러난 경우 500 오류 반환.
    .catch(error => {
      res.status(500).json('Internal Server Error');
      throw error;
    });
}

exports.register = (req, res) => {
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
      return res.status(500).json({
        message: '[에러]서버에 문제가 있어 회원 가입에 실패하였습니다.',
        error,
      });
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
            return res.status(500).json({
              message: '[에러]서버에 문제가 있어 인증 메일 전송에 실패하였습니다.',
              error,
            });
          } else {
            try {
              let emailParam = {
                toEmail : user.us_email
                ,subject  : '인증 메일'
                ,text : 'https://anicro.org/auth/access/' + hashed_access_token.replace(/\//g, "slash") + '/' + user.us_id
              };
              gmail.sendGmail(emailParam);
            } catch (error) {
              res.status(409).json({
                message:
                  '[에러]사용자 아이디가 이미 존재하여 회원 가입이 실패하였습니다.',
              });
            }
          }
        });
        
        await res
          .status(200)
          .json({ message: '[완료]가입이 정상적으로 완료되었습니다..' });
      } catch (error) {
        res.status(409).json({
          message:
            '[에러]사용자 아이디가 이미 존재하여 회원 가입이 실패하였습니다.',
        });
      }
      // TODO 한글 저장 오류로 인한 테이블 UTF8 설정
    }
  });
}

exports.email_access = function(req, res) {
  var hashed_access_token = req.params.hashed_access_token;
  var us_id = req.params.us_id;
  
  User.findOne({ where: { us_id: us_id } })
  .then(user => {
    bcrypt.compare(user.us_email, hashed_access_token.replace(/slash/g, "/"), (error, result) => {
      if(result){
        User.update({
          us_access: 1
        }, {
          where: { us_id: us_id }
        })
        res.status(200).json({
          success: true,
          message: '인증 성공',
        });
      } else {
        console.log("잘 못된 인증 접근");
      }
    });
  })
}

exports.logout = function(req, res) {
  var us_id = req.params.us_id;
  
  User.destroy({
    where: { us_id: us_id }
  })
  .then(res => {
     res.status(200).json({
      success: true,
      message: '로그아웃 완료',
    });
  })
  .catch(err => {
    
  })
}