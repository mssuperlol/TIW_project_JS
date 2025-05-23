/**
 * Adds a listener to the homepage_button that loads the homepage when clicked
 */
(function () {
    document.getElementById("homepage_button").addEventListener("click", (e) => {
        e.preventDefault();
        let showPage = new ShowPage();
        //calls showHomepage since it's not necessary to do another call any servlet to update the homepage
        showPage.showHomepage();
    });
}());
