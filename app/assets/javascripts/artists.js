// apps/assets/javascript/artists.js
// loaded every artist index/show? Yes.

// innerHTML sometimes shows some funny shit around text
// Ah, has to do with actual HTML format,
//  new line in HTML after > shows return sign,
//  keep text jammed between >< to let innerHTML show pure text

// Document ready, bind events
$(function() {
  // short for $.( document ).ready(function () {});
  myLog("Artists document ready, let's get started ...");

  // bind events
  myLog("Binding events ...");
  $("#song-delete-all").bind('click', deleteAllSongsClick);
  $(".song-delete").bind('click', deleteSongClick);
  $("#add-song").bind('click', addSongClick);
  myLog("Binding events done");
});

function myLog(message) {
  // Make it possible to get multiple arguments, like console.log
  let logging = true; // make false to stop logging
  if (logging) { console.log(message) };
}
// Event bound functions
function deleteAllSongsClick(event) {
  // Delete all songs
  // - Ask confirmation
  myLog("Delete all songs clicked, ask confirmation");
  let deleteFlag = confirm("Delete all songs?");
  if (deleteFlag) {
    let artistId = getArtistId();
    let songId = "";
    let totalCount = 0;
    let doneCount = 0;
    $(".song-delete").each(function(index, element) {
      songId = element.id.replace("song-delete-", "");
      totalCount = totalCount + 1;
      myLog("Call deleteSong with " + artistId +", " + songId);
      if (deleteSong(artistId, songId, false)) {
        $.when($("#song-" + songId).remove())
          .then(myLog("Song removed"));
        doneCount = doneCount + 1;
      };
    });
    myLog("Total " + totalCount.toString() + " : deleted " + doneCount.toString());
  };
};

function deleteSongClick(event) {
  myLog("Delete song clicked");

  let artistId = getArtistId();

  // Determine songId from <a>.id
  let songId = this.id.replace("song-delete-", "");
  // Determine rowId from <a>.id
  let rowId = this.id.replace("delete-", "");

  if (deleteSong(artistId, songId, true)) {
    // Yes, what?!
  }
};

function deleteSong(artistId, songId, confirmDelete = true) {
  // Delete a song
  // Ask confirmation if confirm true
  let deleteFlag = true;
  let consoleText = "#" + artistId + "-" + songId;
  if (confirmDelete === false) {
    myLog("Delete song " + consoleText + " from deleteAllSongs");
  } else {
    myLog("Delete song " + consoleText + " ask confirmation");
    deleteFlag = confirm("Do you want to delete this song?");
  }
  if (deleteFlag) {
    if (deleteSongApiCall(artistId, songId)) {;
      myLog("deleteSongApiCall returned true");
      // Moved to apiCall.done() because of asynchronicity  :
      // removeSongFromTable(songId);
    } else {
      myLog("deleteSongApiCall() returned false");
    }
  }
  return deleteFlag;
};

function addSongClick(event) {
  // Add a song
  // - check for empty
  // - add row to table
  myLog("Add song clicked");
  let title = $("#new-title").val();
  if (title == "") {
    myLog("- Title is empty")
  } else {
    myLog("- Title :", title);
    let songId = addSong(title);
    if (songId > "") {
      $("#new-title").val(null);
    }
  }
};


function addSong(title) {
  let artistId = getArtistId();
  let newSongId = addSongApiCall(artistId, title);
  if (newSongId > "") {
    addSongToTable(artistId, newSongId, title)
  };
  return newSongId;
};


// !! CHECK TODOS.JS for AJAX requests !!
// API call delete (DELETE)
// API call resulting in succes will not give us much?
// curl -i -H "Accept: application/json"
//  -H "Content-type: application/json"
//  -X DELETE
//  http://localhost:3000/api/songs/1
// => {"message":"Song successfully deleted"}
function deleteSongApiCall(artistId, songId) {
  // let apiCall = '-i '+
  //   ' -H "Accept: application/json"' +
  //   ' -H "Content-type: application/json"' +
  //   ' -X DELETE' +
  //   ' /songs/' + songId;

  // DON'T WORK :
  // url: "/songs/" + songId + ".json",
  // url: "/songs/" + songId,
  // url: "/artists/" + artistId + "/songs/" + songId + ".json",

  // I thought this construct would not return untill request
  //   was sent and handled, but action after calling this function
  //  in calling procedure is before this is executed before the code in .done()
  // It will return immediately,
  //   and makes sure code in .done() runs if successfull
  // So any screen updates within .done() part, not very SRP
  let deleteFlag = false ;
  myLog("Sending AJAX request to delete ...");
  $.ajax({
      type: "DELETE",
      url: "/api/songs/" + songId,
      contentType: "application/json",
      dataType: "json"
    })
    .done(function(data) {
      removeSongFromTable(songId);
      deleteFlag = true;
    })
    .fail(function(error) {
      deleteFlag = false;
    });
  return deleteFlag ;
}


