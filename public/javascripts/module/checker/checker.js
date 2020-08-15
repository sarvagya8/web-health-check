$('#disable').click(function () {
    var cid = $('#cid').data('cid');
    $.post('/checker/'+cid+'/disable').done(function(data){
        location.reload();
    }).fail(function(data){
        swal("Oops!", "创建失败", "error");
    });
});

$('#enable').click(function () {
    var cid = $('#cid').data('cid');
    $.post('/checker/'+cid+'/enable').done(function(data){
        location.reload();
    }).fail(function(data){
        swal("Oops!", "创建失败", "error");
    });
});