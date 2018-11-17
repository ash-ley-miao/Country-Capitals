var database;
var data;
var pairs;

$( document ).ready(function() {
  var database = firebase.database();
  $.ajax({
        type: "GET",
        url: "https://s3.ap-northeast-2.amazonaws.com/cs374-csv/country_capital_pairs.csv",
        dataType: "text",
        success: function(data) {processData(data);}
  });
  window.onload = newCountry();
  window.onload = getHistory();
  document.getElementById("pr2__submit").onclick = function() {
    addEntry(country_number[0]);
    newCountry(country_number);
    checkFilters();
  }
  document.getElementById("pr3__clear").onclick = function() {
    firebase.database().ref('player-answers').remove();
    var listings = document.getElementsByClassName('listings');
    while (listings[0]) {
      listings[0].parentNode.removeChild(listings[0]);
    }
  }
});

//Enter keypress
$("#pr2__answer").keypress(e => {
  if (e.which == 13) {
    $("#pr2__submit").trigger("click");
    return false;
  }
});

//Store countries and capitals in array
function processData(allText) {
  var allTextLines = allText.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');
  pairs = [];

  for (var i=1; i<allTextLines.length; i++) {
    var data = allTextLines[i].split(',');
    if (data.length == headers.length) {
      var tarr = {};
      tarr.country = data[0];
      tarr.capital = data[1];
      pairs.push(tarr);
    }
  }
}

//Generate new country
var country_number = [0];
function newCountry(number) {
  randomNumber = Math.floor(Math.random() * 170);
  country_number[0] = randomNumber;
  document.getElementById("pr2__question").innerHTML = pairs[randomNumber].country;
}

//Autocomplete
$(function() {
  var country_capitals = [];
  for (var i = 0; i <= 170; i++) {
    var ithCapital = pairs[i].capital;
    country_capitals.push(ithCapital);
  }
  var normalize = function( term ) {
    var ret = "";
    for (var i = 0; i < term.length; i++) {
      ret += term.charAt(i);
    }
    return ret;
  };
  $("#pr2__answer").autocomplete({
    source: function( request, response ) {
      var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" ); 
      response( $.grep( country_capitals, function( value ) {
        value = value.label || value.value || value;
        return matcher.test( value ) || matcher.test( normalize( value ) );
      }) );
    }
  });
});

//Add entry to table and store in Firebase
function addEntry(number) {
  var correctAnswer = false;
  var correctCapital = pairs[number].capital;
  var promptCountry = pairs[number].country;
  var playerInput = document.getElementById("pr2__answer").value;
  if (playerInput == pairs[number].capital) {
     correctAnswer = true;
  }
  data = {
    country: promptCountry,
    inputCapital: playerInput,
    isCorrect: correctAnswer,
    correctCapital: correctCapital,
  }
  var ref = database.ref('player-answers');
  ref.push(data);

  var table = document.getElementById("game-table");
  var row = table.insertRow(4);
  var country = row.insertCell(0);
  var playerAnswer = row.insertCell(1);
  var answerResult = row.insertCell(2);
  country.innerHTML = promptCountry;
  playerAnswer.innerHTML = playerInput;
  if (correctAnswer) {
    row.className += "correct-entry listings";
    answerResult.innerHTML = '<i class="fa fa-check"></i> <input type="button" value="Delete">';
  }
  else {
    row.className += "incorrect-entry listings";
    answerResult.innerHTML = correctCapital + '<input type="button" value="Delete">';
  }

  document.getElementById("pr2__answer").value = ""; //Clear pr2__answer
}

function getHistory() {
  var table = document.getElementById("game-table");
  var leadsRef = database.ref('player-answers');
  leadsRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        var countryRef = childData.country;
        var capitalRef = childData.inputCapital;
        var isCorrectRef = childData.isCorrect;
        var correctCapital = childData.correctCapital;
        console.log(childData, countryRef, capitalRef, isCorrectRef, correctCapital);

        var row = table.insertRow(4);
        var country = row.insertCell(0);
        var playerAnswer = row.insertCell(1);
        var answerResult = row.insertCell(2);
        country.innerHTML = countryRef;
        playerAnswer.innerHTML = capitalRef;

        if (isCorrectRef) {
          row.className += "correct-entry listings";
          answerResult.innerHTML = '<i class="fa fa-check"></i> <input type="button" value="Delete">';
        }
        else {
          row.className += "incorrect-entry listings";
          answerResult.innerHTML = correctCapital + '<input type="button" value="Delete">';
        }
      });
  });
}

//Removing a row in the table
$("#game-table").on("click", "input[type='button'][value='Delete']",
function (e) {
  e.preventDefault();
  $(this).closest('tr').remove();
});

//Filtering past answers
function checkFilters() {
  var arrCorrectAnswers = document.getElementsByClassName('correct-entry');
  var lengthCorrectAnswers = arrCorrectAnswers.length;

  var arrWrongAnswers = document.getElementsByClassName('incorrect-entry');
  var lengthWrongAnswers = arrWrongAnswers.length;

  if (document.getElementById('correct').checked) {
    for (var i=0; i < lengthWrongAnswers; i++) {
      arrWrongAnswers[i].style.display = 'none';
    }
    for (var i=0; i < lengthCorrectAnswers; i++) {
      arrCorrectAnswers[i].style.display = 'table-row';
    }
  }
  else if (document.getElementById('wrong').checked) {
    for (var i=0; i < lengthCorrectAnswers; i++) {
      arrCorrectAnswers[i].style.display = 'none';
    }
    for (var i=0; i < lengthWrongAnswers; i++) {
      arrWrongAnswers[i].style.display = 'table-row';
    }
  }
  else {
    for (var i=0; i < lengthCorrectAnswers; i++) {
      arrCorrectAnswers[i].style.display = 'table-row';
    }
    for (var i=0; i < lengthWrongAnswers; i++) {
      arrWrongAnswers[i].style.display = 'table-row';
    }
  }
}
