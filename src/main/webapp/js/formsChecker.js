window.onload = () => (
    document.getElementById("upload_song_form").addEventListener('submit', function check(e) {
        e.preventDefault();
        let success = true;
        let form = e.target.closest("form");

        if (form.title.value === null || form.title.value === "") {
            document.getElementById("title_error").textContent = "Il titolo della canzone non può essere vuoto";
            success = false;
        } else {
            document.getElementById("title_error").textContent = "";
        }
        if (form.album_title.value === null || form.album_title.value === "") {
            document.getElementById("album_error").textContent = "Il titolo dell'album non può essere vuoto";
            success = false;
        } else {
            document.getElementById("album_error").textContent = "";
        }
        if (form.performer.value === null || form.performer.value === "") {
            document.getElementById("performer_error").textContent = "L'interprete non può essere vuoto";
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
            document.getElementById("upload_song_result").className = "success";
            document.getElementById("upload_song_result").textContent = "Canzone caricata con successo";
            // TODO caricare la canzone
            document.getElementById("upload_song_form").reset();
        } else {
            document.getElementById("upload_song_result").className = "error";
            document.getElementById("upload_song_result").textContent = "Errore nel caricamento";
        }
    }, false)
)