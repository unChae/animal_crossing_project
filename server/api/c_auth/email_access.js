/*

*/

// libs
const bcrypt = require("bcrypt");
const fs = require('fs');

// modules
const response = require("../../utils/u_res");

// models
const models = require("../../models");
const User = models.User;

let email_access = async (req, res) => {
    console.log("test");
    let hashed_access_token = req.params.hashed_access_token;
    let us_id = req.params.us_id;
  
    let user = await User.findOne({ 
        where: { us_id: us_id } 
    })

    let check = await bcrypt.compare(user.us_access_token, hashed_access_token.replace(/slash/g, "/"));
    
    if(check){
        User.update({
            us_access: 1
        }, {
            where: { us_id: us_id }
        });
        fs.readFile(__dirname + '/index.html', (err, data) => { // 파일 읽는 메소드
            if (err) {
              return console.error(err); // 에러 발생시 에러 기록하고 종료
            }
            res.end(data, 'utf-8'); // 브라우저로 전송
         });
    } else {
        response(res, 409, false, '[에러]잘못된 접근입니다');
    }
}

module.exports = email_access;