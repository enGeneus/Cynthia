$(function(){

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

});