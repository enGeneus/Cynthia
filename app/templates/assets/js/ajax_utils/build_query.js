$(function(){

    $("#nodeTypeSel").change(function() {
        var url="/ajax/node_properties";
        var selectedValue = $(this).val();

        property_select = $("#nodePropertySel");
        property_select.html("");

        $.ajax(url, {
            method: "GET",
            data: {
                "nodeType": selectedValue
            },
            dataType: "json",
            success: function(response) {
                property_select.removeAttr("disabled");
                for (var i in response) {
                    property_select.append("<option>" + response[i] + "</option>")
                }
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
        });
    })

    $(".add-property").click(function(e) {
        e.preventDefault();
        $("#query-fields").append("<div class=\"form-group\"><div class=\"form-group\"><label for=\"nodePropertySel\">Property:</label><select class=\"form-control\" id=\"nodePropertySel\" disabled></select></div></div><div class=\"form-group\"><label for=\"request\">Input String:</label><input type=\"text\" class=\"form-control\" id=\"request\" name=\"request\"/></div>");
    })
});
