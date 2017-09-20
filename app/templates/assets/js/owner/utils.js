function showMessage(message) {
    var snackbar = document.createElement('div')
    snackbar.id = "snackbar";
    snackbar.innerHTML = message;
    snackbar.className = "show";
    document.body.appendChild(snackbar);
    setTimeout(function(){
        document.body.removeChild(snackbar);
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

function isQueryValid(query){
    var string = "query";
    var re = new RegExp("^(MATCH \([a-z,A-Z]+[0-9]?:[a-z,A-Z,0-9]*\)\-\[r[0-9]+\]\-\> \(t\) [WHERE]* [\(,a-z,A-Z,0-9,\.,\=,\),\s,',\-,AND,OR,\:,\[,\],\>]* [RETURN]+ ([n,r,t,0-9,\,])* LIMIT [0-9]*)$");
    if (re.test(string)) {
    return true;
    } else {
        return false;
    }
}