var response = function(res, status, success, message, info) {
    var response_data = {
        status,
        success,
        message,
        info
    }
    
    // for(var i = 0; i < data.length; i++) {
    //     response_data.push(  data[i] );
    // }
    // response_data.push(status);
    // response_data.push(success);
    // response_data.push(message);
    
    
    res.status(status).json(response_data);
}
module.exports = response;