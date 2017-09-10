
var propertyFieldHtml = "<div class=\"property-value-wrapper\" hidden><input class=\"form-control input-sm\" type=\"text\" name=\"propertyValue\" placeholder=\"value\"/><a class=\"btn btn-danger btn-xs\" style=\"padding: 5px 10px;\" onclick=\"javascript:removePropertyField(this)\"><i class=\"fa fa-times\"></i></a></div>";

var options = []
var startingNodes = 0;
var pageLoaded = false;

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
    html_to_add.removeAttr("id").hide(); // Avoid duplicate IDs and hide for further animation
    $("#starting-node-container").append(html_to_add);

    if(pageLoaded) { // If it is the first node append then avoid the slide down animation
        html_to_add.slideDown();
    } else {
        html_to_add.show();
        pageLoaded = true;
    }

    startingNodes++;
    if (startingNodes > 1) {
        $(".remove-node-button").removeClass("disabled");
    }
}

function changeStartingNodeHandler(select) {
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

    // Empty content
    $(select).parent().parent().find(".properties-filters").children().each(function(index, object) {
        $(object).slideUp(function(){
            $(this).remove();
        });
    });
    // Enable add property button
    $(select).parent().parent().find("button").removeClass("disabled");
    // Enable Query button
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

function changePropertyHandler(select) {
    var property_panel = $(select).closest(".property-panel")
    var property_values = property_panel.find(".property-values");
    var property_values_fields = property_values.find(".property-value-wrapper");

    property_panel.find("a").removeClass("disabled");

    // Check how many fields have been inserted: if it has been inserted only one field, only reset the input
    if (property_values_fields.length == 1) {
        property_values_fields.find("input").val("");
    } else {
        property_values_fields.each(function(index, object) {
            $(object).slideUp(function(){
                $(this).remove();
            });
        });
        $("<div class=\"property-value-wrapper\" hidden><input class=\"form-control input-sm\" type=\"text\" name=\"propertyValue\" placeholder=\"value\"/></div>").appendTo(property_values).fadeIn();
    }
}

function removeSelectDisabled() {
    $(".nodePropertySel").removeAttr("disabled");
}

function removeFilter(button) {
    $(button).closest(".property-filter").slideUp(function() {
        $(this).remove();
    });
}

function removeStartingNode(button) {
    if (startingNodes > 1) {
        $(button).closest(".starting-node-panel").slideUp(function(){
            $(this).remove();
        });
        startingNodes--;
        if (startingNodes == 1) {
            $(".remove-node-button").removeAttr("disabled");
        }
    }
}

function addPropertyFilter(button) {
    html_to_add = $("#filter_pattern").clone();
    html_to_add.removeAttr("id").hide(); // Avoid duplicate IDs and hide for further animation
    node_type = $(button).parent().parent().find(".starting-node-select").val();
    fillSelectOptions(html_to_add.find("select"), options[node_type]);
    $(button).parent().parent().find(".properties-filters").append(html_to_add);

    html_to_add.slideDown();
}

function addPropertyField(button) {
    var nodeAppendTo = $(button).parent().children().first(); //.append(propertyFieldHtml);
    $(propertyFieldHtml).appendTo(nodeAppendTo).slideDown();
}

function removePropertyField(button) {
    $(button).closest(".property-value-wrapper").slideUp(function(){
        $(this).remove();
    });
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
                    property_name_wrote = false;
                    var value_added = false;
                    $(object).find(".property-values input").each(function (index, object) {
                        if ($(object).val() != "") {
                            if(!property_name_wrote) {
                                json = json + "{\"name\": \"" + propertyName + "\", \"values\": [";
                                property_name_wrote = true;
                            }
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