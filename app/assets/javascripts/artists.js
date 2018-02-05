// OK, ready for code sniffing

// Document ready, bind events
$(function() {
  $("#song-delete-all").bind('click', deleteAllSongsClick);
  $(".song-delete").bind('click', deleteSongClick);
  $("#add-song").bind('click', addSongClick);
});


// Event bound functions
function deleteAllSongsClick(event) {
  if (confirm("Delete all songs?")) {
    $(".song-delete").each(function(index, element) {
      deleteSong(getArtistId(), element.id.replace("song-delete-", ""), false);
    });
  };
};

function deleteSongClick(event) {
  deleteSong(getArtistId(), this.id.replace("song-delete-", ""));
};

function addSongClick(event) {
  let title = $("#new-title").val();
  if (title == "") {
    myLog("- Title is empty")
  } else {
    myLog("- Title :", title);
    addSong(getArtistId(), title);
  }
};


// Perform requested actions
function deleteSong(artistId, songId, confirmDelete = true) {
  if ( !confirmDelete || (confirm("Do you want to delete this song?")) ) {
    deleteSongApiCall(artistId, songId);
    $("#song-" + songId).remove();
  }
};

function addSong(artistId, title) {
  addSongApiCall(artistId, title);
};


// API-calls
function deleteSongApiCall(artistId, songId) {
  $.ajax({
      type: "DELETE",
      url: "/api/artists/" + artistId + "/songs/" + songId,
      contentType: "application/json",
      dataType: "json"
  })
  .done(function(data) {
    removeSongFromTable(songId);
  });
}


function addSongApiCall(artistId, title) {
  $.ajax({
      type: "POST",
      url: "/api/artists/" + artistId + "/songs.json",
      data: JSON.stringify({
        title: title
      }),
      contentType: "application/json",
      dataType: "json"
    })
    .done(function(data) {
      addSongToTable(artistId, data.song.id, title);
      $("#new-title").val(null);
    });
};


// <table> manipulation
function removeSongFromTable(songId) {
  $("#song-" + songId).remove();
}

function addSongToTable(artistId, songId, title) {
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
  return $("#artist").val();
}
