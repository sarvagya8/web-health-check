var nodemailer = require('nodemailer'),
    markdown = require('nodemailer-markdown').markdown,
    config = require('/etc/health_check/config.js');

var getSendOption = function(){
    return {
        from: config.smtp.from,
        to: config.smtp.to
    }
};

module.exports = function () {
    var transporter = nodemailer.createTransport({
        host:config.smtp.host,
        port:config.smtp.port,
        secure:true,
        auth:{
            user:config.smtp.user,
            pass:config.smtp.pass
        }
    });
    transporter.use('compile', markdown());

    var sendWarningMail = function(checker,resp){
        var so = getSendOption();
        so.subject = 'Health Check Warning: ' + checker.title;
        so.markdown = '### There\'s something wrong with **' + checker.title + '**\n\n'+
                        '**URL**: ' + checker.url + '\n\n' +
                        '**HTTP Status Code**: ' + resp.statusCode + '\n\n' +
                        '**See**: http://' + config.listenAddress + ':' + config.port + '/checker/' + checker.id;
        transporter.sendMail(so, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('Warning email sent: ' + info.response);
            }
        });
    };

    var sendNetworkErrorMail = function(checker, err){
        var so = getSendOption();
        so.subject = 'Health Check Network Error: ' + checker.title;
        so.markdown = '### There\'s something wrong with **' + checker.title + '**\n\n'+
            '**URL**: ' + checker.url + '\n\n' +
            '**Error Code**: ' + err.code + '\n\n' +
            '**Error Message**: ' + err.message + '\n\n' +
            '**See**: http://' + config.listenAddress + ':' + config.port + '/checker/' + checker.id;
        transporter.sendMail(so, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('Network error email sent: ' + info.response);
            }
        });
    };

    var sendTimeoutMail = function(checker){
        var so = getSendOption();
        so.subject = 'Health Check Timeout Warning: ' + checker.title;
        so.markdown = '### There\'s something wrong with **' + checker.title + '**\n\n'+
            '**URL**: ' + checker.url + '\n\n' +
            '**See**: http://' + config.listenAddress + ':' + config.port + '/checker/' + checker.id;
        transporter.sendMail(so, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('timeout email sent: ' + info.response);
            }
        });
    };

    var serviceResumedMail = function (checker) {
        var so = getSendOption();
        so.subject = 'Health Check Service Has Resumed: ' + checker.title;
        so.markdown = '### Service has resumed **' + checker.title + '**\n\n'+
            '**URL**: ' + checker.url + '\n\n' +
            '**See**: http://' + config.listenAddress + ':' + config.port + '/checker/' + checker.id;
        transporter.sendMail(so, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('resumed email sent: ' + info.response);
            }
        });
    };

    return {
        sendWarningMail:sendWarningMail,
        sendNetworkErrorMail:sendNetworkErrorMail,
        sendTimeoutMail:sendTimeoutMail,
        serviceResumedMail:serviceResumedMail
    }
};