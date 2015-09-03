// var _ = require('_');

var usernames = ["mitchelllillie", "patharryux", "jeffdunn", "donguyen", "mkelley2", "josephfraley2", "kathleenkent", "adamtaitano", "jasonsiren"];
// var usernames = ["jtz1983", "erikphansen"];


usernames.forEach(function(name) {
    $.get('http:/teamtreehouse.com/'+name+'.json').
        done(BadgeGroup);
});

var allUsers = {};

function BadgeGroup (response) {
  var bad = [];
  for (var w in response.badges) {
    bad.push(response.badges[w].id);
  }
  allUsers[response.profile_name] = bad;
  // thisUser.username = response.profile_name;
  // thisUser.badges = [];
  // for (var i = 0; i < badges.length; i++) {
  //   thisUser.badges.push(
  //     {id: (badges[i].id),
  //     name: badges[i].name,
  //     url: badges[i].icon_url
  //     });
// }

  // allUsers.push(thisUser);

  if (allUsers.length >= usernames.length) {
    recommendBadges();
  }
}
console.log(allUsers);

function recommendBadges() {
  //all badges, with ids, srcs, and names
  var allBadgesArray = [];
  //Assemble Array to hold strings of ALL jobs
  for (var prop in allUsers) {
      allBadgesArray = allBadgesArray.concat(allUsers[prop].badges);
      allBadgesArray = _.uniq(allBadgesArray, "id");
  }

  var allBadgeIDs = [];
  for (var q in allBadgesArray) {
    allBadgeIDs.push(allBadgesArray[q].id);
  }

  var allRecs = {};



  // person->uname
  // job->bID
  // testJob->testBadge
  // testPerson->testUser
  // people->group
  // jobs->badges

  for (var student in allUsers) {

      var badgeNeedsArray = _.difference(allBadgesArray, allUsers[student].badges);
      // console.log(allUsers[student].username);
      // console.log(badgeNeedsArray);



      //Create Objects and push into finalArray
      for (var i = 0; i < badgeNeedsArray.length; i++) {
        badgeNeedsArray[i].score = score((badgeNeedsArray[i].id + ""), allUsers[student].username);
      }

  }

        //Sort finalArray by Score Value
       function finalArrayCallback(a,b) {
         if (a.score > b.score) {
           return -1;
         }
         else {
           return 1;
         }
       }
      //  return finalArray.sort(finalArrayCallback);


  function hasBadge(uname,bID) {
    var testBadge;
    var testUser;
    if (typeof uname === "string" && typeof bID === "string") {
      // if string parameters, use var job as is but convert person to property name and then look in that jobs property
      testBadge = bID;
      testBadge = group[uname].badges;
  } else {
      // if object parameters, get the key of the job (provides a string) and look in the person object for the job parameter
      testBadge = bID.bID;
      testUser = uname.badges;
    }
    return (testBadge in testUser);
  }


  function peopleDoing(bID) {
    var peopleArr = [];
    for (var names in allUsers) {
      for (var badg in allUsers[names].badges)
        if (allUsers[names].badges[badg].id === bID) {
          peopleArr.push(allUsers[names]);
        }
    }
    return peopleArr;
  } //--> Array of people-objects


  function badgesDoneBy(uname) {
    var badgeArr = [];
    for (var doneB in uname.badges) {
      jobsArr.push(badges[doneB]);
    }
    return badgeArr;
  }

  function maxLength(strings){
  return strings.sort(function (a, b) { return b.length - a.length; })[0].length;
  }

  function sizeColumns(rowNames, colNames) {
     var arr = [];
     var colMax = maxLength(colNames); //Get Longest Col String
     for (var i = 0; i <= colNames.length; i++) {
       if (i === 0) { //Push longest row length first to array
         arr.push(maxLength(rowNames));
       }
       else { //Remaining items will be longest Col length
         arr.push(colMax);
       }
     }
     return arr;
  }

  function writeRow(colSizes,strings){
    var straw = "";
    function rightPad(str,len){
      var padding = Array(len-str.length +1).join(' ');
      return (str+padding);
    }
    for(var i=0;i<colSizes.length;i++){
      straw += rightPad(strings[i],colSizes[i]);
    }
    return straw;
  }

  /*----------------------------------
  Data processing ====================
  -----------------------------------*/

  function intersectBadges(nameA, nameB) {
    for (var z in allUsers) {
      if (allUsers[z].username === nameA) {
        nA = allUsers[z];
      }
      if (allUsers[z].username === nameB) {
        nB = allUsers[z];
      }
    }
    return (_.intersection([nA].badges), ([nB].badges));
  }

  function similarity(personA, personB) {
    // overload for both strings and objects
    // var pA,
    //     pB;
    // if (typeof personA === "string") {
    //   pA = group[personA];
    // } else {
    //   pA = personA;
    // }
    // if (typeof personB === "string") {
    //   pB = group[personB];
    // } else {
    //   pB = personB;
    // }
    // get intersected jobs
    var intersect = intersectBadges(personA, personB);
    //see whih person has more jobs and divide number of intersected jobs by that amount
    if (allUsers[personA].badges.length > allUsers[personB].badges.length) {
      return intersect.length/allUsers[personA].badges.length;
    } else {
      return intersect.length/allUsers[personB].badges.length;
    }
  }

  function score(bID, uname) {
    var retScore = 0;
    var badgesDoing = peopleDoing(bID);
    //TODO: We are here with an array of people objects
    for (var name in badgesDoing) {
      if (badgesDoing[name].username == uname) {}
      else {
        retScore += similarity(uname, badgesDoing[name].username);
      }
    }
    return retScore;
  }

  // console.log(allUsers);
  printBadges();
}

function printBadges() {

  // for every user:
  for (var user in allUsers) {

    // create a div with class user and ID of username

    var $user = $('<div class="user" id="' + allUsers[user].username + '">').appendTo("body");

    // create a header with the username
    $("<H1>").appendTo($user).html(allUsers[user].username);

    // for every badge earned, append an image to the user's div
    for (var badge in allUsers[user].badgeID) {
      $("<img>", {src: allUsers[user].badgeImg[badge], alt: allUsers[user].badgeName[badge]}).appendTo($user);
    }

    // create new div for recommendations
    var $recDiv = $("<div>", {class: "recommended"});

    // for all recommended badges, add an image if score meets qualifications with class "recommended"
    for (var rec in allUsers[user].recommended) {
      if (allUsers[user].recommended[rec].score > 0.3) {
        $("<img>", {src: allUsers[user].badgeImg[badge], alt: allUsers[user].badgeName[badge]}).appendTo($recDiv);
      }

    }
  }


}

// module.exports = {
//     maxLength:maxLength,
//     sizeColumns:sizeColumns,
//     writeRow:writeRow,
//     writeBadgesTable:writeBadgesTable
//   };
