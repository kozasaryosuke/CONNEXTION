exports.move = function() {
    var tabGroup = Titanium.UI.createTabGroup(),
    Cloud = require('ti.cloud'),
    accessToken = Ti.App.Properties.getString('accessToken');

    // tabGroupの作成
    var profileList = $.UI.create('Window',{classes:"basicWindow"});
    var receiveList = $.UI.create('Window',{classes:"basicWindow"});
    var chatList = $.UI.create('Window',{classes:"basicWindow"});
    var settingList = $.UI.create('Window',{classes:"basicWindow"});
    var tab1 = $.UI.create('Tab',{classes:"tab1",window:profileList});
    var tab2 = $.UI.create('Tab',{classes:"tab2",window:receiveList});
    var tab3 = $.UI.create('Tab',{classes:"tab3",window:chatList});
    var tab4 = $.UI.create('Tab',{classes:"tab4",window:settingList});
    tabGroup.addTab(tab1);
    tabGroup.addTab(tab2);
    tabGroup.addTab(tab3);
    tabGroup.addTab(tab4);
    tabGroup.open();

    // 必要画面の作成
    var profileDetail = Ti.UI.createWindow({title:'プロフィール',barColor:'#000'});
    var chatDetail = Ti.UI.createWindow({title:'チャット',barColor:'#000'});

    // profileList
    var profileHeader = $.UI.create('View', {classes:"profileHeader"});
    var profileCount = $.UI.create('Label', {classes:"profileCount"});
    var profileTable = $.UI.create('TableView', {classes:"profileTable"});
    profileHeader.add(profileCount);
    profileList.add(profileHeader);
    profileList.add(profileTable);

    Cloud.SocialIntegrations.externalAccountLogin({
        type: 'facebook',
        token: accessToken
    }, function (e) {
        if (e.success) {
            // userのroleを取得し、それ以外のユーザーを表示する
            var me = e.users[0];
            var role = me.role;
            Cloud.Users.query({
                where: {
                    // role:{"$ne":role}
                }
            }, function (e) {
               if (e.success) {
                    var rows = [];
                    for (var i = 0; i < e.users.length; i++) {
                        var user = e.users[i];
                        Ti.API.info(user);
                        var profileRow = $.UI.create('TableViewRow',{classes:"profileRow"});
                        var profilePhoto = $.UI.create('ImageView',{
                        	classes:"profilePhoto",
                        	image:"http://graph.facebook.com/" + user.external_accounts.external_id + "/picture" // 外部から読み込めない！！
                        });
                        var profileLabel = $.UI.create('Label',{classes:"profileLabel",text: user.custom_fields.nickname + '（' + user.custom_fields.birthday + '歳）' + user.custom_fields.residence});
                        var profileBalloon = $.UI.create('View',{classes:"profileBalloon"});
                        var balloonLabel = $.UI.create('Label',{classes:"balloonLabel",text: user.custom_fields.introduction});
                        profileBalloon.add(balloonLabel);
                        var profileLink = $.UI.create('View',{classes:"profileLink"});
                        profileLink.addEventListener('click',function(e){tab1.open(profileDetail);});
                        profileRow.add(profilePhoto);
                        profileRow.add(profileLabel);
                        profileRow.add(profileBalloon);
                        profileRow.add(profileLink);
                        rows.push(profileRow);
                    }
                    profileTable.setData(rows);
                } else {
                    alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                }
            });
        } else {
            Ti.API.info("Login failed.");
        }
    });

    // chatList
    var chatTable = $.UI.create('TableView',{classes:"chatTable"});

    Cloud.SocialIntegrations.externalAccountLogin({
        type: 'facebook',
        token: accessToken
    }, function(e) {
        if (e.success) {
            Cloud.Chats.getChatGroups(function (e) {
                if (e.success) {
                    rows = [];
                    for (var i = 0; i < e.chat_groups.length; i++) {
                        var group = e.chat_groups[i];
                        var chatRow = $.UI.create('TableViewRow',{classes:"chatRow"});
                        var chatPhoto = $.UI.create('ImageView',{classes:"chatPhoto"});
                        var chatLabel = $.UI.create('Label',{classes:"chatLabel",text: group.participate_ids});
                        var chatMessage = $.UI.create('Label',{classes:"chatMessage",text: group.message});
                        var chatLink = $.UI.create('View',{classes:"chatLink"});
                        chatLink.addEventListener('click',function(e){tab3.open(chatDetail);});
                        chatRow.add(chatPhoto);
                        chatRow.add(chatLabel);
                        chatRow.add(chatMessage);
                        chatRow.add(chatLink);
                        rows.push(chatRow);
                    }
                    chatTable.setData(rows);
                } else {
                    alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                }
            });
        } else {
            Ti.API.info("Login failed.");
        }
    });
    chatList.add(chatTable);
};