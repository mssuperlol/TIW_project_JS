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
