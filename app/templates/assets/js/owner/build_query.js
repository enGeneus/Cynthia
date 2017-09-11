var node_options = [];
var changing_element;
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

    $("#limit-select").change(function(e) {
        if($(this).val()=="No limit") {
            alert("Warning! Selecting no limit for the query, the search may take long time and results can be inaccessible!")
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
    var selectedValue = $(select).val();

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
    var node_type = $(select).closest(".starting-node-panel").find(".starting-node-select").val();
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
        var html_to_add = $("#property-value-pattern").clone();
        html_to_add.removeAttr("id").hide().find("a").remove(); // Avoid duplicate IDs and hide for further animation
        $(html_to_add).appendTo(property_values).fadeIn();
    }
}

function savePreviousSelected(select) {
    changing_element = $(select).val();
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
            $(".remove-node-button").addClass("disabled");
        }
    }
}

function addPropertyFilter(button) {
    html_to_add = $("#filter_pattern").clone();
    html_to_add.removeAttr("id").hide(); // Avoid duplicate IDs and hide for further animation
    $(button).closest(".starting-node-panel").find(".properties-filters").append(html_to_add);
    node_type = $(button).closest(".starting-node-panel").find(".starting-node-select").val();

    if (!(node_type in node_options)) {
        var url="/ajax/node_properties";

        // Show loading message and lock some functions
        $(button).addClass("disabled");
        $("#add-starting-node").addClass("disabled");
        $(button).parent().siblings(".loader-wrapper").removeClass("hidden");
        $(button).parent().css("top", "-1px");

        // Load properties
        $.ajax(url, {
            method: "GET",
            data: {
                "nodeType": node_type
            },
            dataType: "json",
            success: function(response) {
                node_options[node_type] = response;
                fillSelectOptions(html_to_add.find("select"), node_options[node_type]);
                $(button).parent().siblings(".loader-wrapper").addClass("hidden");
                $(button).removeClass("disabled");
                $("#add-starting-node").removeClass("disabled");
                $(button).parent().css("top", "0");
                html_to_add.slideDown();
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
        });
    } else {
        fillSelectOptions(html_to_add.find("select"), node_options[node_type]);
        html_to_add.slideDown();
    }
}

function addPropertyField(button) {
    html_to_add = $("#property-value-pattern").clone().hide();
    html_to_add.removeAttr("id"); // Avoid duplicate IDs and hide for further animation
    var nodeAppendTo = $(button).parent().children(".property-values"); //.append(html_to_add);
    console.log(nodeAppendTo);
    $(html_to_add).appendTo(nodeAppendTo);
    $(html_to_add).slideDown();
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
                    var value_added = false;
                    $(object).find(".property-values input").each(function (index, object) {
                        if ($(object).val() != "") {
                            if(!value_added) {
                                json = json + "{\"name\": \"" + propertyName + "\", \"values\": [";
                                value_added = true;
                            }
                            json = json + "\"" + $(object).val() + "\",";
                        }
                    });
                    if (value_added) {
                        // Remove last comma
                        json = json.slice(0, -1);
                        // Close values array and property json object
                        json = json + "]},";
                    }
                }
            });
            // Remove last comma
            if (json.slice(-1)==",") {
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
    json = json + "],";

    //Add limit
    json = json + " \"limit\": ";
    limit_val = $("#limit-select").val();
    if (limit_val=="No limit"){
        limit_val=0;
    }
    if (limit_val==null){
        limit_val=-1;
    }
    json = json + limit_val;

    // Close json object
    json = json + "}";
    return json
}