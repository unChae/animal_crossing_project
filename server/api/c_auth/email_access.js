// libs
const bcrypt = require("bcrypt");

// modules
const response = require("../../utils/u_res");

// models
const User = require('../../models').User;

var email_access = function(req, res) {
  var hashed_access_token = req.params.hashed_access_token;
  var us_id = req.params.us_id;
  
  User.findOne({ where: { us_id: us_id } })
  .then(user => {
    console.log(user);
    bcrypt.compare(user.us_access_token, hashed_access_token.replace(/slash/g, "/"), (error, result) => {
      if(result){
        User.update({
          us_access: 1
        }, {
          where: { us_id: us_id }
        })
        response(res, 200, true, '[완료]이메일 인증에 성공했습니다');
      } else {
        response(res, 409, false, '[에러]잘못된 접근입니다', error);
      }
    });
  })
}

module.exports = email_access;