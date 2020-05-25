// call controller
const ctrl = require('../api/c_board');

// modules
let s3 = require("../utils/u_s3");

module.exports = (router) => {
  
    // 게시글 작성
    router.post('/create', ctrl.create);
    
    // 이미지 업로드
    router.post('/image', s3.upload.array('img'), ctrl.image);
  
    return router;
}
