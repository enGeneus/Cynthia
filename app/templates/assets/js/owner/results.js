$(function(){

    if ($("#results").val()=="") {
        // If there are no results filled on page load, call the execute query
        var query = $("#query").val()

        $.ajax("/execute_query", {
            method: "POST",
            data: {
                "query": query
            },
            success: function(result) {
                $("#results").val(decodeEntities(result));
                buildResultGraph(result);
                $("#loading-message").hide();
            },
            error: function(xhr) {
                showMessage("Error while executing query");
            }
        });
    } else {
        // Else, show results
        buildResultGraph($("#results").val());
        $("#loading-message").hide();
    }


    $.ajax("/get_labels", {
        method: "POST",
        data: {
            "post": "nothing"
        },
        success: function(result) {
            filterNames = JSON.parse(result);
            for(i=0; i<filterNames.length; i++) {
                $("#filters-ok").append("<span class=\"label label-info\" style=\"cursor:pointer;\" onclick=\"filterEntities('"+filterNames[i]+"');\">"+filterNames[i]+"</span><br>");
            }
        },
        error: function(xhr) {
            showMessage("Error while acquiring relationship filters");
        }
    });
});

var filterEntities = (function(entityType) {
	
    var demoNodesTemp = [];
    var demoEdgesTemp = [];

		//reboot the nodes in graph before filtering	
		var collection = cyd.nodes();
		cyd.remove( collection );
		
		//reboot the edges in graph before filtering	
		var collection = cyd.edges();
		cyd.remove( collection );		
		
		cyd.add(demoNodes);
		cyd.add(demoEdges);

	if(entityType == "all") {//show all results

		var layout = cyd.layout({
   			name: 'cola',
   		   infinite: false,
    			fit: true
		});
		layout.run();
	}
	else if(entityType == "best_score") {//if multiple relations between nodes and target, show only the best score relation			
	
		for(i=0; i<demoNodes.length; i++) {

			for(j=0; j<demoNodes.length; j++) {			

				var edgesSelected=cyd.edges("[source='"+demoNodes[i].data.id+"']");
				edgesSelected = edgesSelected.edges("[target='"+demoNodes[j].data.id+"']");

				if(edgesSelected.length<=1)
					continue;			
			
				var maximumValue = 99999999;
				var maximumLabel = "";

				for(k=0; k<edgesSelected.length; k++) {
					//lower is better (?)
					if(edgesSelected[k].data().score < maximumValue) {
						maximumValue = edgesSelected[k].data().score;	
						maximumLabel = edgesSelected[k].data().label;													
					}
				}	
				
				var collectionToRemove=cyd.edges("[source='"+demoNodes[i].data.id+"']");
				collectionToRemove = collectionToRemove.edges("[target='"+demoNodes[j].data.id+"']");
				cyd.remove( collectionToRemove );
				
				var collectionToAdd = cyd.add([{ group: "edges", data: { source: demoNodes[i].data.id, target: demoNodes[j].data.id, score: maximumValue, label: maximumLabel }, classes: "autorotate"  } ]);

			}
		}	
		
		var layout = cyd.layout({
            name: 'cola',
            infinite: false,
            fit: true
		});
		layout.run();

    } else if(entityType == "worst_score") {//if multiple relations between nodes and target, show only the worst score relation
	
		for(i=0; i<demoNodes.length; i++) {

			for(j=0; j<demoNodes.length; j++) {			

				var edgesSelected=cyd.edges("[source='"+demoNodes[i].data.id+"']");
				edgesSelected = edgesSelected.edges("[target='"+demoNodes[j].data.id+"']");

				if(edgesSelected.length<=1)
					continue;			
			
				var maximumValue = -99999999;
				var maximumLabel = "";

				for(k=0; k<edgesSelected.length; k++) {
					//lower is better (?)
					if(edgesSelected[k].data().score > maximumValue) {
						maximumValue = edgesSelected[k].data().score;	
						maximumLabel = edgesSelected[k].data().label;													
					}
				}	
				
				var collectionToRemove=cyd.edges("[source='"+demoNodes[i].data.id+"']");
				collectionToRemove = collectionToRemove.edges("[target='"+demoNodes[j].data.id+"']");
				cyd.remove( collectionToRemove );
				
				var collectionToAdd = cyd.add([{ group: "edges", data: { source: demoNodes[i].data.id, target: demoNodes[j].data.id, score: maximumValue, label: maximumLabel }, classes: "autorotate"  } ]);
							
			}
		}	
		
		var layout = cyd.layout({
   			name: 'cola',
   		   infinite: false,
    			fit: true
		});
		layout.run();
	
	} else {//automatic relation filter

        var edgesSelected=cyd.edges("[name!='"+entityType+"']");
				
        var collectionToRemove=edgesSelected;
        cyd.remove( collectionToRemove );

		var layout = cyd.layout({
		    name: 'cola',
            infinite: false,
            fit: true
		});
		layout.run();
	}			


    //reassign tooltip

    demoNodesAddedName=new Array();
    for(i=0; i<demoNodes.length; i++) {

        isPresent=false;
        for(j=0; j<demoNodesAddedName.length; j++)
            if(demoNodes[i].data.id == demoNodesAddedName[j]) {
                isPresent=true;
                break;//already added
            }

        if(isPresent==true)
            continue;

        if(demoNodes[i].data.nodetype=="node")
            thiscontent = 'Node Name: '+demoNodes[i].data.name+'<br>Node Type: '+demoNodes[i].data.nodetype+'<br>Accession: '+demoNodes[i].data.accession+'<br>Mirbase Link: '+demoNodes[i].data.mirbase_link+'<br>Species: '+demoNodes[i].data.species;
        else
            thiscontent = 'Node Name: '+demoNodes[i].data.name+'<br>Node Type: '+demoNodes[i].data.nodetype+'<br>Gene ID: '+demoNodes[i].data.geneid+'<br>ens_code: '+demoNodes[i].data.ens_code+'<br>Species: '+demoNodes[i].data.species;

        demoNodesAddedName[demoNodesAddedName.length]=demoNodes[i].data.id;

        cyd.$('#'+demoNodes[i].data.id).qtip({
            content: thiscontent,
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            style: {
                classes: 'qtip-bootstrap',
                tip: {
                width: 16,
                height: 8
                }
            }
        });
    }
});
	
