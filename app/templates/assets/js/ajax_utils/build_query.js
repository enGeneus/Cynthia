var propertyFilterHtml;
var relationFilterHtml;
var selectedNode_properties;
var filtersAdded = 0;
var relationsAdded = 0;

$(function(){

    $.ajax("/ajax/property_form", {
        method: "GET",
        dataType: "html",
        success: function(response) {
                propertyFilterHtml = response;
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
    });

    $.ajax("/ajax/relations_form", {
        method: "GET",
        dataType: "html",
        success: function(response) {
                relationFilterHtml = response;
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
    });

    $("#startingNode").change(function() {
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
                console.log(response);
                fillSelectOptions($(".nodePropertySel"), selectedNode_properties);
                removeSelectDisabled();
            },
            error: function(xhr) {
                alert("Error " + xhr.status);
            }
        });
    });

    $("#add-property-filter").click(function(e) {
        e.preventDefault();
        filtersAdded++;
        var newFilterFields=$(propertyFilterHtml);
        newSelect=newFilterFields.find("select").first().attr("name", "filterName" + filtersAdded);
        newInput=newFilterFields.find("input").first().attr("name", "filterValue" + filtersAdded);
        if (selectedNode_properties) {
            fillSelectOptions(newSelect, selectedNode_properties);
        } else {
            newSelect.attr("disabled", true);
        }
        $("#property-filters").append(newFilterFields);
        if (filtersAdded == 1) {
            $("#property-filters").parent().show();
        }
    });

    $("#add-relation-filter").click(function(e) {
        e.preventDefault();
        relationsAdded++;
        var newRelationFields=$(relationFilterHtml);
        newSelect=newRelationFields.find("select").first().attr("name", "relationName" + relationsAdded);
        newInput=newRelationFields.find("input").first().attr("name", "cutoffValue" + relationsAdded);
        $("#relation-filters").append(newRelationFields);
        if (relationsAdded == 1) {
            $("#relation-filters").parent().show();
        }
    });

    $("#submit-query").click(function(e) {
        e.preventDefault();
        formJSON = serializeFormToJSON();
        console.log(formJSON);
    });
});

function fillSelectOptions(select, options) {
    for (var i in options) {
        select.append("<option>" + options[i] + "</option>");
    }
}

function removeSelectDisabled() {
    $(".nodePropertySel").removeAttr("disabled");
}

function removeFilter(e, button, filterType) {
    e.preventDefault();
    $(button).parent().parent().remove();
    if (filterType == 'property') {
        filtersAdded--;
        if (filtersAdded == 0) {
            $("#property-filters-panel").hide();
        }
    } else if (filterType == 'relation') {
        relationsAdded--;
        if (relationsAdded == 0) {
            $("#relation-filters-panel").hide();
        }
    }
}

function serializeFormToJSON() {
    var startingNode = $("#startingNode").val();
    var json = "{\"startingNodeType\": \"" + startingNode + "\", \"filters\": [" ;

    // Add json array for property filter
    $(".property-filter-field").each(function (index, object) {
        var propertyName = $(object).children().first().find("select").val();
        var propertyValue = $(object).children().last().find("input").val();
        json = json + "{\"propertyName\": \"" + propertyName + "\", \"propertyValue\": \"" + propertyValue + "\"}, ";
    });

    // Remove last comma
    if (filtersAdded > 0) {
        json = json.slice(0, -2);
    }

    // Close previous array and add new one for relations
    json = json + "], \"relationships\": [";
    $(".relation-filter-field").each(function (index, object) {
        var relationName = $(object).children().first().find("select").val();
        var cutoffValue = $(object).children().last().find("input").val();
        json = json + "{\"relationName\": \"" + relationName + "\", \"cutoffValue\": \"" + cutoffValue + "\"}, ";
    });

    // Remove last comma
    if (relationsAdded > 0) {
        json = json.slice(0, -2);
    }

    json = json + "]}";
    return json;
}