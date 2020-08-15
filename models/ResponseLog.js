module.exports = function (app, mongoose) {
    var Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId;

    var ResponseLogSchema = new Schema({
        log_id: {type: ObjectId},
        checker_id: {type: String, required: true},
        status_code: {type: Number, required: true},
        create_date: {type: Date, default: Date.now, required: true}
    });

    var ResponseLog = mongoose.model('ResponseLog', ResponseLogSchema);

    var recordResponseLog = function(log){
        var new_log = new ResponseLog(log);

        new_log.save().onReject(function(err){
            console.log(err.message);
        });
    };

    var findResponseLogs = function(conditions, callback){
        ResponseLog.find(conditions).sort('-create_date').exec(callback);
    };

    return {
        recordResponseLog:recordResponseLog,
        findResponseLogs:findResponseLogs
    }
};
