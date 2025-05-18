(function () {
    document.getElementById("login_form").addEventListener('submit', (e) => {
        e.preventDefault()
        let form = e.target.closest("form");
        if (form.checkValidity()) {
            makeCall("POST", 'CheckLogin', form, function (x) {
                if (x.readyState === XMLHttpRequest.DONE) {
                    let message = x.responseText;
                    switch (x.status) {
                        case 200:
                            sessionStorage.setItem('user_id', message);
                            window.location.href = "homepage.html";
                            break;
                        default:
                            document.getElementById("errormessage").textContent = message;
                            break;
                    }
                }
            });
        } else {
            form.reportValidity();
        }
    });
})();