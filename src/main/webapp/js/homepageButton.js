(function () {
    document.getElementById("homepage_button").addEventListener("click", (e) => {
        e.preventDefault();
        let showPage = new ShowPage();
        showPage.showHomepage();
    });
}());
