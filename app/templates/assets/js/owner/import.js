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
        formData.append('file', $("#uploadJsonInput")[0].files[0], $("#uploadJsonInput").val());

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

});

function submitQuery(json) {
    $("#serializedForm input").val(JSON.stringify(json));
    $("#serializedForm").submit();
}