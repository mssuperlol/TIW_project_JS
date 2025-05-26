/**
 * On load, controls if the user properly logged in: if so, loads the homepage; otherwise, goes back to the login page
 */
window.addEventListener("load", () => {
    if (sessionStorage.getItem("user_id") === null) {
        window.location.href = "login.html";
    } else {
        homepageInit();
    }
}, false);