/*

*/
// modules
const response = require("../../utils/u_res");

// models
const models = require("../../models");
const User = models.User;
const Blacklist = models.Blacklist;

let email_check = async (req, res) => {
  let {us_email} = req.query;

  let user = await User.findOne({
    where: {us_email}
  })

  if(!user) {
    let blacklist = await Blacklist.findOne({
      where: {bl_us_email: us_email}
    })
    if(blacklist) {
      response(res, 409, false, "[에러] 정지된 계정입니다.", false);
    } else {
      response(res, 200, true, "[완료] 가입가능한 이메일입니다.", true);
    }
  } else {
    response(res, 409, false, "[에러] 이미 존재하는 이메일입니다.", false);
  }
  
}

module.exports = email_check;