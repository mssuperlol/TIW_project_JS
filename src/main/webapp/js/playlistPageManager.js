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

    /**
     * AddSongsToPlaylist form controller. If the number of selected songs is greater than 0, calls the AddSongsToPlaylist servlet.
     */
    document.getElementById("add_songs_to_playlist").addEventListener("submit", (e) => {
        e.preventDefault();
        let form = e.target.closest("form");
        let playlistId = sessionStorage.getItem("playlistId");
        let url = "AddSongsToPlaylist?playlistId=" + playlistId;

        //from some reason, just sending the form with makeCall didn't work
        let selectedSongs = form.getElementsByClassName("songCheckbox");

        if (selectedSongs.length !== 0) {
            for (let field of selectedSongs) {
                if (field.checked) {
                    url = url + "&" + field.name + "=on";
                }
            }

            makeCall("POST", url, form, function (req) {
                if (req.readyState === 4) {
                    let message = req.responseText;
                    if (req.status === 200) {
                        document.getElementById("add_songs_to_playlist_result").className = "success";
                        document.getElementById("add_songs_to_playlist_result").textContent = "Brani aggiunti con successo";

                        playlistPageInit(playlistId);
                    } else if (req.status === 403) {
                        window.location.href = req.getResponseHeader("Location");
                        window.sessionStorage.removeItem("user_id");
                    } else {
                        document.getElementById("add_songs_to_playlist_result").className = "error";
                        document.getElementById("add_songs_to_playlist_result").textContent = "Errore: " + message;
                    }
                }
            });
        }
    }, false);
}());

const VISIBLE_SONGS = 5;

/**
 * Initialises playlist page with the given playlist.
 * @param playlistId
 */
playlistPageInit = function (playlistId) {
    sessionStorage.setItem("playlistId", playlistId);

    makeCall("GET", "GetPlaylist?playlistId=" + playlistId, null, function (playlistReq) {
        let currSongsTable = document.getElementById("displayed_songs");
        currSongsTable.innerHTML = "";

        if (playlistReq.readyState === 4) {
            let playlistMessage = playlistReq.responseText;

            if (playlistReq.status === 200) {
                let currPlaylist = JSON.parse(playlistMessage);
                document.getElementById("playlist_title").textContent = currPlaylist.name;
                document.getElementById("playlist_date").textContent = currPlaylist.date;

                document.getElementById("playlist_title_reorder").textContent = currPlaylist.name;

                makeCall("GET", "GetSongsFromPlaylist?playlistId=" + playlistId, null, function (songsReq) {
                    if (songsReq.readyState === 4) {
                        let songsMessage = songsReq.responseText;

                        if (songsReq.status === 200) {
                            let allSongs = JSON.parse(songsMessage);
                            let row, song;

                            //fills songs table for the playlist
                            for (let i = 0; i < allSongs.length / VISIBLE_SONGS; i++) {
                                row = document.createElement("tr");
                                row.id = "s" + i.toString();

                                for (let j = 0; j < VISIBLE_SONGS; j++) {
                                    if (i * VISIBLE_SONGS + j < allSongs.length) {
                                        song = allSongs[i * VISIBLE_SONGS + j];

                                        addSongCell(song, row);
                                    }
                                }

                                currSongsTable.appendChild(row);
                            }

                            //fills the reorder modal
                            let modalTable = document.getElementById("reorder_form").querySelector("table");
                            modalTable.innerHTML = "";
                            let cell;

                            allSongs.forEach(function (song) {
                                row = document.createElement("tr");
                                row.className = "draggable";

                                cell = document.createElement("td");
                                cell.textContent = song.title;
                                cell.id = "r" + song.id;
                                cell.className = "reorder_cell"

                                row.appendChild(cell);

                                modalTable.appendChild(row);
                            });

                            document.getElementById("reorder_button").className = "displayed"

                            showVisibleSongs(0);
                        } else if (songsReq.status === 204) {
                            let text = document.createElement("p");
                            text.textContent = "La playlist corrente non ha nessun brano associato. Usa il form sotto per aggiungerne."
                            currSongsTable.appendChild(text);

                            hideSongsButtons();
                            document.getElementById("reorder_button").className = "masked";
                        } else if (songsReq.status === 403) {
                            window.location.href = songsReq.getResponseHeader("Location");
                            window.sessionStorage.removeItem('user');
                        } else {
                            document.getElementById("playlist_error").textContent = songsMessage;
                            document.getElementById("reorder_error").textContent = songsMessage;
                        }
                    }
                });
            } else if (playlistReq.status === 403) {
                window.location.href = playlistReq.getResponseHeader("Location");
                window.sessionStorage.removeItem('user');
            } else {
                document.getElementById("playlist_error").textContent = playlistMessage;
            }
        }
    });

    makeCall("GET", "GetSongsNotInPlaylist?playlistId=" + playlistId, null, function (req) {
        if (req.readyState === 4) {
            let message = req.responseText;
            let addSongsForm = document.getElementById("add_songs_to_playlist");
            addSongsForm.innerHTML = "";

            if (req.status === 200) {
                let songs = JSON.parse(message);

                if (songs === null || songs.length === 0) {
                    let text = document.createElement("p");
                    text.textContent = "Tutte le tue canzoni sono già presenti nella playlist corrente. Per aggiungerne altre, carica altri brani dalla homepage."
                    addSongsForm.appendChild(text);
                    addSongsForm.textContent = "Tutte le tue canzoni sono già presenti nella playlist corrente. Per aggiungerne altre, carica altri brani dalla homepage.";
                } else {
                    let table, row, titleCell, checkboxCell, checkboxLabel, checkboxInput;

                    table = document.createElement("table");
                    addSongsForm.append(table);

                    songs.forEach(function (song) {
                        row = document.createElement("tr");

                        titleCell = document.createElement("td");
                        titleCell.textContent = song.title;
                        row.appendChild(titleCell);

                        checkboxCell = document.createElement("td");
                        row.appendChild(checkboxCell);

                        checkboxLabel = document.createElement("label");
                        checkboxCell.appendChild(checkboxLabel);

                        checkboxInput = document.createElement("input");
                        checkboxInput.type = "checkbox";
                        checkboxInput.name = "songId" + song.id;
                        checkboxInput.className = "songCheckbox";
                        checkboxLabel.appendChild(checkboxInput);

                        table.append(row);
                    });

                    row = document.createElement("tr");

                    let submitCell = document.createElement("td");
                    row.appendChild(submitCell);

                    let submit = document.createElement("input");
                    submit.type = "submit";
                    submit.value = "Aggiungi brani ->";
                    submitCell.appendChild(submit);

                    submitCell = document.createElement("td");
                    submitCell.className = "error";
                    submitCell.id = "add_songs_to_playlist_result";
                    submitCell.textContent = "";
                    row.appendChild(submitCell);

                    table.appendChild(row);
                }
            } else if (req.status === 204) {
                let text = document.createElement("p");
                text.textContent = "Tutte le tue canzoni sono già presenti nella playlist corrente. Per aggiungerne altre, carica altri brani dalla homepage."
                addSongsForm.appendChild(text);
                addSongsForm.textContent = "Tutte le tue canzoni sono già presenti nella playlist corrente. Per aggiungerne altre, carica altri brani dalla homepage.";
            } else if (req.status === 403) {
                window.location.href = req.getResponseHeader("Location");
                window.sessionStorage.removeItem('user');
            } else {
                document.getElementById("playlist_error").textContent = message;
            }
        }
    });

    showPlaylistPage();
}

