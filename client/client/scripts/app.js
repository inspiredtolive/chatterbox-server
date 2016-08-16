var app = {

  //TODO: The current 'handleUsernameClick' function just toggles the class 'friend'
  //to all messages sent by the user
  server: 'http://127.0.0.1:3000/classes/messages',
  username: 'anonymous',
  roomname: 'lobby',
  messages: [],
  lastDate: 0,
  friends: {},

  init: function() {
    // Get username
    var user = $('<div />').text(prompt('What is your name?'));
    app.username = user.text();

    // Cache jQuery selectors
    app.$message = $('#message');
    app.$chats = $('#chats');
    app.$roomSelect = $('#roomSelect');
    app.$send = $('#send');

    // Add listeners
    app.$send.on('submit', app.handleSubmit);
    app.$roomSelect.on('change', app.handleRoomChange);
    app.$chats.on('click', '.username', app.handleUsernameClick);

    // fetch new messages
    app.fetch();

    // poll for new messages
    // setInterval(app.fetch, 1000);

  },

  fetch: function() {
    $.ajax({
      url: app.server,
      type: 'GET',
      // data: {
      //   order: '-createdAt'
      // },
      success: function(data) {
        console.log('success!', data);
        if (!data.results || !data.results.length) { return; }

        app.messages = data.results;

        var mostRecentMessage = app.messages[0];

        if (mostRecentMessage.createdAt !== app.lastDate) {
          app.lastDate = mostRecentMessage.createdAt;

          app.renderMessages(app.messages);
          app.renderRoomList(app.messages);
        }

      },
      error: function(error) {
        console.error('fetch fails', error);
      }
    });
  },

  renderMessages: function(messages) {
    app.clearMessages();

    messages
      .filter(function(message) {
        if (app.roomname === 'lobby' && !message.roomname) {
          return true;
        } else if (message.roomname === app.roomname) {
          return true;
        } else {
          return false;
        }
      })
      .forEach(app.renderMessage);
  },

  clearMessages: function() {
    app.$chats.html('');
  },

  renderMessage: function(message) {
    var $chat = $('<div class="chat" />');

    var $username = $('<span class="username" />');
    $username
      .text(message.username + ': ')
      .attr('data-username', message.username)
      .appendTo($chat);
    $chat.append('<br>');
    var $message = $('<span/>');
    $message.text(message.text).appendTo($chat);

    app.$chats.append($chat);

    if (app.friends[message.username] === true) {
      $username.addClass('friend');
    }
  },

  handleSubmit: function(event) {

    var message = {
      username: app.username,
      text: app.$message.val(),
      roomname: app.roomname || 'lobby'
    };

    app.send(message);

    event.preventDefault();
  },

  send: function(message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      success: function(data) {
        app.$message.val('');
        app.fetch();
      },
      error: function(error) {
        console.error('could not send message', error);
      }
    });
  },

  renderRoomList: function(messages) {
    app.$roomSelect.html('<option value="__newRoom">New room...</option>');
    var rooms = {};

    if (messages) {
      messages.forEach(function(message) {
        var roomname = message.roomname;
        if (roomname && !rooms[roomname]) {
          app.renderRoom(roomname);

          rooms[roomname] = true;
        }
      });
    }
  },

  renderRoom: function(roomname) {
    var $option = $('<option />').val(roomname).text(roomname);

    app.$roomSelect.append($option);
  },

  handleRoomChange: function(event) {
    var selectIndex = app.$roomSelect.prop('selectedIndex');

    if (selectIndex === 0) {
      // new room
      var roomname = prompt('Enter room name');

      if (roomname) {
        app.roomname = roomname;

        app.renderRoom(roomname);

        app.$roomSelect.val(roomname);
      }
    } else {
      // existing room
      app.roomname = app.$roomSelect.val();
    }

    app.renderMessages(app.messages);
  },

  handleUsernameClick: function(event) {
    var username = $(event.target).data('username');

    if (username !== undefined) {
      app.friends[username] = !app.friends[username];
    }

    var selector = '[data-username="' + username.replace(/"/g, '\\\"') + '"]';
    var $usernames = $(selector).toggleClass('friend');
  }

};