var cyd;
var demoNodes = [];
var demoEdges = [];

var temponodes=[];
var noedges=0;

var tempoedges = [];

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

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}


function buildResultGraph(data) {

    $('#config-toggle').on('click', function(){
      $('body').toggleClass('config-closed');
      cy.resize();
    });

    try {
        querydata = JSON.parse(decodeEntities(data));


    } catch(noresults) {
         $("#loading-text").text("No results found. ");
         $("#loading-text").append("<a href='javascript:history.back(-1);'>Try Again</a>");
         $("#cy").hide();
         $("#loading-loader").hide();
    }
    querydata = querydata.data;

    counter_record=0;

    var demoNodesNames = new Array();
    var nodes = [];
	 var edges = [];
	 var target= [];

	 j=0;
	 


	 //before starting, i have to make uniques data about nodes and edges
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

                nodes.push({
                    data: {
                        id: "a"+j,
                        counterId:counter_record,
                        name:thisnodename,
                        nodetype:"node",
                        accession:accession,
                        mirbase_link:mirbase_link,
                        species:species,
                        weight:50,
                        faveColor: "#68BDF6",
                        faveShape: "ellipse",
                        unified:0
                    }
                });
			
               temponodes.push({
                    data: {
                        id: "a"+j,
                        counterId:counter_record,
                        name:thisnodename,
                    }
                });

            }
            else if(result_type == "r") {//is a relation
                score = properties.score;
                source_microrna = replaceAll(properties.source_microrna, '_', '-');
                thisrelname = properties.name;
                source_target = replaceAll(properties.source_target, '_', '-');
                
                newsource = temponodes[noedges].data.id;
                
                demoEdges.push({
                    data: {
                    		id:"b"+j,
                    		counterId:counter_record,
                        source: newsource,
                        target: source_target,
                        label: thisrelname+' - Score: '+score,
                        score: score,
                        name: thisrelname
                    },
                    classes: 'autorotate'
                });
                
               tempoedges.push({
                    data: {
                        id: "b"+j,
                        counterId:counter_record,
                        name:thisrelname
                    }
                });                
                
                noedges++;
            }
            else if(result_type == "t") {//is a target
            

					//associo ogni relazione al target
					for(s=0; s<tempoedges.length; s++) {
						for(l=0; l<demoEdges.length; l++) {
							if(demoEdges[l].data.id == tempoedges[s].data.id)							
							demoEdges[l].data.target = "c"+j;					
					
						}
					}
            
                geneid = properties.geneid;
                species = properties.species;
                ens_code = properties.ens_code;
                thistargetname = properties.name;
                nodes.push({
                    data: {
                        id:"c"+j,
                        counterId:counter_record,
                        name:thistargetname,
                        nodetype:"target",
                        species:species,
                        ens_code:ens_code,
                        geneid: geneid,
                        weight:50,
                        faveColor: "#6DCE9E",
                        faveShape: "ellipse",
                        unified:0
                    }
                });
                
                	tempoedges=[];
              		temponodes=[];  
              		noedges=0;            
            }
            i++;
            j++;
        }
        counter_record++;
    }   


