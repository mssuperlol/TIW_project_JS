window.addEventListener("load", () => {
    if (sessionStorage.getItem("user_id") === null) {
        window.location.href = "login.html";
    } else {
        let showPage = new ShowPage
        showPage.showHomepage();
    }
}, false);