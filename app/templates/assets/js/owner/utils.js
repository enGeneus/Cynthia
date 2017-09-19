function showMessage(message) {
    $("#snackbar").html(message);
    var snackbar = document.getElementById("snackbar")
    snackbar.innerHtml = message;
    snackbar.className = "show";
    setTimeout(function(){
        snackbar.className = snackbar.className.replace("show", "");
    }, 2000);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}