//unificate demoNodes with same name (source and target), changing the id on the relative demoEdges

//source unification
for(i=0; i<nodes.length; i++) {
	if(nodes[i].data.nodetype != "node")
		continue;
		
	if(nodes[i].data.unified==1)
		continue;

	for(ff=0; ff<nodes.length; ff++)
		if(nodes[ff].data.nodetype == "node")
			if(nodes[ff].data.name == nodes[i].data.name)
				nodes[ff].data.unified=1;		
			
			thisindex=demoNodes.length;

            demoNodes.push({
                data:
                 nodes[i].data
            });
				
				
	for(j=0; j<nodes.length; j++) {
	if(i!=j) {
		if(demoNodes[thisindex].data.name == nodes[j].data.name) {
			//i should put all the relative relations to him		
			for(k=0; k<demoEdges.length; k++) {
				if(demoEdges[k].data.source == nodes[j].data.id) {
					demoEdges[k].data.source = demoNodes[thisindex].data.id;				
				}			
			}
		}
		}
	
	
	}


}



//target unification

for(i=0; i<nodes.length; i++) {
	if(nodes[i].data.nodetype != "target")
		continue;
		
	if(nodes[i].data.unified==1)
		continue;
		
	for(ff=0; ff<nodes.length; ff++)
		if(nodes[ff].data.nodetype == "target")
			if(nodes[ff].data.name == nodes[i].data.name)
				nodes[ff].data.unified=1;	
			
			thisindex=demoNodes.length;

            demoNodes.push({
                data:
                 nodes[i].data
            });
				
				
	for(j=0; j<nodes.length; j++) {
	if(i!=j) {
		if(demoNodes[thisindex].data.name == nodes[j].data.name) {
			//i should put all the relative relations to him		
			for(k=0; k<demoEdges.length; k++) {
				if(demoEdges[k].data.target == nodes[j].data.id) {
					demoEdges[k].data.target = demoNodes[thisindex].data.id;				
				}			
			}
		}		
		}
	
	
	}


}





    cyd = cytoscape({
        container: document.querySelector('#cy'),
        boxSelectionEnabled: false,
        autounselectify: true,

        style: cytoscape.stylesheet().selector('node').css({
            'width': 'mapData(weight, 40, 80, 20, 60)',
            'shape': 'data(faveShape)',
            'content': 'data(name)',
            'text-valign': 'center',
            'font-size': '12px',
            'color': 'black',
            'background-color': 'data(faveColor)',
            'text-outline-width': 0,
            'text-outline-color': '#888'

        }).selector('edge').css({
            'curve-style': 'bezier',
            'font-size': '8px',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#888',
            'line-color': '#888',
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
   			name: 'cola',
   		   infinite: false,
    			fit: true
        }
    });

    demoNodesAddedName=new Array();
    for(i=0; i<demoNodes.length; i++) {

        isPresent=false;
        for(j=0; j<demoNodesAddedName.length; j++)
            if(demoNodes[i].data.id == demoNodesAddedName[j]) {
                isPresent=true;
                break;//already added
            }

        if(isPresent==true)
            continue;

        if(demoNodes[i].data.nodetype=="node")
            thiscontent = 'Node Name: '+demoNodes[i].data.name+'<br>Node Type: '+demoNodes[i].data.nodetype+'<br>Accession: '+demoNodes[i].data.accession+'<br>Mirbase Link: '+demoNodes[i].data.mirbase_link+'<br>Species: '+demoNodes[i].data.species;
        else
            thiscontent = 'Node Name: '+demoNodes[i].data.name+'<br>Node Type: '+demoNodes[i].data.nodetype+'<br>Gene ID: '+demoNodes[i].data.geneid+'<br>ens_code: '+demoNodes[i].data.ens_code+'<br>Species: '+demoNodes[i].data.species;

        demoNodesAddedName[demoNodesAddedName.length]=demoNodes[i].data.id;

        cyd.$('#'+demoNodes[i].data.id).qtip({
            content: thiscontent,
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            style: {
                classes: 'qtip-bootstrap',
                tip: {
                width: 16,
                height: 8
                }
            }
        });
    }
}