// !! CHECK TODOS.JS for AJAX requests !!
// API call add (POST), check for string delimiters ( '  "  )
// What happens if we put quotes in values?
// curl -i -H "Accept: application/json"
//  -H "Content-type: application/json"
//  -d '{"title":"New song"}'
//  -X POST
//  http://localhost:3000/api/songs
// => ?? Does not work :-(
function addSongApiCall(artistId, title) {
  let songId = "";
  // Build data string, 1 field is not very complicated :-)
  let apiData = "'" + '{"title":"' + title + '"}' + "'";
  let apiCall = '-i' +
    ' -H "Accept: application/json"' +
    ' -H "Content-type: application/json"' +
    ' -d ' + apiData +
    ' -X POST' +
    ' http://localhost:3000/api/songs';

  // API call resulting in succes will give songId
  songId = Math.floor(Math.random() * 100).toString();

  var newSong = { title: title };

  return songId;
};

function createTodo(title) {
  var newTodo = {
    title: title,
    completed: false
  };

  $.ajax({
      type: "POST",
      url: "/todos.json",
      data: JSON.stringify({
        todo: newTodo
      }),
      contentType: "application/json",
      dataType: "json"
    })
    .done(function(data) {
      console.log(data);

      var checkboxId = data.id;

      var label = $('<label></label>')
        .attr('for', checkboxId)
        .html(title);

      var checkbox = $('<input type="checkbox" value="1" />')
        .attr('id', checkboxId)
        .bind('change', toggleDone);

      var tableRow = $('<tr class="todo"></td>')
        .attr('data-id', checkboxId)
        .append($('<td>').append(checkbox))
        .append($('<td>').append(label));

      $("#todoList").append(tableRow);

      updateCounters();
    })

    .fail(function(error) {
      console.log(error)
      error_message = error.responseJSON.title[0];
      showError(error_message);
    });
}


// <table> manipulation
function removeSongFromTable(songId) {
  $.when($("#song-" + songId).remove())
    .then(myLog("Song removed from <table>"));
}

function addSongToTable(artistId, songId, title) {
  myLog("Adding song", "(#" + artistId + "-" + songId + ")", title, "to <table>");

  let tableRow = $("<tr></tr>");

  let rowDetail1 = $("<td></td>");
  rowDetail1.attr("id", "song-" + songId);
  rowDetail1.addClass("song");
  rowDetail1.addClass("new-song");
  rowDetail1.html(title);

  let rowDetail2 = $("<td></td>");
  rowDetail2.html("#" + artistId + "-" + songId);

  let rowDet3Anchor = $("<a></a>");
  rowDet3Anchor.attr("href", "");
  rowDet3Anchor.attr("id", "song-delete-" + songId);
  rowDet3Anchor.addClass("song-delete");
  rowDet3Anchor.addClass("btn");
  rowDet3Anchor.addClass("btn-warning");
  rowDet3Anchor.html("Delete");
  rowDet3Anchor.bind("click", deleteSongClick);

  let rowDetail3 = $("<td></td>");
  rowDetail3.addClass("text-center");
  rowDetail3.append(rowDet3Anchor);

  tableRow.append(rowDetail1);
  tableRow.append(rowDetail2);
  tableRow.append(rowDetail3);

  $("#song-table").append(tableRow);
};

function getArtistId() {
  // Get artist from hidden input
  return $("#artistId").val();
}

// old stuff
function consoleLogSongs() {
  // <td id="song-<%= song.id %>" class="song">
  let songs = $(".song");
  let songCount = songs.length;
  myLog(songCount.toString() + ' songs found')
  songs.each(function(index, element) {
    myLog(element.innerHTML)
  });
};
