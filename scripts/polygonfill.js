var view;
var ctx;
var polygons = {
    convex: {
        color: 'red', // choose color here!
        vertices: [
            // fill in vertices here!
            {x:100, y:100},
            {x:400, y:150},
            {x:500, y:500},
            {x:200, y:350},
            
        ]
    },
    concave: {
        color: 'blue', // choose color here!
        vertices: [
            // fill in vertices here!
            {x:100,y:100},
            {x:200,y:200},
            {x:150,y:300},
            {x:400,y:350},
            {x:350,y:75}
            
            
        ]
    },
    self_intersect: {
        color: 'black', // choose color here!
        vertices: [
            // fill in vertices here!
            {x:100,y:100},
            {x:500,y:500},
            {x:450,y:300},
            {x:150,y:450}
        ]
    },
    interior_hole: {
        color: 'green', // choose color here!
        vertices: [
            // fill in vertices here!
            {x:100,y:100},
            {x:300,y:600},
            {x:500,y:50},
            {x:50,y:350},
            {x:400,y:400}
        ]
    }
};

// Init(): triggered when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    SelectNewPolygon();
}

// DrawPolygon(polygon): erases current framebuffer, then draws new polygon
function DrawPolygon(polygon) {
    // Clear framebuffer (i.e. erase previous content)
    ctx.clearRect(0, 0, view.width, view.height);

    // Set line stroke color
    ctx.strokeStyle = polygon.color;

    // Create empty edge table (ET)
    var edge_table = [];
    var i;
    for (i = 0; i < view.height; i++) {
        edge_table.push(new EdgeList());
    }

    // Create empty active list (AL)
    var active_list = new EdgeList();


    // Step 1: populate ET with edges of polygon
    var k;
    var polygon_array = polygon.vertices;
    var vertex_1 = {};
    var vertex_2 = {};
    var polygon_y_max = 0;
    for(k =0; k < polygon_array.length; k++) {
        vertex_1 = {
            x: polygon_array[k].x,
            y: polygon_array[k].y
        }; 
        if(k+1 === polygon_array.length){
            vertex_2 = {
                x: polygon_array[0].x,
                y: polygon_array[0].y
            };
        } else {
            vertex_2 = {
                x: polygon_array[k+1].x,
                y: polygon_array[k+1].y
            };
        }
        var y_max = Math.max(vertex_1.y, vertex_2.y);
        var y_min = Math.min(vertex_1.y, vertex_2.y);
        var x_min = Math.min(vertex_1.x, vertex_2.x);
        if(polygon_y_max < y_max) {
            polygon_y_max = y_max;
        }
        var delta_y = vertex_2.y - vertex_1.y;
        var delta_x = vertex_2.x - vertex_1.x;

        var entry = new EdgeEntry(y_max, x_min, delta_x, delta_y);
        
        edge_table[y_min].InsertEdge(entry);
        console.log(edge_table[y_min]);
        
    }

    // Step 2: set y to first scan line with an entry in ET
    var i;
    var lowest_y = polygon_array[0].y;
    for(i=0; i < polygon_array.length; i++) {
        var temp_y = polygon_array[i].y;
        if(temp_y < lowest_y) {
            lowest_y = temp_y;
        }
    }
    var y = lowest_y;
    
    // Step 3: Repeat until ET[y] is NULL and AL is NULL
    //   a) Move all entries at ET[y] into AL
    //   b) Sort AL to maintain ascending x-value order
    //   c) Remove entries from AL whose ymax equals y
    //   d) Draw horizontal line for each span (pairs of entries in the AL)
    //   e) Increment y by 1
    //   f) Update x-values for all remaining entries in the AL (increment by 1/m)

    var i;
    for(i = y; i < polygon_y_max; i++) {
        var temp_entry = edge_table[i].first_entry;
            while(temp_entry !== null){
                active_list.InsertEdge(temp_entry);
                temp_entry = temp_entry.next_entry;
            }
        active_list.SortList();
        active_list.RemoveCompleteEdges(i); 
        temp_entry = active_list.first_entry;
        while(temp_entry !== null) {
            DrawLine(temp_entry.x, i, temp_entry.next_entry.x, i);
            temp_entry = temp_entry.next_entry.next_entry;
        }
        temp_entry = active_list.first_entry;
        while(temp_entry !== null) {
            temp_entry.x = temp_entry.x + temp_entry.inv_slope;
            temp_entry = temp_entry.next_entry;
        }
    }
}

// SelectNewPolygon(): triggered when new selection in drop down menu is made
function SelectNewPolygon() {
    var polygon_type = document.getElementById('polygon_type');
    DrawPolygon(polygons[polygon_type.value]);
}

function DrawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}