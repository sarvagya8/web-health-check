var req = require('request').defaults({timeout:5000});

module.exports = function () {

    var models,reporter;
    var intervalObjectOneMin, intervalObjectFiveMin, intervalObjectFifteenMin, intervalObjectOneHour;
    /**
     * @param m mongoose models
     * @param rtr health check reporter
     */
    var start = function (m, rtr) {
        models = m;
        reporter = rtr;
        intervalObjectOneMin = setInterval(function () {
            request('one-min');
        }, 1000 * 60);

        intervalObjectFiveMin = setInterval(function () {
            request('five-min');
        }, 1000 * 60 * 5);

        intervalObjectFifteenMin = setInterval(function () {
            request('fifteen-min');
        }, 1000 * 60 * 15);

        intervalObjectOneHour = setInterval(function () {
            request('one-hour');
        }, 1000 * 60 * 60);

        console.log('all requesters have started');
    };

    var stop = function () {
        clearInterval(intervalObjectOneMin);
        clearInterval(intervalObjectFiveMin);
        clearInterval(intervalObjectFifteenMin);
        clearInterval(intervalObjectOneHour);
        console.log('all requesters have stopped');
    };

    var request = function(frequency){
        var sendReq = function(checker){
            req.get(checker.url).on('response', function (response) {
                if(response.statusCode != 200){
                    reporter.emit('checker-failed', checker, response);
                }else{
                    reporter.emit('checker-succeed', checker, response);
                }
            }).on('error',function(err){
                console.warn('Network error : ' + err.message);
                if(err.code === 'ETIMEDOUT'){
                    reporter.emit('checker-timeout', checker);
                }else{
                    reporter.emit('checker-network-error', checker, err);
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
        }, {'frequency':frequency, is_enabled:true});
    };

    return {
        start: start,
        stop: stop
    }
};