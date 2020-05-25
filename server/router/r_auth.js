const ctrl = require('../api/c_auth');

module.exports = (router, io) => {
    // router 로그인 API
    router.post('/login', ctrl.login(io));
    
    // router 회원가입 API
    router.post('/register', ctrl.register);
    
    // 이메일 인증
    router.get('/access/:hashed_access_token/:us_id', ctrl.email_access);
    
    // 로그아웃
    router.post('/logout', ctrl.logout);
    
    // 토큰 비교
    router.post('/token_check', ctrl.token_check);

    return router;
};
