var scene = document.getElementById('posterParallax');
var parallax = new Parallax(scene, {
  selector: '.layer'
});

$(document).ready(function() {

  // URL for Twitch TV Streams
  var URL_Streams = 'https://api.twitch.tv/kraken/streams/';

  // URL for Twitch TV Channels
  var URL_Channel = 'https://api.twitch.tv/kraken/channels/';

  var callbak = '?callback=?&client_id=j15r3tcqv1ies1opd4ve46kq74106un';

  // sample Twitch TV Users

  var twitchUsers = [
    "ESL_SC2",
    "ESL_CSGO",
    "OgamingSC2",
    "cretetion",
    "freecodecamp",
    "storbeck",
    "habathcx",
    "RobotCaleb",
    "noobs2ninjas",
    "comster404",
    "brunofin",
    "medrybw",
    "monstercat",
    "aces_tv",
    "loserfruit",
    "behkuhtv",
    "fakename",
    "food"
  ];

  var twitchUsersData = [];
  var streamStatus = '';
  var MAX_INFO = 45;
  var refreshRate = 300000;
  var active = 'all';
  var twitchLogo = 'http://2am.ninja/twitch/img/GlitchIcon_WhiteonPurple.png';

  function loading() {
    $("#results").html('<div class="loading"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>');
  }

  function getStatus() {
    $("#results").empty();
    loading();
    twitchUsersData = [];

    twitchUsers.forEach(function(user) {

      var URL = URL_Streams + user + callbak;
      $.getJSON(URL, user)
        .done(function(data, textStatus, jqXHR) {

          var tempUsersData = {};

          tempUsersData.name = user;

          tempUsersData.status = data.status;
          

          tempUsersData.streaming = (data.stream !== null);
          if (tempUsersData.streaming) {
            tempUsersData.viewers = data.stream.viewers;
            tempUsersData.preview = data.stream.preview.large;
          } else {
            tempUsersData.viewers = null;
            tempUsersData.preview = null;
          }

          var URL = URL_Channel + user + callbak;

          $.getJSON(URL)
            .done(function(data, textStatus, jqXHR) {
              

              if (data.status === 422) {
                tempUsersData.streaming = null;
                tempUsersData.info = "account closed";
                tempUsersData.viewers = null;
                tempUsersData.preview = null;

              } else if (data.status === 404) {
                tempUsersData.streaming = null;
                tempUsersData.info = "non-existant account";
                tempUsersData.viewers = null;
                tempUsersData.preview = null;
              }

              tempUsersData.logo = data.logo;
              tempUsersData.url = null;
              if (data.status !== 422 && data.status !== 404) {
                tempUsersData.info = data.status;
                tempUsersData.displayName = data.display_name;
                tempUsersData.game = data.game;

                if (tempUsersData.preview === null && data.profile_banner !== null) {
                  tempUsersData.preview = data.profile_banner;
                }
                if (tempUsersData.preview === null && data.video_banner !== null) {
                  tempUsersData.preview = data.video_banner;
                }
                if (tempUsersData.preview === null && data.video_banner === null) {
                  tempUsersData.preview = "twitch";
                }
                //tempUsersData.url = data.url;
                tempUsersData.url = 'https://www.twitch.tv/' + data.name;
              }
              twitchUsersData.push(tempUsersData);
              // showUserData(tempUsersData);
              if (twitchUsersData.length == twitchUsers.length) {
                $("#results").empty();
                twitchUsersData.sort(sortList);
                twitchUsersData.forEach(function(who) {
                  $(".btn-group > .btn").removeClass("active");
                  $("#all").addClass("active");
                  showUserData(who);
                });
              }
            })

          .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown.toString());
          });
        })

      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown.toString());
      });
    });
  }

  function showUserData(who) {

    var html = '';
    html += '<div class="col-xs-12 col-md-6 col-lg-4">';

    if (who.url !== null) {
      html += '<a href="' + who.url + '" target="_blank">';
    }

    html += '<div class="infocard" id="infocard_' + who.name + '">';

    if ((who.logo === null) || (who.logo === undefined)) {
      userLogo = 'http://2am.ninja/twitch/img/unknown.png';
    } else {
      userLogo = who.logo;
    }

    if (who.streaming) {
      streamStatus = 'stream-on';
    } else {
      streamStatus = 'stream-off';
    }

    html += '<img class="logo ' + streamStatus + '" src="' + userLogo + '" alt="">';

    if (who.url !== null) {
      html += '<div class="play"><i class="fa fa-play-circle-o fa-5x" aria-hidden="true"></i></div>';
    }

    html += '<div class="info"><ul>';

    var displayName = who.displayName;
    if (who.displayName === undefined) {
      displayName = who.name;
    }
    html += '<li"><span class="name">' + displayName + '</span></li>';

    if (who.info !== null) {
      html += '<li class="smaller">' + truncate(who.info, MAX_INFO) + '</li>';
    }

    var game = "";
    if (who.game !== null) {
      game = who.game;
    }
    if (who.streaming) {
      html += '<li class="smaller2">' + game + '&nbsp;&nbsp;<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span> ' + who.viewers + '</li>';
    }
    html += '</ul></div>';
    html += '</div>';
    html += '</a>';
    html += '</div>';

    $("#results").append(html);

    if (who.preview !== null && who.preview !== 'twitch') {
      $('#infocard_' + who.name).css({
        "background-image": 'url(' + who.preview + ')',
        "background-color": "black"
      });
    }

    if (who.preview === "twitch") {
      $('#infocard_' + who.name).css(
        "background-color", "#6441A5"
      );
    }

    //$('#infocard_' + who.name).toggle();
    $('#infocard_' + who.name).addClass('animated fadeIn');

  }

  function truncate(str, num) {
    if (typeof(str) !== 'undefined') {
      if (str.length > num) {
        return str.slice(0, num - 3) + '&#8230;';
      }
    }
    return str;
  }

  function sortList(a, b) {
    var nameA = a.name.toLowerCase(),
      nameB = b.name.toLowerCase();
    if (nameA < nameB)
      return -1;
    if (nameA > nameB)
      return 1;
    return 0;
  }

  $(".btn-group > .btn").click(function() {
    $(".btn-group > .btn").removeClass("active");
    $(this).addClass("active");
  });

  $("#all").click(function() {
    $("#results").empty();
    twitchUsersData.sort(sortList);
    twitchUsersData.forEach(function(who) {
      showUserData(who);
    });
  });

  $("#online").click(function() {
    $("#results").empty();
    twitchUsersData.sort(sortList);
    twitchUsersData.filter(function(channel) {
      return channel.streaming;
    }).forEach(function(who) {
      showUserData(who);
    });
  });

  $("#offline").click(function() {
    $("#results").empty();
    twitchUsersData.sort(sortList);
    twitchUsersData.filter(function(channel) {
      return (!channel.streaming);
    }).forEach(function(who) {
      showUserData(who);
    });
  });

  $('input[type="search"]').keyup(function() {
    var search = $(this).val().toLowerCase();
    var results = twitchUsersData.filter(function(who) {
      return (who.name.toLowerCase().indexOf(search) != -1);
    });

    $("#results").empty();
    twitchUsersData.sort(sortList);
    results.forEach(function(who) {
      showUserData(who);
    });
  });

  getStatus();

  // update info every 5 mins
  intervalID = setInterval(getStatus, refreshRate);

});