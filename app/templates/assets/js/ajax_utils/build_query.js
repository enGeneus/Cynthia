
var propertyFieldHtml = "<br/><input type=\"text\" name=\"propertyValue\" placeholder=\"value\"/><a class=\"btn btn-danger btn-xs\" style=\"padding: 5px 10px;\" onclick=\"javascript:removePropertyField(this)\"><i class=\"fa fa-times\"></i></a>";

$(function(){

    var selectedNode_properties;

    $("#startingNode").change(function() {
        var url="/ajax/node_properties";
        var selectedValue = $(this).val();

        // Load properties
        $.ajax(url, {
            method: "GET",
            data: {
                "nodeType": selectedValue
            },
            dataType: "json",
            success: function(response) {
                selectedNode_properties = response;
                fillSelectOptions($("#filter_pattern .property-select"), selectedNode_properties);
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
        });

        // Enable add property button and query button
        $(".buttons button").removeClass("disabled");
    });

    $("#add-property-filter").click(function(e) {
        e.preventDefault();
        html_to_add = $("#filter_pattern").clone();
        html_to_add.removeAttr("id"); // Avoid duplicate IDs
        $("#properties-filters").append(html_to_add);
        html_to_add.removeAttr("hidden");
    });

    $("#submit-query").click(function(e) {
        e.preventDefault();
        formJSON = serializeFormToJSON();
        console.log(formJSON);

        // Serialized data are set to the form and sent to the server
        $("#serializedForm input").val(formJSON);
        $("#serializedForm").submit();
    });
});

function fillSelectOptions(select, options) {
    select.empty();
    select.append("<option value=\"\" disabled selected>Select option</option>");
    for (var i in options) {
        select.append("<option>" + options[i] + "</option>");
    }
}

function removeSelectDisabled() {
    $(".nodePropertySel").removeAttr("disabled");
}

function removeFilter(button) {
    $(button).closest(".property-filter").remove();
}

function addPropertyField(button) {
    $(button).parent().children().first().append(propertyFieldHtml);
}

function removePropertyField(button) {
    $(button).prev().prev().remove();
    $(button).prev().remove();
    $(button).remove();
}

function serializeFormToJSON() {
    var startingNode = $("#startingNode").val();

    // Add starting node type
    var json = "{\"startingNodeType\": \"" + startingNode + "\"," ;

    // Add species
    $("#species-selection input").each(function (index, object) {
        if($(object).is(':checked')) {
            json = json + " \"specie\": \"" + $(object).val() + "\",";
        }
    });

    // Add relations
    json = json + " \"relations\": [";
    var added_relations = false;
    $(".relation-selection").each(function (index, object) {
        if($(object).find(".relation-checkbox").is(':checked')) {
            added_relations = true;
            json = json + "{\"relationName\": \"" + $(object).find(".relation-checkbox").val() + "\",";
            json = json + " \"cutoffValue\": \"" + $(object).find(".cutoff-value").val() + "\"},"
        }
    });
    if (added_relations) {
        json = json.slice(0, -1);
    }
    json = json + "]";

    // Add properties
    json = json + ", \"properties\": [";
    var property_added = false;
    $(".property-filter").each(function (index, object) {
        var propertyName = $(object).find(".property-select").val();
        if (propertyName != null) {
            property_added = true;
            json = json + "{\"propertyName\": \"" + propertyName + "\", \"values\": [";
            var value_added = false;
            $(object).find(".property-values input").each(function (index, object) {
                if ($(object).val() != "") {
                    json = json + "\"" + $(object).val() + "\",";
                    value_added = true;
                }
            });
            // Remove last comma
            if (value_added) {
                json = json.slice(0, -1);
            }
            // Close values array and property json object
            json = json + "]},"
        }
    });
    // Remove last comma
    if (property_added) {
        json = json.slice(0, -1);
    }

    // Close property array and whole json object
    json = json + "]}";

    return json
}