const maxDimension = 64;

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

    /**
     * Reorder form controller. Calls the UpdateCustomOrder servlet.
     */
    document.getElementById("reorder_form").addEventListener("submit", (e) => {
        e.preventDefault();
        let playlistId = sessionStorage.getItem("playlistId");
        let form = e.target.closest("form");
        let url = "UpdateCustomOrder?playlistId=" + playlistId;

        let reorderedSongs = form.getElementsByClassName("reorder_cell");
        let i = 0;

        for (let row of reorderedSongs) {
            //each row's id is "r$ID", so remove the 'r' for the url
            url = url + "&" + i + "=" + row.id.substring(1);
            i++;
        }

        makeCall("POST", url, form, function (req) {
            if (req.readyState === 4) {
                let message = req.responseText;
                if (req.status === 200) {
                    playlistPageInit(playlistId);
                } else if (req.status === 403) {
                    window.location.href = req.getResponseHeader("Location");
                    window.sessionStorage.removeItem("user");
                } else {
                    document.getElementById("reorder_error").textContent = message;
                }
            }
        });
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

                        let value = 0;
                        sessionStorage.setItem("songsIndex", value.toString());

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
