(function () {
    document.getElementById("logout").addEventListener('click', (e) => {
        e.preventDefault()
        makeCall("GET", 'Logout', null, function (x) {
            if (x.readyState === XMLHttpRequest.DONE) {
                let message = x.responseText;
                switch (x.status) {
                    case 200:
                        sessionStorage.clear();
                        window.location.href = "login.html";
                        break;
                    default:
                        document.getElementById("errormessage").textContent = message;
                        break;
                }
            }
        });
    })
}());