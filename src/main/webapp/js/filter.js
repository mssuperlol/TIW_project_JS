window.addEventListener("load", () => {
    if(sessionStorage.getItem("user") == null) {
        window.location.href = "login.html";
    }
}, false);