var EE = require('events').EventEmitter,
    mail = require('./mail.js')(),
    req = require('request').defaults({timeout:5000});

module.exports = function (models) {

    var reporter = new EE();
    var cache = [];

    var recheck = function () {
        var sendReq = function(checker){
            req.get(checker.url).on('response', function (response) {
                if(response.statusCode != 200){
                    mail.sendWarningMail(checker, response);
                }else{
                    mail.serviceResumedMail(checker);
                    removeFromCache(checker.id);
                    models.Checker.updateHealthMark(checker.id, true);
                }
            }).on('error',function(err){
                if(err.code === 'ETIMEDOUT'){
                    mail.sendTimeoutMail(checker)
                }else{
                    mail.sendNetworkErrorMail(checker, err);
                }
            });
        };
        models.Checker.findCheckers(function(err,cks){
            if(err){
                console.warn(err.message);
            }else{
                for(var i in cks){
                    sendReq(cks[i]);
                }
            }
        }, {_id:{$in:cache},is_enabled:true});
    };

    //recheck checkers in cache
    setInterval(recheck, 1000 * 60 * 5);

    var recordLog = function(checker,response){
        models.ResponseLog.recordResponseLog({
            checker_id: checker.id,
            status_code: response.statusCode
        });
    };

    var removeFromCache = function (id) {
        var index = cache.indexOf(id);
        if (index > -1) {
            cache.splice(index, 1);
        }
    };

    reporter.on('checker-network-error', function (checker, err) {
        if(cache.indexOf(checker.id) == -1){
            mail.sendNetworkErrorMail(checker, err);
            cache.push(checker.id);
        }
        recordLog(checker, {
            statusCode: 0
        });
        models.Checker.updateHealthMark(checker.id, false);
    });

    reporter.on('checker-timeout', function (checker) {
        if(cache.indexOf(checker.id) == -1){
            mail.sendTimeoutMail(checker);
            cache.push(checker.id);
        }
        recordLog(checker, {
            statusCode: -1
        });
        models.Checker.updateHealthMark(checker.id, false);
    });

    reporter.on('checker-failed', function (checker, response) {
        if(cache.indexOf(checker.id) == -1){
            mail.sendWarningMail(checker, response);
            cache.push(checker.id);
        }
        recordLog(checker, response);
        models.Checker.updateHealthMark(checker.id, false);
    });

    reporter.on('checker-succeed', function (checker, resp) {
        //removeFromCache(checker.id);
        recordLog(checker, resp);
        models.Checker.updateHealthMark(checker.id, true);
    });

    return {
        reporter:reporter
    };
};