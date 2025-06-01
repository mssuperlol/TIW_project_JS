(function () {
    document.getElementById("return_to_playlist").addEventListener("click", (e) => {
        e.preventDefault();
        showPlaylistPage();
    });
}());

/**
 * Initialises the song page with the given song, by making a call to the GetSong servlet
 * @param songId
 */
showSongPage = function (songId) {
    document.getElementById("main_page").className = "masked";
    document.getElementById("homepage_button").className = "displayed";
    document.getElementById("playlist_page").className = "masked";
    document.getElementById("song_page").className = "displayed";

    makeCall("GET", "GetSong?songId=" + songId, null, function (req) {
        if (req.readyState === 4) {
            let message = req.responseText;
            if (req.status === 200) {
                let song = JSON.parse(message);
                document.getElementById("song_title").textContent = song.title;
                document.getElementById("song_image").src = song.imageContent;
                document.getElementById("song_player").type = "audio/mpeg";
                document.getElementById("song_player").controls = "controls";
                document.getElementById("song_player").src = song.songContent;
                document.getElementById("album_title").textContent = song.album_title;
                document.getElementById("song_performer").textContent = song.performer;
                document.getElementById("song_year").textContent = song.year;
                document.getElementById("song_genre").textContent = song.genre;
            } else if (req.status === 403) {
                window.location.href = req.getResponseHeader("Location");
                window.sessionStorage.removeItem('user');
            } else {
                document.getElementById("song_title").textContent = "Errore: " + message;
            }
        }
    });
}