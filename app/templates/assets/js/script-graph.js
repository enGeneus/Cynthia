var cy = cytoscape({
  container: document.querySelector('#cy'),

  boxSelectionEnabled: false,
  autounselectify: true,




  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'width': 'mapData(weight, 40, 80, 20, 60)',      
        'shape': 'data(faveShape)',
        'content': 'data(name)',
        'text-valign': 'center',
        'color': 'white',
        'background-color': 'data(faveColor)',        
        'text-outline-width': 2,
        'text-outline-color': '#000'
      })
    .selector('edge')
      .css({
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#900',
        'line-color': '#900',
        'width': 1,
        'label': 'data(label)'
      })
    .selector(':selected')
      .css({
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      })
    .selector('edge.autorotate')
      .css({
        'edge-text-rotation': 'autorotate'
      })      
    .selector('.faded')
      .css({
        'opacity': 0.25,
        'text-opacity': 0
      }),

  elements: {
    nodes: [
      { data: { id: 'j', name: 'Jerrye', weight: 65, faveColor: '#001122', faveShape: 'rectangle' } },
      { data: { id: 'e', name: 'Elaine', weight: 65, faveColor: '#6FB1FC', faveShape: 'triangle' } },
      { data: { id: 'k', name: 'Kramer', weight: 65, faveColor: '#6FB1FC', faveShape: 'triangle' } },
      { data: { id: 'g', name: 'George', weight: 65, faveColor: '#6FB1FC', faveShape: 'triangle' } }
    ],
    edges: [
      { data: { source: 'j', target: 'e' } },
      { data: { source: 'j', target: 'k' } },
      { data: { source: 'j', target: 'g' } },
      { data: { source: 'e', target: 'j' } },
      { data: { source: 'e', target: 'k' } },
      { data: { source: 'k', target: 'j' } },
      { data: { source: 'k', target: 'e' } },
      { data: { source: 'k', target: 'g' } },
      { data: { source: 'g', target: 'j', label: 'autorotate (move my nodes)' }, classes: 'autorotate' }
    ]
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