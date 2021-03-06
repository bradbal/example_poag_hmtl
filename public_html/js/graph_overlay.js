/**
 * Gets called once before the graphs are to be setup and gets the SVG based
 * on the ID that a user has specified
 */
setup_graph_overlay = function (options) {
    var svg = options.svg_overlay; //d3.select(document.getElementById(options.svg_id));
    var x = d3.scale.ordinal()
            .rangeRoundBands([0, options.width / options.div_factor], .5);

    var y = d3.scale.linear()
            .range([options.graph_height/ options.div_factor, 0]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(2);
    //options.svg_overlay = svg;
    options.x = x;
    options.y = y;
    options.xAxis = xAxis;
    options.yAxis = yAxis;
}

function create_outer_circle(node, options, graph_group) {
    var circle = graph_group.append("circle")
            .attr("class", "outside")
            .attr("id", function () {
                return "node-" + node;
            })
            .attr("cx", options.size / 2 - 12)
            .attr("cy", options.size / 2 - 2)
            .attr("r", options.graph_outer_circle_radius)
            .attr("stroke-width", 3)
            .attr("stroke", options.graph_outer_circle_colour)
            .attr("opacity", options.graph_outer_circle_opacity)
            .attr("fill", options.graph_outer_circle_colour);
}


function create_rect(node, options, graph_group) {

    graph_group.append("rect")
            .attr("class", function () {
                return "outline";
            })
            .attr("x", function () {
                return options.offset_graph_width;
            }) //Need to determine algoritm for determineing this
            .attr("width", (options.size * 2) + options.offset_graph_width)
            .attr("y", function () {
                return options.offset_graph_height;
            })
            .attr("height", function () {
                return options.graph_height - (2 * options.offset_graph_height);
            });
}

/**
 * Adds a title to the chart
 */
function create_node_title(node, options, graph_group) {
    var title = graph_group.append("text")
             .attr("y", -10)
             .attr("x", options.width /2 - 10)
             .style("font-size", "15px")
             .style("font-weight", "700")
             .style("text-anchor", "center")
             .text(node.start);
}

function create_axis(node, options, graph_group) {
    var axisgroup = graph_group.append("g")
            .attr("class", "y axis")
            .attr("transform", function () {
                w = 0;
                return "translate(" + w + ",0)";
            })
            .call(options.yAxis);
    // Conditionally displays the axis text (i.e. the tags on the axis)
    if (options.display_axis_text == true) {
         axisgroup.append("text")
             .attr("y", -10)
             .attr("x", options.offset_graph_width + 25)
             .attr("dy", ".71em")
             .text(node.name);
    }
}

function create_bars(node, options, graph_group) {
    var num_bars = Object.keys(node.graph.bars).length; //options.max_bar_count;
    var size = options.size;
    var y = options.y;
    var padding_x = 0;
    var outer_padding = 1;
    var formatDetails = [num_bars, size, y, padding_x, outer_padding];

    // Just to make it look  nicer if there is only one bar we want it to look nicer
    if (num_bars == 1) {
        padding_x = size/6.0;
    }
    var bar_sum = 0;
    for (var bar in node.graph.bars) {
        bar_info = node.graph.bars[bar];
        bar_sum += bar_info.value;
    }
    for (var bar in node.graph.bars) {
        bar_info = node.graph.bars[bar];

	//if has poagValues indicates need to draw stacked bar for fused graph
	if (!bar_info.hasOwnProperty("poagValues")){
	    create_bar(bar, bar_info, bar_sum, formatDetails, options, graph_group); 

	} else {
	    
	    create_stackedbar(bar, bar_info, bar_sum, formatDetails, options, graph_group);
	}

    // Conditionally displays the labels at the bottom as text
    if (options.display_axis_text == true) {
        graph_group.append("text")
                .attr("class", "y axis")
                .attr("x", function () {
                    return (2 * padding_x) + bar * (options.size / num_bars);
                }) //Need to determine algoritm for determineing this
                .attr("y", options.graph_height + 10)
                .text(bar_info.label);
        }
    }
}


/*
* Creates a stacked bar from the poag info for a fused graph
*/
function create_stackedbar(bar, bar_info, bar_sum, formatDetails, options, graph_group){
    var num_bars = formatDetails[0]; //options.max_bar_count;
    var size = formatDetails[1];
    var y = formatDetails[2];
    var padding_x = formatDetails[3];
    var outer_padding = formatDetails[4];

    //keeping track where to put the next bar 
    var previousY = 0;
    
    var subVals = bar_info.poagValues;
    i = 0;

    //this color object need work, tried to get into options but couldn't, need to ask Ariane
    var colors = {"poag1": "red", "poag2": "blue", "poag3": "yellow", "poag4": "orange", "poag5": "green"};
    for (var subVal in subVals) {

	var heightValue = y(subVals[subVal]/100);
	previousY = y((subVals[subVal])*(i+1)/100);

	graph_group.append("rect")
                .attr("class", function () {
                    return "bar";
                })
                .attr("x", function () {
                    return outer_padding + padding_x + (bar * (size / num_bars)); /* where to place it */
                }) //Need to determine algoritm for determineing this
                .attr("width", (size / num_bars) - (3 * padding_x) - outer_padding/2)
                .attr("y", function () {
                    return previousY;
                })
                .attr("height", function () {
                    // As the number is out of 100 need to modulate it
                    return options.graph_height - heightValue;
                })
                .attr("fill", colors[subVal]);
	
	i++;
    }
} 

/*
* Creates a single bar for an inputted bar object from an unfused poag
*/
function create_bar(bar, bar_info, bar_sum, formatDetails, options, graph_group) {
    var num_bars = formatDetails[0]; //options.max_bar_count;
    var size = formatDetails[1];
    var y = formatDetails[2];
    var padding_x = formatDetails[3];
    var outer_padding = formatDetails[4];

    graph_group.append("rect")
                .attr("class", function () {
                    return "bar";
                })
                .attr("x", function () {
                    return outer_padding + padding_x + (bar * (size / num_bars)); /* where to place it */
                }) //Need to determine algoritm for determineing this
                .attr("width", (size / num_bars) - (3 * padding_x) - outer_padding/2)
                .attr("y", function () {
                    return y(bar_info.value/bar_sum);
                })
                .attr("height", function () {
                    // As the number is out of 100 need to modulate it
                    return options.graph_height - y(bar_info.value/bar_sum);
                })
                .attr("fill", options.colours[bar_info.label]);
}

/**
 * Apply's transforms to the group to emmulate any wrappers that the user has
 * in their SVG
 */
function apply_transforms(node, options) {
    var svg  = options.svg_overlay;
    var graph_group = svg.append("g");
    var transforms = options.transforms;
    for (var t in transforms) {
        var margin_width = transforms[t].margin_width;
        var margin_height = transforms[t].margin_height;
        graph_group = graph_group.append("g")
            .attr("transform", "translate(" + margin_width +
                    "," + margin_height + ")");
    return graph_group;
    }
}


/**
 * Scale the x and the y that was gotten from the JSON file
 */
scale_x_graph = function (options, x) {
    return (x * options.x_size) + options.x_start;
}

scale_y_graph = function (options, y) {
    return (y * options.y_size) + options.y_start;
}


/**
 * Creating the graphs
 */
create_new_graph = function (node, options, cx, cy) {
    // NEED TO UPDATE THESE OFFSETS IN THE OPTIONS BAD TO HAVE HARD CODED
    var node_cx = cx - 18;//scale_x_graph(options, node.x);
    var node_cy = cy - 25;//scale_y_graph(options, node.y) - options.graph_height / 2;
    options.metabolite_count++;
    var num_bars = options.max_bar_count;
    var svg  = options.svg_overlay;
    var hover_on = options.hover;
    var graph_group = svg.append("g")
            .attr("class", "graph")
            .attr('transform', 'translate(' + node_cx + "," + node_cy + ")")
            .attr("opacity", 0)
            .on("mouseover", function () {
                if (hover_on) {
                    d3.select(this).attr("opacity", 1);
                }
            })
            .on("mouseout", function () {
                if (hover_on) {
                    d3.select(this).attr("opacity", 0);
                }
            });
//            on("click", function () {
//               var my_text = d3.select("#" + "id of the text you want to add");
//                if (my_text.attr("opacity") == "0") {
//                    my_text.attr("opacity", 1);
//                } else {
//                    my_text.attr("opacity", 0);
//                }
//            });
    setup_graph_overlay(options);
    create_outer_circle(node, options, graph_group);
    create_rect(node, options, graph_group);
    // Conditionally draw the axis
    if (options.draw_axis == true) {
        create_axis(node, options, graph_group);
    }
    if (options.draw_position_in_histogram == true) {
        create_node_title(node, options, graph_group);
    }

    create_bars(node, options, graph_group);
    return graph_group;
}
