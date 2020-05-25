// lib
var nodemailer = require('nodemailer');

// config
var gmail_account = require('../config/gmail');

// 메일발송 객체
var mailSender = {
	// 메일발송 함수
    sendGmail : function(param){
        var transporter = nodemailer.createTransport({
            service: 'gmail'
            ,prot : 587
            ,host :'smtp.gmail.com'
            ,secure : false
            ,requireTLS : true
            , auth: {
              user: gmail_account.id
              ,pass: gmail_account.password
            }
        });
        // 메일 옵션
        var mailOptions = {
                from: 'Anicro.org',
                to: param.toEmail, // 수신할 이메일
                subject: param.subject, // 메일 제목
                text: param.text // 메일 내용
            };
        // 메일 발송    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        
    }
}
// 메일객체 exports
module.exports = mailSender;