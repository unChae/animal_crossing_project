exports.login = (io) => {
    const login = require("./login")(io);
    return login;
}

const register = require("./register");
exports.register = register;

const email_access = require("./email_access");
exports.email_access = email_access;

const logout = require("./logout");
exports.logout = logout;

const token_check = require("./token_check");
exports.token_check = token_check;
