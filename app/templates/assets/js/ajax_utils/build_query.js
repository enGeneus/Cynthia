
var propertyFieldHtml = "<br/><input type=\"text\" name=\"propertyValue\" placeholder=\"value\"/><a class=\"btn btn-danger btn-xs\" style=\"padding: 5px 10px;\" onclick=\"javascript:removePropertyField(this)\"><i class=\"fa fa-times\"></i></a>";

var options = []
var startingNodes = 0;

$(function(){

    addStartingNode();

    $("#submit-query").click(function(e) {
        e.preventDefault();

        if (startingNodes > 0) {
            formJSON = serializeFormToJSON();
            $("#serializedForm input").val(formJSON);
            $("#serializedForm").submit();
        } else {
            alert("Error: you have to select at least one starting node");
        }
    });

});

function addStartingNode() {
    html_to_add = $("#starting-node_pattern").clone();
    html_to_add.removeAttr("id"); // Avoid duplicate IDs
    $("#starting-node-container").append(html_to_add);

    startingNodes++;
    if (startingNodes > 1) {
        $(".remove-node-button").removeClass("disabled");
    }
}

function fillPropertyOptions(select) {
    var url="/ajax/node_properties";
    var selectedValue = $(select).val();
    var selectedNode_properties;

    if (!(selectedValue in options)) {
        // Load properties
        $.ajax(url, {
            method: "GET",
            data: {
                "nodeType": selectedValue
            },
            dataType: "json",
            success: function(response) {
                options[selectedValue] = response;
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
        });
    }

    // Enable add property button
    $(select).parent().parent().find("button").removeClass("disabled");
    // Query button
    $("#submit-query").removeClass("disabled");
    // Enable remove starting node button
    $(select).parent().parent().parent().find("a").removeClass("disabled");
}

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

function removeStartingNode(button) {
    if (startingNodes > 1) {
        $(button).closest(".starting-node-panel").remove();
        startingNodes--;
        if (startingNodes == 1) {
            $(".remove-node-button").removeAttr("disabled");
        }
    }
}

function addPropertyFilter(button) {
    html_to_add = $("#filter_pattern").clone();
    html_to_add.removeAttr("id"); // Avoid duplicate IDs
    node_type = $(button).parent().parent().find(".starting-node-select").val();
    fillSelectOptions(html_to_add.find("select"), options[node_type]);
    $(button).parent().parent().find(".properties-filters").append(html_to_add);
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
    // Add starting nodes
    var json = "{\"startingNodes\": [";
    var nodes_added = false;
    $(".starting-node-panel").each(function (index, object) {
        var nodeType = $(object).find(".starting-node-select").val();
        if (nodeType != null) {
            nodes_added = true;
            json = json + "{\"type\": \"" + nodeType + "\", \"properties\": [";
            var property_added = false;
            $(object).find(".property-filter").each(function (index, object) {
                var propertyName = $(object).find(".property-select").val();
                if (propertyName != null) {
                    property_added = true;
                    json = json + "{\"name\": \"" + propertyName + "\", \"values\": [";
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
            // Close properties array and starting node object
            json = json + "]},";
        }
    });
    // Remove last comma and close starting nodes array
    if (nodes_added) {
        json = json.slice(0, -1);
    }
    json = json + "],"

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
    // Remove last comma and close relation list
    if (added_relations) {
        json = json.slice(0, -1);
    }
    json = json + "]";

    // Close json object
    json = json + "}";

    return json
}