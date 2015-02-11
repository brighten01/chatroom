var socket = io.connect("http://127.0.0.1:1337");
var username = {};

function creathtml(messagedata){
    var html = "";
    for(var i in messagedata){
        html +='<div class="list-group-item">'+messagedata[i].creator+' :  '+messagedata[i].content+'</div>';
    }
    $(".message_content").html(html);
}

$(document).ready(function (){
    $(".chat").hide();
    $("#content").bind("keydown",function (event){
        if(event.keyCode==13) {
            // 执行发送事件
            setTimeout(function ()  {
                var content = $("#content").val();
                $("#content").val('');
                var time = new Date().getTime();
                var message =  {time:time,content:content,creator:"gaohui"};
                socket.emit("createMessage",message);
                socket.on("messageAdd",function(messages){
                    creathtml(messages);
                });
                event.preventDefault();
            } ,100);
        }
    });


});
