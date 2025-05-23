/**
 * Login form controller. If the form is valid, calls the CheckLogin servlet to check the credentials. If they are correct, saves the user_id in the session and sends the user to homepage.html; otherwise displays an error message.
 */
(function () {
    document.getElementById("login_form").addEventListener('submit', (e) => {
        e.preventDefault();
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