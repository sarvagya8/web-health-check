module.exports = function (app, mongoose) {
    var Schema = mongoose.Schema;

    var CheckerSchema = new Schema({
        title: {type: String, required: true},
        frequency: {type: String, enum: ['one-min','five-min','fifteen-min','one-hour'], required: true},
        url: {type: String, required: true},
        is_healthy: {type: Boolean, default: true, required: true},
        create_date: {type: Date, default: Date.now, required: true},
        is_enabled:{type: Boolean, default: true, required: true}
    });

    var Checker = mongoose.model('Checker', CheckerSchema);

    var createChecker = function(checker,callback){
        console.log('Creating checker ' + checker.title);
        var new_checker = new Checker(checker);

        new_checker.save(function(err){
            callback(err);
        });
    };

    var findCheckers = function(callback, options){
        Checker.find(options).sort('-create_date').exec(callback);
    };

    var findById = function(id, callback){
        Checker.findById(id).exec(callback);
    };

    var updateHealthMark = function (checker_id,new_status) {
        Checker.update({_id: checker_id}, {is_healthy: new_status}).exec()
            .onReject(function(err){
                console.log(err.message);
            });
    };

    var enable = function (checker_id) {
        Checker.update({_id: checker_id}, {is_enabled: true}).exec()
            .onReject(function(err){
                console.log(err.message);
            });
    };

    var disable = function (checker_id) {
        Checker.update({_id: checker_id}, {is_enabled: false}).exec()
            .onReject(function(err){
                console.log(err.message);
            });
    };

    return {
        createChecker: createChecker,
        findCheckers: findCheckers,
        updateHealthMark: updateHealthMark,
        findById: findById,
        enable: enable,
        disable: disable
    };
};