/**
 * Adds to the given row, the song's title and image
 * @param song
 * @param row
 */
addSongCell = function (song, row) {
    let songCell, songImage, songId;
    songCell = document.createElement("td");
    songCell.textContent = song.title;

    songCell.appendChild(document.createElement("br"));

    songImage = document.createElement("img");
    songImage.src = song.imageContent;
    songImage.alt = "Foto di " + song.title;
    songImage.height = 200;
    songImage.width = 200;

    songCell.appendChild(songImage);

    //this function was needed to not mess up the onclick event
    songId = song.id;
    songCell.onclick = function () {
        showSongPage(songId);
    }

    row.appendChild(songCell);
}

/**
 * Makes the playlist_page div and homepage_button displayed, while masking the other pages.
 */
showPlaylistPage = function () {
    document.getElementById("main_page").className = "masked";
    document.getElementById("homepage_button").className = "displayed";
    document.getElementById("playlist_page").className = "displayed";
    document.getElementById("song_page").className = "masked";
}

/**
 * Handles the switching between songs in the same playlist.
 * @param songsIndex index of the visible songs. If it's invalid, defaults at 0.
 */
showVisibleSongs = function (songsIndex) {
    let maxRow = 0;

    for (let i = 0; document.getElementById("s" + i.toString()) !== null; i++) {
        maxRow = i;
    }

    if (songsIndex === null || isNaN(songsIndex) || songsIndex < 0 || songsIndex > maxRow) {
        songsIndex = 0;
    }

    sessionStorage.setItem("songsIndex", songsIndex);

    for (let i = 0; i <= maxRow; i++) {
        if (i !== songsIndex) {
            document.getElementById("s" + i.toString()).className = "masked";
        } else {
            document.getElementById("s" + songsIndex).className = "displayed";
        }
    }

    if (songsIndex !== 0) {
        document.getElementById("prev_songs").className = "displayed";
    } else {
        document.getElementById("prev_songs").className = "masked";
    }

    if (songsIndex < maxRow) {
        document.getElementById("next_songs").className = "displayed";
    } else {
        document.getElementById("next_songs").className = "masked";
    }
}

/**
 * If the current playlist doesn't have any songs, hides both button
 */
hideSongsButtons = function () {
    document.getElementById("prev_songs").className = "masked";
    document.getElementById("next_songs").className = "masked";
}