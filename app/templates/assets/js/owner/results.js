var decodeEntities = (function() {
    // this prevents any overhead from creating the object each time
    var element = document.createElement('div');

    function decodeHTMLEntities (str) {
        if(str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }
        return str;
    }
    return decodeHTMLEntities;
})();

var query = $("#query").val()

$.ajax("/execute_query", {
    method: "POST",
    data: {
        "query": query
    },
    success: function(result) {
        buildResultGraph(result);
        $("#loading-message").hide();
    },
    error: function(xhr) {
        alert("Error " + xhr.status);
    }

});

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}


function buildResultGraph(data) {

	 try {
	    querydata = JSON.parse(decodeEntities(data));
	 }
	 catch(noresults) {
   	         $("#loading-text").text("No results found. ");
   	         $("#loading-text").append("<a href='javascript:history.back(-1);'>Try Again</a>");
   	         $("#cy").hide();
   	         $("#loading-loader").hide();
	 }     
    querydata = querydata.data;
    $("#resultData").html(decodeEntities(data));

    counter_record=0;

    var demoNodes = [];
    var demoEdges = [];

    while(true) {
        record = querydata["record_"+counter_record];
        if(record==null) {
            break;
        }
        thisnodename="";
        thisrelname="";
        thistargetname="";
		  i=0;
		  
        while(true) {
            result = record["result_"+i];
            if(result == null)
                break;
            result_type = result.result_type;
            label = result.label;

            properties = result.properties;

            if(result_type == "n") {//is a node
                species = properties.species;
                thisnodename = properties.name;
                accession = properties.accession;
                mirbase_link = properties.mirbase_link;

                demoNodes.push({
                    data: {
                        id: thisnodename,
                        name:thisnodename,
                        nodetype:"node",
                        accession:accession,
                        mirbase_link:mirbase_link,
                        species:species,
                        weight:50,
                        faveColor: "#0000BB",
                        faveShape: "ellipse"
                    }
                });

            }
            else if(result_type == "r") {//is a relation
                score = properties.score;
                source_microrna = replaceAll(properties.source_microrna, '_', '-');
                thisrelname = properties.name;
                source_target = replaceAll(properties.source_target, '_', '-');
                demoEdges.push({
                    data: {
                        source: source_microrna,
                        target: source_target,
                        label: thisrelname,
                        score: score
                    },
                    classes: 'autorotate'
                });
            }
            else if(result_type == "t") {//is a target
                geneid = properties.geneid;
                species = properties.species;
                ens_code = properties.ens_code;
                thistargetname = properties.name;
                demoNodes.push({
                    data: {
                        id:ens_code,
                        name:ens_code,
                        nodetype:"target",
                        species:species,
                        ens_code:ens_code,
                        geneid: geneid,
                        weight:50,
                        faveColor: "#00BB00",
                        faveShape: "ellipse"
                    }
                });
            }
            i++;
        }
        counter_record++;
    }   

    var cy = cytoscape({
        container: document.querySelector('#cy'),
        boxSelectionEnabled: false,
        autounselectify: true,

        style: cytoscape.stylesheet().selector('node').css({
            'width': 'mapData(weight, 40, 80, 20, 60)',
            'shape': 'data(faveShape)',
            'content': 'data(name)',
            'text-valign': 'center',
            'color': 'white',
            'background-color': 'data(faveColor)',
            'text-outline-width': 2,
            'text-outline-color': '#000'

        }).selector('edge').css({
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#044',
            'line-color': '#044',
            'width': 1,
            'label': 'data(label)'

        }).selector(':selected').css({
            'background-color': 'black',
            'line-color': 'black',
            'target-arrow-color': 'black',
            'source-arrow-color': 'black'

        }).selector('edge.autorotate').css({
            'edge-text-rotation': 'autorotate'

        }).selector('.faded').css({
            'opacity': 0.25,
            'text-opacity': 0
        }),

        elements: {
            nodes: demoNodes,
            edges: demoEdges
        },

        layout: {
            name: 'grid',
            padding: 10
        }
    });

    cy.on('tap', 'node', function(e){
        var node = e.cyTarget;
        var neighborhood = node.neighborhood().add(node);
        cy.elements().addClass('faded');
        neighborhood.removeClass('faded');
    });

    cy.on('tap', function(e){
        if( e.cyTarget === cy ){
            cy.elements().removeClass('faded');
        }
    });
}