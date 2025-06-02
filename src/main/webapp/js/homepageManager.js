const maxDimension = 256;

(function () {
    /**
     * UploadSong form controller. Checks if all the inputted values are valid: if so, the calls the UploadSong servlet; otherwise, clears the invalid values and displays an error. If the song is uploaded correctly, also updates the createPlaylist form with the new value.
     */
    document.getElementById("upload_song_form").addEventListener("submit", function check(e) {
        e.preventDefault();
        let success = true;
        let form = e.target.closest("form");

        if (form.title.value === null || form.title.value === "") {
            document.getElementById("title_error").textContent = "Il titolo della canzone non può essere vuoto";
            success = false;
        } else if (form.title.value.length > maxDimension) {
            document.getElementById("title_error").textContent = "Dimensione massima: " + maxDimension;
            success = false;
        } else {
            document.getElementById("title_error").textContent = "";
        }
        if (form.album_title.value === null || form.album_title.value === "") {
            document.getElementById("album_error").textContent = "Il titolo dell'album non può essere vuoto";
            success = false;
        } else if (form.album_title.value.length > maxDimension) {
            document.getElementById("album_error").textContent = "Dimensione massima: " + maxDimension;
            success = false;
        } else {
            document.getElementById("album_error").textContent = "";
        }
        if (form.performer.value === null || form.performer.value === "") {
            document.getElementById("performer_error").textContent = "L'interprete non può essere vuoto";
            success = false;
        } else if (form.performer.value.length > maxDimension) {
            document.getElementById("performer_error").textContent = "Dimensione massima: " + maxDimension;
            success = false;
        } else {
            document.getElementById("performer_error").textContent = "";
        }
        if (form.year.value === null || form.year.value === "") {
            document.getElementById("year_error").textContent = "L'anno non può essere vuoto";
            success = false;
        } else if (form.year.value <= 0) {
            this.year.value = "";
            document.getElementById("year_error").textContent = "L'anno deve essere positivo";
            success = false;
        } else if (form.year.value > new Date().getFullYear()) {
            this.year.value = "";
            document.getElementById("year_error").textContent = "L'anno non può essere nel futuro";
            success = false;
        } else {
            document.getElementById("year_error").textContent = "";
        }
        if (form.genre.value === null || form.genre.value === "") {
            document.getElementById("genre_error").textContent = "Il genere non può essere vuoto";
            success = false;
        } else {
            document.getElementById("genre_error").textContent = "";
        }
        if (form.music_file.value === null || form.music_file.value === "") {
            document.getElementById("music_file_error").textContent = "File musicale mancante";
            success = false;
        } else {
            document.getElementById("music_file_error").textContent = "";
        }
        if (form.image_file.value === null || form.image_file.value === "") {
            document.getElementById("image_file_error").textContent = "Immagine mancante";
            success = false;
        } else {
            document.getElementById("image_file_error").textContent = "";
        }

        if (success === true) {
            makeCall("POST", "UploadSong", form, function (req) {
                if (req.status === 200) {
                    document.getElementById("upload_song_result").className = "success";
                    document.getElementById("upload_song_result").textContent = "Canzone caricata con successo";
                    document.getElementById("upload_song_form").reset();

                    updateCreatePlaylistForm();
                } else if (req.status === 403) {
                    window.location.href = req.getResponseHeader("Location");
                    window.sessionStorage.removeItem("user_id");
                } else {
                    document.getElementById("upload_song_result").className = "error";
                    document.getElementById("upload_song_result").textContent = "Errore: " + req.responseText;
                }
            });
        } else {
            document.getElementById("upload_song_result").className = "error";
            document.getElementById("upload_song_result").textContent = "Operazione annullata";
        }
    }, false);

    /**
     * CreatePlaylist form controller. Checks if the title is valid, then calls the CreatePlaylist servlet. If the playlist is created correctly, also updates the playlist list in the homepage with the newly created one.
     */
    document.getElementById("create_playlist_form").addEventListener("submit", function check(e) {
        e.preventDefault();
        let form = e.target.closest("form");

        if (form.title.value === null || form.title.value === "") {
            document.getElementById("create_playlist_result").className = "error";
            document.getElementById("create_playlist_result").textContent = "Il titolo della playlist non può essere vuoto";
        } else {
            let url = "CreatePlaylist?title=" + form.title.value;

            //from some reason, just sending the form with makeCall didn't work
            let selectedSongs = form.getElementsByClassName("playlistCheckbox");

            if (selectedSongs.length !== 0) {
                for (let field of selectedSongs) {
                    if (field.checked) {
                        url = url + "&" + field.name + "=on";
                    }
                }
            }

            makeCall("POST", url, form, function (req) {
                if (req.status === 200) {
                    document.getElementById("create_playlist_result").className = "success";
                    document.getElementById("create_playlist_result").textContent = "Playlist creata con successo";

                    updatePlaylists();
                } else if (req.status === 403) {
                    window.location.href = req.getResponseHeader("Location");
                    window.sessionStorage.removeItem("user");
                } else {
                    document.getElementById("create_playlist_result").className = "error";
                    document.getElementById("create_playlist_result").textContent = "Errore: " + req.responseText;
                }
            });
        }
    }, false);
}());

/**
 * Initialises the homepage by calling GetUser and GetGenres servlets, and then calling updatePlaylists, updateCreatePlaylistForm and showHomepage
 */
homepageInit = function () {
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

    updatePlaylists();
    updateCreatePlaylistForm();
    showHomepage();
}

/**
 * Makes the div main_page visible and masks the other pages and homepage_button. Also removes from session storage playlistId and songsIndex
 */
showHomepage = function () {
    sessionStorage.removeItem("playlistId");
    sessionStorage.removeItem("songsIndex")

    document.getElementById("main_page").className = "displayed";
    document.getElementById("homepage_button").className = "masked";
    document.getElementById("playlist_page").className = "masked";
    document.getElementById("song_page").className = "masked";
}

/**
 * Calls the GetPlaylists servlet to update the list of playlists at the beginning of the homepage
 */
updatePlaylists = function () {
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
                        nameCell.appendChild(playlistLink);

                        //calls playlistPageInit on the clicked playlist
                        nameCell.onclick = function () {
                            playlistPageInit(playlist.id);
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
                text.className = "error";
                playlistList.appendChild(text);
            }
        }
    });
}

/**
 * Calls the GetSongsByUserID servlet to update the form to create a new playlist in the homepage with the current user's songs
 */
updateCreatePlaylistForm = function () {
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