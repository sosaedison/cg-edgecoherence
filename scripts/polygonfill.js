var view;
var ctx;
var polygons = {
    convex: {
        color: 'red', // choose color here!
        vertices: [
            // {x: 100, y:100},
            // {x: 110, y:300},
            // {x: 300, y:500},
            // {x: 600, y:300},
            // {x: 300, y: 50},
            // {x: 600, y:100}

            {x:100, y:100},
            {x:600, y:150},
            {x:700, y:400},
            {x:500, y:450},
            {x:200, y:350}
            // fill in vertices here!
        ]
    },
    concave: {
        color: '', // choose color here!
        vertices: [
            // fill in vertices here!
        ]
    },
    self_intersect: {
        color: '', // choose color here!
        vertices: [
            // fill in vertices here!
        ]
    },
    interior_hole: {
        color: '', // choose color here!
        vertices: [
            // fill in vertices here!
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
        /**
         * Find x-min and y-min points
         * CHECK FOR HORIZONTAL LINES AND OMIT FROM ET
         */

        var delta_y = vertex_2.y - vertex_1.y;
        var delta_x = vertex_2.x - vertex_1.x;

        var entry = new EdgeEntry(y_max, x_min, delta_x, delta_y);
        
        edge_table[y_min].InsertEdge(entry);
        //console.log(edge_table[y_min]);
        
    }
    //console.log(edge_table)

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

    //add from the edgetable lowest entry to the active list 
    // we have to also add the references to each edgeEntry
    var i;
    var cur_entry;
    var linked_entry;
    for(i = y; i < polygon_y_max; i++) {
        cur_entry = edge_table[i].first_entry
        while(cur_entry !== null) {
            active_list.InsertEdge(cur_entry);
            cur_entry = cur_entry.next_entry;
        }
    }
    active_list.SortList()
    /** 
    var active_entry = active_list.first_entry;
    var i;
    while(active_entry !== null) {

        for(i = y; i < polygon_y_max; i++) {
            if(i === active_entry.y_max) {
                active_list.RemoveCompleteEdges(i);
            }
        }
        active_entry = active_entry.next_entry;
    } 
    **/

    var point;
    var p1, p2;
    point = active_list.first_entry;
    
    while(y !== polygon_y_max) {
        p1 = {
            x: point.x + 1/point.inv_slope,
            y: point.y + 1/point.inv_slope
        }
        p2 = {
            x: point.next_entry.x + 1/point.next_entry.inv_slope,
            y:point.next_entry.y + 1/point.next_entry.inv_slope
        }
        DrawLine(p1.x, p1.y, p2.x, p2.y);
        console.log(p1)
        console.log(p2)
        if(y === point.y_max) {
            active_list.RemoveCompleteEdges(y);  
        } else {
            
        }

        y++;
    }
    console.log(active_list);
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
