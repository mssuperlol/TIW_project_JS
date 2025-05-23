let VISIBLE_SONGS = 5;

function ShowPage() {
    this.showHomepage = function () {
        document.getElementById("main_page").className = "displayed";
        document.getElementById("homepage_button").className = "masked";
        document.getElementById("playlist_page").className = "masked";
        document.getElementById("song_page").className = "masked";

    this.homepageInit = function () {
        makeCall("GET", "GetUser", null, function (req) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    let user = JSON.parse(req.responseText);
                    document.getElementById("name").textContent = user.name;
                    document.getElementById("surname").textContent = user.surname;
                } else {
                    window.location.href = req.getResponseHeader("Location");
                    window.sessionStorage.removeItem('user');
                }
            }
        });

        this.updatePlaylists();
        this.updateCreatePlaylistForm();

        makeCall("GET", "GetGenres", null, function (req) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    let genres = JSON.parse(req.responseText);
                    let genreChoiceMenu = document.getElementById("genre");
                    let option;

                    genres.forEach(function (genre) {
                        option = document.createElement("option");
                        option.value = genre;
                        option.textContent = genre;
                        genreChoiceMenu.appendChild(option);
                    });
                } else {
                    window.location.href = req.getResponseHeader("Location");
                    window.sessionStorage.removeItem('user');
                }
            }
        });

        this.updatePlaylists();
        this.updateCreatePlaylistForm();
        this.showHomepage();
    }

    this.showHomepage = function () {
        document.getElementById("main_page").className = "displayed";
        document.getElementById("homepage_button").className = "masked";
        document.getElementById("playlist_page").className = "masked";
        document.getElementById("song_page").className = "masked";
    }
    this.showPlaylistPage = function (playlistId) {
        this.showPlaylistPage(playlistId, 0);
    }

    this.showPlaylistPage = function (playlistId, songsIndex) {
        let self = this;
        document.getElementById("main_page").className = "masked";
        document.getElementById("homepage_button").className = "displayed";
        document.getElementById("playlist_page").className = "displayed";
        document.getElementById("song_page").className = "masked";

        makeCall("GET", "GetFullPlaylist?playlistId=" + playlistId, null, function (req) {
            if (req.readyState === 4) {
                let message = req.responseText;

                if (req.status === 200) {
                    let currPlaylist = JSON.parse(message);
                    document.getElementById("playlist_title").textContent = currPlaylist.name;
                    document.getElementById("playlist_date").textContent = currPlaylist.date;

                    let allSongs = currPlaylist.songs;
                    let currSongsTable = document.getElementById("displayed_songs");
                    let song, songCell, songImage;

                    currSongsTable.innerHTML = "";

                    if (songsIndex === null || isNaN(songsIndex) || songsIndex < 0 || songsIndex * VISIBLE_SONGS > allSongs.length) {
                        songsIndex = 0;
                    }

                    for (let i = 0; i + songsIndex * VISIBLE_SONGS < allSongs.length && i < VISIBLE_SONGS; i++) {
                        song = allSongs[i + songsIndex * VISIBLE_SONGS];
                        songCell = document.createElement("td");
                        songCell.textContent = song.title;
                        //TODO songImage

                        currSongsTable.appendChild(songCell);
                    }

                    if (songsIndex !== 0) {
                        document.getElementById("prev_songs").className = "displayed";
                        document.getElementById("prev_songs").addEventListener("click", (e) => {
                            e.preventDefault();
                            self.showPlaylistPage(playlistId, songsIndex - 1);
                        });
                    } else {
                        document.getElementById("prev_songs").className = "masked";
                    }

                    if ((songsIndex + 1) * VISIBLE_SONGS < allSongs.length) {
                        document.getElementById("next_songs").className = "displayed";
                        document.getElementById("next_songs").addEventListener("click", (e) => {
                            e.preventDefault();
                            self.showPlaylistPage(playlistId, songsIndex + 1);
                        });
                    } else {
                        document.getElementById("next_songs").className = "masked";
                    }
                }
            }
        });
    }

    this.showSongPage = function () {
        document.getElementById("main_page").className = "masked";
        document.getElementById("homepage_button").className = "displayed";
        document.getElementById("playlist_page").className = "masked";
        document.getElementById("song_page").className = "displayed";

        //TODO implement songPage
    }

    this.updatePlaylists = function () {
        let self = this;

        makeCall("GET", "GetPlaylists", null, function (req) {
            if (req.readyState === 4) {
                let message = req.responseText;
                let playlistList = document.getElementById("playlists_list");
                playlistList.innerHTML = "";

                if (req.status === 200) {
                    let playlistsToShow = JSON.parse(message);

                    if (playlistsToShow === null || playlistsToShow.length === 0) {
                        let text = document.createElement("p");
                        text.textContent = "Non sono state trovate playlist per questo utente. Per creare una nuova playlist, usa il form sotto.";
                        playlistList.appendChild(text);
                    } else {
                        let row, nameCell, playlistLink, dateCell, table, tbody, thead, th;

                        table = document.createElement("table");
                        table.className = "playlist_table";
                        document.getElementById("playlists_list").appendChild(table);

                        thead = document.createElement("thead");
                        th = document.createElement("th");
                        th.textContent = "Nome";
                        thead.appendChild(th);
                        th = document.createElement("th");
                        th.textContent = "Data creazione";
                        thead.appendChild(th);
                        table.appendChild(thead);

                        tbody = document.createElement("tbody");
                        table.appendChild(tbody);

                        playlistsToShow.forEach(function (playlist) {
                            row = document.createElement("tr");

                            nameCell = document.createElement("td");
                            row.appendChild(nameCell);

                            playlistLink = document.createElement("a");
                            playlistLink.textContent = playlist.name;
                            //TODO find a way to make the name of the playlist look like links without fucking everything up
                            //playlistLink.href = "";
                            nameCell.appendChild(playlistLink);

                            //calls showPlaylistPage on the clicked playlist
                            playlistLink.onclick = function () {
                                self.showPlaylistPage(playlist.id);
                            }

                            dateCell = document.createElement("td");
                            dateCell.textContent = playlist.date;
                            row.appendChild(dateCell);

                            tbody.appendChild(row);
                        });
                    }
                } else if (req.status === 403) {
                    window.location.href = req.getResponseHeader("Location");
                    window.sessionStorage.removeItem('user');
                } else {
                    let text = document.createElement("p");
                    text.textContent = message;
                    playlistList.appendChild(text);
                }
            }
        });
    }

    this.updateCreatePlaylistForm = function () {
        makeCall("GET", "GetSongsByUserID", null, function (req) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    let songs = JSON.parse(req.responseText);
                    let songsCheckbox = document.getElementById("create_playlist_table");
                    //to reset the table when the function is called more than once
                    songsCheckbox.innerHTML =
                        "<tr>\n" +
                        "  <td>Titolo:</td>\n" +
                        "  <td><label>\n" +
                        "    <input type=\"text\" name=\"title\" maxlength=\"64\">\n" +
                        "  </label></td>\n" +
                        "</tr>";
                    let row, titleCell, checkboxCell, checkboxLabel, checkboxInput;

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
                        checkboxLabel.appendChild(checkboxInput);

                        songsCheckbox.append(row);
                    });

                    row = document.createElement("tr");

                    let submitCell = document.createElement("td");
                    row.appendChild(submitCell);

                    let submit = document.createElement("input");
                    submit.type = "submit";
                    submit.value = "Crea playlist ->";
                    submitCell.appendChild(submit);

                    submitCell = document.createElement("td");
                    submitCell.className = "error";
                    submitCell.id = "create_playlist_result";
                    submitCell.textContent = "";
                    row.appendChild(submitCell);

                    songsCheckbox.appendChild(row);
                } else {
                    window.location.href = req.getResponseHeader("Location");
                    window.sessionStorage.removeItem('user');
                }
            }
        });
    }
}
