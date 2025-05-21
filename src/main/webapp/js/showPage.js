function ShowPage() {
    this.showHomepage = function () {
        document.getElementById("main_page").className = "displayed";
        document.getElementById("homepage_button").className = "masked";

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

        makeCall("GET", "GetPlaylists", null, function (req) {
            if (req.readyState === 4) {
                let message = req.responseText;
                let playlistList = document.getElementById("playlists_list");

                if (req.status === 200) {
                    let playlistsToShow = JSON.parse(message);

                    if (playlistsToShow === null || playlistsToShow.length === 0) {
                        let text = document.createElement("p");
                        text.textContent = "Non sono state trovate playlist per questo utente. Per creare una nuova playlist, usa il form sotto.";
                        playlistList.appendChild(text);
                    } else {
                        let row, nameCell, dateCell, table, tbody, thead, th;

                        table = document.createElement("table");
                        table.className = "playlist_table";
                        document.getElementById("playlists_list").appendChild(table);

                        thead = document.createElement("thead");
                        th = document.createElement("th");
                        th.textContent = "Nome";
                        thead.appendChild(th);
                        th = document.createElement("th");
                        th.textContent = "Data";
                        thead.appendChild(th);
                        table.appendChild(thead);

                        tbody = document.createElement("tbody");
                        table.appendChild(tbody);

                        playlistsToShow.forEach(function (playlist) {
                            row = document.createElement("tr");

                            nameCell = document.createElement("td");
                            nameCell.textContent = playlist.name;
                            row.appendChild(nameCell);

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

        makeCall("GET", "GetSongsByUserID", null, function (req) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    let songs = JSON.parse(req.responseText);
                    let songsCheckbox = document.getElementById("create_playlist_table");
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

                    songsCheckbox.appendChild(row);
                } else {
                    window.location.href = req.getResponseHeader("Location");
                    window.sessionStorage.removeItem('user');
                }
            }
        });
    }
}
