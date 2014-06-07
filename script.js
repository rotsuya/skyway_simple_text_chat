/**
 * Created by yusuke on 2013/12/20.
 * Modified by rotsuya on 2014/06/07.
 */

// APIキー
var APIKEY = '19887cda-ec9e-11e3-ab0c-7380ef9fa423';

// ユーザーリスト
var userList = [];

// Callオブジェクト
var existingConnection;

// Compatibility

// Peerオブジェクトを生成、SkyWayに接続
var peer = new Peer({ key: APIKEY, debug: 3});

// SkyWayにつながったときに発生
peer.on('open', function(){
    $('#my-id').val(peer.id);

    // 接続ボタンがクリックされた時に発生
    $('#button-connect').click(function(){
        var connection = peer.connect($('#contactlist').val());
        makeCall(connection);
    });

    // 切断ボタンがクリックされた時に発生
    $('#button-end').click(function(){
        existingConnection.close();
        showCallUI();
    });

    //ユーザリスト取得開始
    setInterval(getUserList, 2000);
});

// 相手から接続要求が来たら発生
peer.on('connection', function(connection){
    makeCall(connection);
});

// エラーハンドラー
peer.on('error', function(err){
    alert(err.message);
    showCallUI();
});

function showCallUI () {
    //UIコントロール
    $('#ui-end').hide();
    $('#ui-connect').show();
}

// 相手から接続要求が来た場合と、自分から接続要求を出した場合の、共通の処理
function makeCall (connection) {
    // すでに接続中の場合はクローズする
    if (existingConnection) {
        existingConnection.close();
    }

    connection.on('open', function() {
        $('#form-send').on('submit', function(event) {
            event.preventDefault();
            var data = $('#message-to-send').val();
            connection.send(data);
            $messageReceived = $('#message-received');
            $messageReceived.html('あなた: ' + data + '<br />' + $messageReceived.html());
        });
    });

    // 相手からのメディアストリームを待ち受ける
    connection.on('data', function(data){
        $messageReceived = $('#message-received');
        $messageReceived.html('相手: ' + data + '<br />' + $messageReceived.html());
    });

    // 相手がクローズした場合
    connection.on('close', showCallUI);

    // Callオブジェクトを保存
    existingConnection = connection;

    // UIコントロール
    $('#their-id').val(connection.peer);
    $('#ui-connect').hide();
    $('#ui-end').show();

}

function getUserList () {
    //ユーザリストを取得
    $.get('https://skyway.io/active/list/' + APIKEY,
        function(list){
            for(var cnt = 0;cnt < list.length;cnt++){
                if($.inArray(list[cnt],userList)<0 && list[cnt] != peer.id){
                    userList.push(list[cnt]);
                    $('#contactlist').append($('<option>', {"value":list[cnt],"text":list[cnt]}));
                }
            }
        }
    );
}

