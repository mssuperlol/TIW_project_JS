/**
 * Function that handles calls to servlets
 * @param method whether to use GET or POST method of the servlet
 * @param url of the servlet to call
 * @param formElement form to send with the url
 * @param cback function to execute once the servlet sends a response
 * @param reset whether to reset the form after the call
 */
function makeCall(method, url, formElement, cback, reset = true) {
    let req = new XMLHttpRequest(); // visible by closure
    req.onreadystatechange = function () {
        cback(req)
    }; // closure
    req.open(method, url);
    if (formElement == null) {
        req.send();
    } else {
        req.send(new FormData(formElement));
    }
    if (formElement !== null && reset === true) {
        formElement.reset();
    }
}
