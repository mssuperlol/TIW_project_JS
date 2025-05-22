//UploadSong form controller
let maxDimension = 64;

document.getElementById("upload_song_form").addEventListener('submit', function check(e) {
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
    }else if (form.performer.value.length > maxDimension) {
        document.getElementById("performer_error").textContent = "Dimensione massima: "+ maxDimension;
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

                let showPage = new ShowPage();
                showPage.updateCreatePlaylistForm();
            } else if (req.status === 403) {
                window.location.href = req.getResponseHeader("Location");
                window.sessionStorage.removeItem('user');
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

//CreatePlaylist form controller
document.getElementById("create_playlist_form").addEventListener('submit', function check(e) {
    e.preventDefault();
    let form = e.target.closest("form");

    if (form.title.value === null || form.title.value === "") {
        document.getElementById("create_playlist_result").className = "error";
        document.getElementById("create_playlist_result").textContent = "Il titolo della playlist non può essere vuoto";
    } else {
        makeCall("POST", "CreatePlaylist", form, function (req) {
            if (req.status === 200) {
                document.getElementById("create_playlist_result").className = "success";
                document.getElementById("create_playlist_result").textContent = "Playlist creata con successo";
                document.getElementById("form").reset();

                let showPage = new ShowPage();
                showPage.updatePlaylists();
            } else if (req.status === 403) {
                window.location.href = req.getResponseHeader("Location");
                window.sessionStorage.removeItem('user');
            } else {
                document.getElementById("create_playlist_result").className = "error";
                document.getElementById("create_playlist_result").textContent = "Errore: " + req.responseText;
            }
        });
    }
}, false);
