$(function() {
    $("#complete-import").click(function(){
        var imported_text = $("#import-textarea").val();
        try {
            $.parseJSON(imported_text);
        } catch (err) {
            alert("Wrong data, import failed");
            return
        }
        $("#serializedForm input").val(imported_text);
        $("#serializedForm").submit();
    });
});