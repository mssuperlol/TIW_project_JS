/**
 * Adds a listener to the homepage_button that loads the homepage when clicked
 */
(function () {
    document.getElementById("homepage_button").addEventListener("click", (e) => {
        e.preventDefault();
        //calls directly showHomepage since it's not necessary to do another call to any servlet to update the homepage
        showHomepage();
    });
}());
