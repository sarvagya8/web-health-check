$(document).ready(function() {
    $('select').material_select();
});

$('#create').click(function () {
    var title = $('#title').val();
    var url = $('#url').val();
    var frequency = $('#frequency').find(':selected').val();

    var param = {
        title:title,
        url: url,
        frequency:frequency
    };

    $.post('/new-checker', param).done(function(data){
        swal("Great!", "创建成功", "success");
    }).fail(function(data){
        swal("Oops!", "创建失败", "error");
    });
});
