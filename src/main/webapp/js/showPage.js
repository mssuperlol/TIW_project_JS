const VISIBLE_SONGS = 5;

/**
 * Contains functions to switch between the homepage, playlist page and song page.
 * @constructor
 */
function ShowPage() {
    /**
     * Initialises the homepage by calling GetUser and GetGenres servlets, and then calling updatePlaylists, updateCreatePlaylistForm and showHomepage
     */
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

    /**
     * Makes the div main_page visible and masks the other pages and homepage_button
     */
    this.showHomepage = function () {
        document.getElementById("main_page").className = "displayed";
        document.getElementById("homepage_button").className = "masked";
        document.getElementById("playlist_page").className = "masked";
        document.getElementById("song_page").className = "masked";
        document.getElementById("reorder_page").className = "masked";
    }

    /**
     * Initialises playlist page with the given playlist.
     * @param playlistId
     */
    this.playlistPageInit = function (playlistId) {
        let self = this;
        makeCall("GET", "GetPlaylist?playlistId=" + playlistId, null, function (playlistReq) {
            if (playlistReq.readyState === 4) {
                let playlistMessage = playlistReq.responseText;

                if (playlistReq.status === 200) {
                    let currPlaylist = JSON.parse(playlistMessage);
                    document.getElementById("playlist_title").textContent = currPlaylist.name;
                    document.getElementById("playlist_date").textContent = currPlaylist.date;

                    makeCall("GET", "GetSongsFromPlaylist?playlistId=" + playlistId, null, function (songsReq) {
                        if (songsReq.readyState === 4) {
                            let songsMessage = songsReq.responseText;

                            if (songsReq.status === 200) {
                                let allSongs = JSON.parse(songsMessage);
                                let currSongsTable = document.getElementById("displayed_songs");
                                let row, song;

                                currSongsTable.innerHTML = "";

                                for (let i = 0; i < allSongs.length / VISIBLE_SONGS; i++) {
                                    row = document.createElement("tr");
                                    row.id = i.toString();

                                    for (let j = 0; j < VISIBLE_SONGS; j++) {
                                        if (i * VISIBLE_SONGS + j < allSongs.length) {
                                            song = allSongs[i * VISIBLE_SONGS + j];

                                            self.addSongCell(song, row);
                                        }
                                    }

                                    currSongsTable.appendChild(row);
                                }

                                self.showVisibleSongs(0);
                            }
                        }
                    });
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

                        //this should be moved to formsChecker.js for consistency, but it's probably better to leave this here since it needs playlistId to work
                        addSongsForm.addEventListener('submit', function check(e) {
                            e.preventDefault();
                            let form = e.target.closest("form");
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

                                            let showPage = new ShowPage();
                                            showPage.playlistPageInit(playlistId);
                                        } else if (req.status === 403) {
                                            window.location.href = req.getResponseHeader("Location");
                                            window.sessionStorage.removeItem('user_id');
                                        } else {
                                            document.getElementById("add_songs_to_playlist_result").className = "error";
                                            document.getElementById("add_songs_to_playlist_result").textContent = "Errore: " + message;
                                        }
                                    }
                                });
                            }
                        });
                    }
                } else if (req.status === 204) {
                    let text = document.createElement("p");
                    text.textContent = "Tutte le tue canzoni sono già presenti nella playlist corrente. Per aggiungerne altre, carica altri brani dalla homepage."
                    addSongsForm.appendChild(text);
                    addSongsForm.textContent = "Tutte le tue canzoni sono già presenti nella playlist corrente. Per aggiungerne altre, carica altri brani dalla homepage.";
                }
            }
        });

        this.showPlaylistPage();
    }

    /**
     * Adds to the given row, the song's title and image
     * @param song
     * @param row
     */
    this.addSongCell = function (song, row) {
        let self = this;
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
            self.showSongPage(songId);
        }

        row.appendChild(songCell);
    }

    /**
     * Makes the playlist_page div and homepage_button displayed, while masking the other pages.
     */
    this.showPlaylistPage = function () {
        document.getElementById("main_page").className = "masked";
        document.getElementById("homepage_button").className = "displayed";
        document.getElementById("playlist_page").className = "displayed";
        document.getElementById("song_page").className = "masked";
        document.getElementById("reorder_page").className = "masked";
    }

    /**
     * Handles the switching between songs in the same playlist.
     * @param songsIndex index of the visible songs. If it's invalid, defaults at 0.
     */
    this.showVisibleSongs = function (songsIndex) {
        let maxRow = 0;

        for (let i = 0; document.getElementById(i.toString()) !== null; i++) {
            maxRow = i;
        }

        if (songsIndex === null || isNaN(songsIndex) || songsIndex < 0 || songsIndex > maxRow) {
            songsIndex = 0;
        }

        for (let i = 0; i <= maxRow; i++) {
            if (i !== songsIndex) {
                document.getElementById(i.toString()).className = "masked";
            } else {
                document.getElementById(songsIndex).className = "displayed";
            }
        }

        if (songsIndex !== 0) {
            document.getElementById("prev_songs").className = "displayed";
            document.getElementById("prev_songs").addEventListener("click", (e) => {
                e.preventDefault();
                this.showVisibleSongs(songsIndex - 1);
            });
        } else {
            document.getElementById("prev_songs").className = "masked";
        }

        if (songsIndex < maxRow) {
            document.getElementById("next_songs").className = "displayed";
            document.getElementById("next_songs").addEventListener("click", (e) => {
                e.preventDefault();
                this.showVisibleSongs(songsIndex + 1);
            });
        } else {
            document.getElementById("next_songs").className = "masked";
        }
    }

    /**
     * Initialises the song page with the given song, by making a call to the GetSong servlet
     * @param songId
     */
    this.showSongPage = function (songId) {
        let self = this;
        document.getElementById("main_page").className = "masked";
        document.getElementById("homepage_button").className = "displayed";
        document.getElementById("playlist_page").className = "masked";
        document.getElementById("song_page").className = "displayed";
        document.getElementById("reorder_page").className = "masked";
        document.getElementById("return_to_playlist").onclick = function () {
            self.showPlaylistPage();
        }

        makeCall("GET", "GetSong?songId=" + songId, null, function (req) {
            if (req.readyState === 4) {
                let message = req.responseText;
                if (req.status === 200) {
                    let song = JSON.parse(message);
                    document.getElementById("song_title").textContent = song.title;
                    document.getElementById("song_image").src = song.imageContent;
                    //TODO fix song_player not working
                    document.getElementById("song_player").src = song.songContent;
                    document.getElementById("album_title").textContent = song.album_title;
                    document.getElementById("song_performer").textContent = song.performer;
                    document.getElementById("song_year").textContent = song.year;
                    document.getElementById("song_genre").textContent = song.genre;
                } else {
                    document.getElementById("song_title").textContent = "Errore: " + message;
                }
            }
        });
    }

    /**
     * TODO
     */
    this.showReorderPage = function (playlistId) {
        document.getElementById("main_page").className = "masked";
        document.getElementById("homepage_button").className = "displayed";
        document.getElementById("playlist_page").className = "masked";
        document.getElementById("song_page").className = "masked";
        document.getElementById("reorder_page").className = "displayed";

        makeCall("GET", "GetSongsFromPlaylist?playlistId=" + playlistId, null, function (req) {
            if (req.readyState === 4) {
                let message = req.responseText;
                if (req.status === 200) {
                    let allSongs = JSON.parse(message);
                    let reorderForm = document.getElementById("reorder_form");
                    let table = reorderForm.querySelector("table");
                    table.innerHTML = "";
                    let row, cell;

                    allSongs.forEach(function (song) {
                        row = document.createElement("tr");

                        cell = document.createElement("td");
                        cell.textContent = song.title;
                        cell.id = song.id;
                        cell.className = "reorder_cell"

                        row.appendChild(cell);

                        table.appendChild(row);
                    });

                    let submit = document.getElementById("reorder_submit");
                    submit.addEventListener('submit', function check(e) {
                        e.preventDefault();
                        let form = e.target.closest('form');
                        //TODO
                        let url = "TODO?playlistId=" + playlistId;

                        let reorderedSongs = form.getElementsByClassName("reorder_cell");
                        let i = 0;

                        for (let row of reorderedSongs) {
                            url = url + "&" + row.id + "=" + i;
                            i++;
                        }

                        makeCall("POST", url, form, function (req) {
                            //TODO
                        });
                    });
                }
            }
        });
    }

    /**
     * Calls the GetPlaylists servlet to update the list of playlists at the beginning of the homepage
     */
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

                            //calls playlistPageInit on the clicked playlist
                            playlistLink.onclick = function () {
                                self.playlistPageInit(playlist.id);
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

    /**
     * Calls the GetSongsByUserID servlet to update the form to create a new playlist in the homepage with the current user's songs
     */
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
                        checkboxInput.className = "playlistCheckbox";
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
