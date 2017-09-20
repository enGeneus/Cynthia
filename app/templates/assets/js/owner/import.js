$(function() {

    $("#uploadQueryInput").on('input', function(){
        if($(this).val() != ""){
            $("#complete-query-import").removeClass("disabled");
        } else {
            $("#complete-query-import").addClass("disabled");
        }
    });

    $("#uploadJsonInput").change(function(){
        var fileName = $(this).val();
        var splits = fileName.split('\\');
        $("#uploadedJsonFilename").html(splits[splits.length -1]);
        $("#complete-json-import").removeClass("disabled");
    });

    $("#uploadResultsInput").change(function(){
        var fileName = $(this).val();
        var splits = fileName.split('\\');
        $("#uploadedResultsFilename").html(splits[splits.length -1]);
        $("#complete-results-import").removeClass("disabled");
    });

    $("#complete-query-import").click(function(){
        var imported_text = $("#uploadQueryInput").val();
        $("#uploadQuery input").val(imported_text);
        $("#uploadQuery").submit();
    });

    $("#complete-json-import").click(function(e){
        e.preventDefault();
        var url = "/ajax/import_json";
        var formData = new FormData();
        formData.append('cynthia_json', $("#uploadJsonInput")[0].files[0], $("#uploadJsonInput").val());

        $.ajax(url, {
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function(response) {
                submitQuery(response);
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
        })
    });

    $("#complete-results-import").click(function(e){
        e.preventDefault();
        var url = "/ajax/import_results";
        var formData = new FormData();
        formData.append('results_json', $("#uploadResultsInput")[0].files[0], $("#uploadResultsInput").val());

        $.ajax(url, {
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function(response) {
                // Remove file from the input in order to lighten the request
                $("#uploadResultsInput").remove();

                // Fill the fields of query, cynthia data and results (if available)
                $("#query-text").val(response['query']);
                $("#cynthia-text").val(JSON.stringify(response['cynthia']));
                $("#results-text").val(JSON.stringify(response['results']));

                // submit request
                $("#uploadResults").submit();
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
        })
    });

});

function submitQuery(json) {
    $("#serializedForm input").val(JSON.stringify(json));
    $("#serializedForm").submit();
}