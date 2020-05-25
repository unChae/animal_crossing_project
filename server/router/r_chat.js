// call controller
const ctrl = require('../api/c_chat');

module.exports = (router) => {
    
    router.get('/get_room', ctrl.get_room);
    
    return router;
};

