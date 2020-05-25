// call controller
const ctrl = require('../api/c_home');

module.exports = (router) => {
    
    router.post('/', ctrl.home);
    router.post('/get_category', ctrl.category);
    
    return router;
};

