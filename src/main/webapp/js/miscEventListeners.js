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

    document.getElementById("return_to_playlist").addEventListener("click", (e) => {
        e.preventDefault();
        showPlaylistPage();
    });

    const modal = document.querySelector(".modal-overlay");

    function closeModal(e, clickedOutside) {
        if (clickedOutside) {
            if (e.target.classList.contains("modal-overlay")) {
                modal.classList.remove("displayed");
                modal.classList.add("masked");
            }
        } else {
            modal.classList.remove("displayed");
            modal.classList.add("masked");
        }
    }

    document.getElementById("reorder_button").addEventListener("click", (e) => {
        modal.classList.remove("masked");
        modal.classList.add("displayed");
    });

    modal.addEventListener("click", (e) => closeModal(e, true));

    document.getElementById("reorder_submit").addEventListener("click", closeModal);
    document.getElementById("abort_reorder").addEventListener("click", closeModal);
}());