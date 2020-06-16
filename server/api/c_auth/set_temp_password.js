/*
    임시 비밀번호 발행
*/
// lib

// modules
const response = require("../../utils/u_res");
const random = require("../../utils/u_random");
const gmail = require("../../utils/u_gmail");
const hash = require("../../utils/u_hash");

// models
const models = require("../../models");
const User = models.User;

let set_temp_password = async (req, res) => {
    let {us_email} = req.query;
    
    let user = await User.findOne({
        where: {us_email}
    })
    
    if(!user) {
        response(res, 409, false, "[에러]존재하지 않는 이메일 입니다");
        return;
    }
    
    let random_string = await random.string(8);
    
    let hashed_random_number = await hash.hashing(random_string);
    
    let emailParam = {
        toEmail : us_email,
        subject  : '변경된 메일',
        text : html(random_string)
    };
    gmail.sendGmail(emailParam);
    
    let temp_password = hashed_random_number;
    User.update({
        us_password: temp_password
    }, {
        where: {us_id: user.us_id}
    })
        
    response(res, 200, true, "[완료]임시 비밀번호 발행");

}

module.exports = set_temp_password;

let html = (random_string) => {
    return `
        <body>
        <h3>안녕하세요! 거래해요 동물의숲입니다.</h3>
        <p>임시 비밀번호를 사용해서 로그인해 주세요!</p>
        <b>${random_string}</b>
        <p style="color:red">로그인 후 비밀번호는 꼭 변경해주세요.</p>
        </body>
    `
}