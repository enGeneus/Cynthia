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

function reg_exp(query){

    var string = "query";
    var re = new RegExp("^(MATCH \([a-z,A-Z]+[0-9]?:[a-z,A-Z,0-9]*\)\-\[r[0-9]+\]\-\> \(t\) [WHERE]* [\(,a-z,A-Z,0-9,\.,\=,\),\s,',\-,AND,OR,\:,\[,\],\>]* [RETURN]+ ([n,r,t,0-9,\,])* LIMIT [0-9]*)$");
    if (re.test(string)) {
    console.log("Valid");
    } else {
        console.log("Invalid");
        }
}