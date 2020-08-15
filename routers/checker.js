var async = require('async');

module.exports=function(app, models){
    app.get('/checker-list', function (req, res) {
        models.Checker.findCheckers(function (err, checkers) {
            if (err) {
                res.status(500);
                res.render('500', {title: '500: Internal Server Error', error: error});
            }else {
                res.render('checker-list', {
                    title: 'Checker list',
                    checkers:checkers
                });
            }
        },{});
    });

    app.get('/checker/:id', function (req, res) {
        async.parallel({
            checker: async.apply(models.Checker.findById, req.params.id),
            logs: async.apply(models.ResponseLog.findResponseLogs, {'checker_id':req.params.id})
        },function (err,model) {
            if (err) {
                res.status(500);
                res.render('500', {title: '500: Internal Server Error', error: error});
            }else {
                model.title = 'Checker' + req.params.id;
                res.render('checker', model);
            }
        });
    });

    app.get('/checker-editor', function (req, res) {
        res.render('checker-editor', {
            title: 'Checker Editor'
        });
    });

    app.post('/checker/:id/enable', function (req, res) {
        models.Checker.enable(req.params.id);
        res.status(200);
    });

    app.post('/checker/:id/disable', function (req, res) {
        models.Checker.disable(req.params.id);
        res.status(200);
    });

    app.post('/new-checker', function (req, res) {
        models.Checker.createChecker({
            title:req.body.title,
            frequency:req.body.frequency,
            url:req.body.url
        }, function(err){
            if(err) {
                console.warn(err.message);
                res.status(500);
            }else {
                res.status(200);
            }
        });
    });
};
