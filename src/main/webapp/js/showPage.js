function ShowPage() {
    this.showHomepage = function () {
        document.getElementById("main_page").className = "displayed";

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
    }
}
