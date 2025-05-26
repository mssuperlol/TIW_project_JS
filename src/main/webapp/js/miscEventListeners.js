(function () {
    document.getElementById("prev_songs").addEventListener("click", (e) => {
        e.preventDefault();
        let songsIndex = sessionStorage.getItem("songsIndex");
        showVisibleSongs(Number(songsIndex) - 1);
    });

    document.getElementById("next_songs").addEventListener("click", (e) => {
        e.preventDefault();
        let songsIndex = sessionStorage.getItem("songsIndex");
        showVisibleSongs(Number(songsIndex) + 1);
    });

    document.getElementById("abort_reorder").addEventListener("click", (e) => {
        e.preventDefault();
        showPlaylistPage();
    });

    document.getElementById("return_to_playlist").addEventListener("click", (e) => {
        e.preventDefault();
        showPlaylistPage();
    });

    document.getElementById("reorder_button").addEventListener("click", (e) => {
        e.preventDefault();
        let playlistId = sessionStorage.getItem("playlistId");
        showReorderPage(playlistId);
    });
}());