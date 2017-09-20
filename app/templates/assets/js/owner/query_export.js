$(function() {
    $("#export-button").click(function(){
        var url = "/ajax/export_cypher_query";
        var json = serializeFormToJSON();
        $("#serializedForm input").val(json);
        $.ajax(url, {
            method: "POST",
            data: {json: json},
            dataType: "text",
            success: function(response) {
                $("#downloadQueryInput").val(response);
                $("#complete-query-export").removeClass("disabled");
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
        });
    });

    $("#complete-query-export").click(function(){
        var inputVal = $("#downloadQueryInput");
        inputVal.select();
        document.execCommand('copy');
        showMessage("Query copied to clipboard!");
    });

    $("#complete-json-export").click(function(){
        download("query.json", $("#serializedForm input").val());
    });
});
