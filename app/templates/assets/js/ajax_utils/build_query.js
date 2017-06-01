$(function(){

    var selectedNode_properties;
    var filtersAdded = 0;

    $("#nodeTypeSel").change(function() {
        var url="/ajax/node_properties";
        var selectedValue = $(this).val();

        $.ajax(url, {
            method: "GET",
            data: {
                "nodeType": selectedValue
            },
            dataType: "json",
            success: function(response) {
                selectedNode_properties = response;
                fillSelectOptions($(".nodePropertySel"), selectedNode_properties);
                removeSelectDisabled();
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
        });
    });

    $(".add-property-filter").click(function(e) {
        e.preventDefault();
        filtersAdded++;
        newForm=$("<div class=\"form-group\"><label>Property:</label><select class=\"form-control nodePropertySel\"></select></div><div class=\"form-group\"><label>Input String:</label><input type=\"text\" class=\"form-control\"/>");
        newSelect=newForm.find("select").first().attr("name", "filterName" + filtersAdded);
        newInput=newForm.find("input").first().attr("name", "filterValue" + filtersAdded);
        if (selectedNode_properties) {
            fillSelectOptions(newSelect, selectedNode_properties);
        } else {
            newSelect.attr("disabled", true);
        }
        $("#query-fields").append(newForm);
    });

    $("#submit-query").click(function(e) {
        e.preventDefault();
        formJSON = JSON.stringify($("#query-form").serializeArray());
        console.log(formJSON);
    });
});

function fillSelectOptions(select, options) {
    for (var i in options) {
        select.append("<option>" + options[i] + "</option>")
    }
}

function removeSelectDisabled() {
    $(".nodePropertySel").removeAttr("disabled");
}