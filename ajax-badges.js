// var _ = require('lodash');

var usernames = ["mitchelllillie", "patharryux", "jeffdunn", "donguyen", "mkelley2", "josephfraley2", "kathleenkent", "adamtaitano", "jasonsiren"];
// var usernames = ["jtz1983", "erikphansen"];

//check for inputs and add to array on button click
// var $uname = $('#uname').val();
// $("#in").click(function () {
//   usernames.push($uname);
//   $("body").empty();
//   usernames.forEach(getData);
// });

function getData (name) {
    $.get('http:/teamtreehouse.com/'+name+'.json').
        done(importUser);
}

usernames.forEach(getData);

var allUsers = {};
var allBadges = {};

function importUser(response) {
  var imported = new PersonCtor(response.profile_name, response.name);
  allUsers[response.profile_name] = imported;
  response.badges.forEach(function(badge) {
    imported.addBadge(badge.id, badge.name, badge.icon_url);
  });
  if (_.keys(allUsers).length >= usernames.length) {
    printBadges();
  }
}

function BadgeCtor(id, name, url) {
  this.id = id;
  this.name = name;
  this.url = url;
  this.whoHas = {};
}

BadgeCtor.prototype.addUser = function (name, userObj) {
  this.whoHas[name] = userObj;
};

// called by PersonCtor.prototype.addBadge
function reqBadge (id, name, url) {
  if (!(id in allBadges)) {
    allBadges[id] = new BadgeCtor(id, name, url);
  }
  return allBadges[id];
}

function PersonCtor (username, name) {
  this.username = username;
  this.name = name;
  this.badges = {};
  this.similarity = {};
  this.scores = {};
}

PersonCtor.prototype.addBadge = function (id, name, url) {
  var addedBadge = reqBadge(id, name, url);
  this.badges[id] = addedBadge;
  addedBadge.addUser(this.username, this);
};

function hasBadge(uname, bID) {
  var testUser = allUsers[uname] || uname;
  bID += "";
  // if string parameters:
  return (bID in testUser.badges);
}

function peopleDoing(bID) {
  var testBadge = allBadges[bID] || bID;
  // overload for string parameter:
  return testBadge.whoHas;
} //--> Array of people-objects

function badgesDoneBy(uname) {
  var testUser = allUsers[uname] || uname;
  // overload for string parameter:
  return testUser.badges;
} //--> Array of badge objects

function intersectBadges(nameA, nameB) {
  // overload for both strings and objects
  var nA = allUsers[nameA] || nameA;
  var nB = allUsers[nameB] || nameB;

  // actual intersection
  var intersectKeys = _.intersection(_.keys(nA.badges), _.keys(nB.badges));
  var intersectArr = [];
  for (var i = 0; i< intersectKeys.length; i++) {
    intersectArr.push(nA.badges[intersectKeys[i]]);
  }
  return intersectArr;
}

function similarity(personA, personB) {
  // overload for both strings and objects
  var pA = allUsers[personA] || personA;
  var pB = allUsers[personB] || personB;

  // get intersected badges
  var intersect = _.keys(intersectBadges(pA, pB)).length;
  var alength = _.keys(badgesDoneBy(pA)).length;
  var blength = _.keys(badgesDoneBy(pB)).length;


  //see whih person has more jobs and divide number of intersected jobs by that amount
  if (alength > blength) {
    // console.log(intersect);
    pA.similarity[pB.username] = intersect/alength;
    // console.log(intersect);
    pB.similarity[pA.username] = intersect/alength;
  } else {
    // console.log(allUsers[pA]);
    // console.log(pA.similarity);
    pA.similarity[pB.username] = intersect/blength;
    pB.similarity[pA.username] = intersect/blength;
  }
}

///Score:
// _.mapvalues to get an object with different key/values
function score(bID, uname) {
  // overload for badge and name and initialize the score to 0
  var badgeID = allBadges[bID] || bID,
      user = allUsers[uname] || uname,
      retScore = 0;

  // get an array of the people objects who have done the badge
  var badgesDoing = peopleDoing(badgeID);

  // skipping the person being tested, sum the similarities of all people in the array
  for (var name in badgesDoing) {
    // console.log(badgesDoing[name]);
    if (badgesDoing[name].username !== user.username) {
      // console.log("similarity:");
      // console.log(similarity(p.username, badgesDoing[name].username));
      similarity(user.username, badgesDoing[name].username);
      retScore += user.similarity[name];
    }
  }
  user.scores[badgeID.id] = retScore;
}

function recommend (uname) {
  for (var badges in allBadges) {
    score(badges, uname);
  }
  var xArray = _.pairs(allUsers[uname].scores);
  xArray.sort(function(a,b) {
    if (a[1] > b[1]) {
      return -1;
    } else {
      return 1;
    }
  });
  return xArray.slice(1,6);

//   allUsers[uname].scores = _.pick(allUsers[uname].scores, function (value) {
//   return value > 1;
// });
}

function printBadges() {
  $("body").dblclick(
    function () {
      $("img").slideDown();
      $("p").empty();
    });

  // for every user:
  for (var user in allUsers) {

    // create a div with class user and ID of username

    var $user = $('<div class="user" id="' + allUsers[user].username + '">').appendTo("body");

    // create a header with the username
    $("<H1>").appendTo($user).html(allUsers[user].name);

    // for every badge earned, append an image to the user's div
    for (var badge in allUsers[user].badges) {
      $("<img>", {src: allUsers[user].badges[badge].url, alt: allUsers[user].badges[badge].name}).appendTo($user);
    }

    // create new div for recommendations
    var $recDiv = $("<div>", {class: "recommended"}).appendTo($user);
    $("<H3>").html("Recommended badges:").appendTo($recDiv);

    // for all recommended badges, add an image if score meets qualifications with class "recommended"
    var recs = recommend(user);
    // console.log("recs = ");
    // console.log(recs);
    for (var rec in recs) {
      // console.log(rec);
        $("<img>", {src: allBadges[recs[rec][0]].url, alt: allBadges[recs[rec][0].name]}).appendTo($recDiv);
    }
  }


}
//
// if (typeof module !== undefined) {
// module.exports = {
//     maxLength:maxLength,
//     sizeColumns:sizeColumns,
//     writeRow:writeRow,
//     writeBadgesTable:writeBadgesTable
//   };
// }
