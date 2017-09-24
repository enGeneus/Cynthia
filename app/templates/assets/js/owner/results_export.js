$(function(){

    $("#export-button").click(function(){
        if ($("#results").val()!= "") {
            $("#results-export").parent().removeClass("disabled");
            $("#csv-export").parent().removeClass("disabled");
        }
    });

    if ($("#query").val() != "") {
        $("#query-export").parent().removeClass("disabled");
        $("#complete-query-export").removeClass("disabled");
    }

    if ($("#cynthia").val() != ""){
        $("#cynthia-export").parent().removeClass("disabled");
    }

    $("#complete-query-export").click(function(){
        var inputVal = $("#downloadQueryInput");
        inputVal.select();
        document.execCommand('copy');
        showMessage("Query copied to clipboard!");
    });

    $("#cynthia-export").click(function(){
        download("cynthia_data.json", $("#cynthia").val());
    });

    $("#results-export").click(function(){
        var export_string = "{";
        if ($("#query").val() != "") {
            export_string = export_string + "\"query\": \"" + $("#query").val() + "\",";
        }
        if ($("#cynthia").val() != "") {
            export_string = export_string + "\"cynthia\": " + $("#cynthia").val() + ",";
        }
        export_string = export_string + "\"results\": " + $("#results").val() + "}";
        download("results.json", export_string);
    });

    $("#csv-export").click(function(){
        Json2CSV($("#results").val());
    });

});

function Json2CSV(JSONstring) {
    var objArray = JSON.parse(JSONstring);
    var csv = "Node type,Name,Relation,Score,Target Node\r\n";
    var data = objArray['data'];
    for(var result in data) {
        currentResult = data[result];
        startingNode = currentResult['result_0'];
        relation = currentResult['result_1'];
        targetNode = currentResult['result_2'];
        csv = csv + startingNode['label'] + "," + startingNode['properties']['name'] + ",";
        csv = csv + relation['properties']['name'] + "," + relation['properties']['score'] + ",";
        csv = csv + targetNode['properties']['name'] + "\r\n";
    }
    var a = document.createElement('a');
    var blob = new Blob([csv], {'type':'application\/octet-stream'});
    a.href = window.URL.createObjectURL(blob);
    a.download = 'cynthia_export.csv';
    a.click();
    return true;
}