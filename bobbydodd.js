var width = 880,
    height = 660,
    padding = 40,
    format = d3.format("$.2f"),
    formatLegend = d3.format(".1f"),
    colors = ["#d73027","#ffffbf","#1a9850"],
    missing_color = "#e0e0e0";

function stadium(opponent, day_and_time){
    console.log(opponent + " + " + day_and_time);

    // import and filter R model output data
    d3.csv("/data/export.csv", function(data) {
        // create a new array to store export data for access throughout
        xData = [];
        data.forEach( function(d) {
            // filter by the opponent and day_and_time selected in the dropdowns
            if (d.Opponent == opponent && d.Day_and_Time == day_and_time) {
                xData.push({
                    section: d.Section,
                    Wtp: +d.Wtp,
                    lower: +d.lower_bound,
                    upper: +d.upper_bound,
                    Face: +d.Face,
                    Net: +d.Net
                })
            }
        });

        // create vector linking Wtp to section for filtered data
        wtpVector = {};
        data.forEach(function(d) {
            if (d.Opponent == opponent && d.Day_and_Time == day_and_time) {
                wtpVector[d.Section] = +d.Wtp;
            }
        });

        // create vector linking lower_bound to section for filtered data
        lowerVector = {};
        data.forEach(function(d) {
            if (d.Opponent == opponent && d.Day_and_Time == day_and_time) {
                lowerVector[d.Section] = +d.lower_bound;
            }
        });

        // create vector linking upper_bound to section for filtered data
        upperVector = {};
        data.forEach(function(d) {
            if (d.Opponent == opponent && d.Day_and_Time == day_and_time) {
                upperVector[d.Section] = +d.upper_bound;
            }
        });

        // create vector linking upper_bound to section for filtered data
        faceVector = {};
        data.forEach(function(d) {
            if (d.Opponent == opponent && d.Day_and_Time == day_and_time) {
                faceVector[d.Section] = +d.Face;
            }
        });

        // create vector linking upper_bound to section for filtered data
        netVector = {};
        data.forEach(function(d) {
            if (d.Opponent == opponent && d.Day_and_Time == day_and_time) {
                netVector[d.Section] = +d.Net;
            }
        });

        // create opponent and day_and_time lists for filter dropdowns
        opponent_list = d3.map(data, function(d) { return d.Opponent }).keys();
        opponent_list.unshift("Select Opponent");
        day_and_time_list = d3.map(data, function(d) { return d.Day_and_Time }).keys();

        createStadium();
    });
}

function createStadium() {

    var svg = d3.select("body")
        .append("svg")
        .attr("class", "stadium")
        .attr("height", height)
        .attr("width", width);

    // create opponent filter dropdown
    d3.select("#opponentSelector")
        .attr("class", "select-selected")
        .selectAll("option")
        .data(opponent_list)
        .enter()
        .append("option")
        .attr("value", function(d) { return d })
        .text(function(d){ return d });

    // create day_and_time filter dropdown
    d3.select("#day_and_timeSelector")
        .attr("class", "select-selected")
        .selectAll("option")
        .data(day_and_time_list)
        .enter()
        .append("option")
        .attr("value", function(d) { return d })
        .text(function(d){ return d });

    // if new opponent is selected - update vis
    var opponentSelector = d3.select("#opponentSelector")
        .on("change", opponentFilter);

    // if new day_and_time is selected - update vis
    var day_and_timeSelector = d3.select("#day_and_timeSelector")
        .on("change", day_and_timeFilter);

    // tooltip for displaying section, Wtp and lower/upper bound info on hover
    var tip = d3.tip()
        .attr('class', 'tooltip')
        .offset([0, 0])
        .direction("s")
        .html(function(d) { return "<span>Section: </span>" + d.section_name + "<br />" + "<span>WTP: </span>" + format(d.Wtp) + "<br />" + "<span>Bounds: </span>" + format(d.lower_bound) + " - " + format(d.upper_bound) + "<br />" + "<span>Face: </span>" + format(d.Face) + "<br />" + "<span>Net WTP: </span>" + format(d.Net) });

    var tipNull = d3.tip()
        .attr('class', 'tooltip')
        .offset([0, 0])
        .direction("e")
        .html(function(d) { return "<span>Section: </span>" + d.section_name });

    // bind the tooltip to the svg
    svg.call(tip);
    svg.call(tipNull);

    // linear gradient color scale
    // scaling multiplier
    var scalingMultiplier = 225/(d3.max(xData, function(d) { return d.Net }) +  -1*d3.min(xData, function(d) { return d.Net }));

    // color scale
    var colorScale = d3.scale.linear()
        .domain([d3.min(xData, function(d) { return d.Net }), 0, d3.max(xData, function(d) { return d.Net }) ])
        .range(colors);

    // axis scale
    var tickScale = d3.scale.linear()
        .domain([d3.min(xData, function(d) { return d.Net }), d3.max(xData, function(d) { return d.Net }) ])
        .range([0, (d3.max(xData, function(d) { return d.Net }) - d3.min(xData, function(d) { return d.Net }))*scalingMultiplier ]);

    // create legend object
    var legend = svg.append("g");

    // legend variables
    var legendY = padding + (height/9)*8;
    var legendX = padding;
    var legendHeight = 17.5;

    // Gradient definitions
    var defs = legend.append('defs');

    var gradient1 = defs.append('linearGradient')
        .attr('id', 'gradient1');

    var gradient2 = defs.append('linearGradient')
        .attr('id', 'gradient2');

    // Gradient 1 stop 1
    gradient1.append('stop')
        .attr('stop-color', colorScale(d3.min(xData, function(d) { return d.Net })))
        .attr('offset', '0%');

    // Gradient 1 stop 2
    gradient1.append('stop')
        .attr('stop-color', colorScale(0))
        .attr('offset', '100%');

    // Gradient 2 stop 1
    gradient2.append('stop')
        .attr('stop-color', colorScale(0))
        .attr('offset', '0%');

    // Gradient 2 stop 2
    gradient2.append('stop')
        .attr('stop-color', colorScale(d3.max(xData, function(d) { return d.Net })))
        .attr('offset', '100%');

    // Gradient 1 rect
    legend.append('rect')
        .attr("x", legendX )
        .attr("y", legendY )
        .attr('id', 'gradient1-bar')
        .attr('fill', 'url(#gradient1)')
        .attr('width', (-1*d3.min(xData, function(d) { return d.Net }))*scalingMultiplier)
        .attr('height', legendHeight);

    // Gradient 2 rect
    legend.append('rect')
        .attr("x", legendX )
        .attr("y", legendY )
        .attr('id', 'gradient2-bar')
        .attr('fill', 'url(#gradient2)')
        .attr('transform', 'translate(' + (-1*d3.min(xData, function(d) { return d.Net }))*scalingMultiplier + ',0)')
        .attr('width', (d3.max(xData, function(d) { return d.Net }) - 0)*scalingMultiplier)
        .attr('height', legendHeight);

    // color scale axis
    var axis = d3.svg.axis()
        .scale(tickScale)
        .tickFormat(d3.format('.1f'))
        .tickValues([d3.min(xData, function(d) { return d.Net }), d3.max(xData, function(d) { return d.Net })]);

    // add color scale axis element
    legend.append('g').attr('class', 'axis');

    // select color scale axis element and append
    legend.selectAll('.axis')
        .attr('transform', 'translate(' + legendX + ',' + (12.5 + legendY) +')')
        .style("display", function(d) { return d3.select("#opponentSelector").property("value") == "Select Opponent" ? 'none' : null })
        .call(axis);

    legend.append('line')
        .attr('class', 'legend_line')
        .attr('x1', legendX)
        .attr('y1', legendY-1.5)
        .attr('x2', legendX)
        .attr('y2', (legendY)+(legendHeight+3))
        .style("display", function(d) { return d3.select("#opponentSelector").property("value") == "Select Opponent" ? 'none' : null })
        .attr('transform', 'translate(' + (-1*d3.min(xData, function(d) { return d.Net }))*scalingMultiplier + ',0)');

    // add legend title
    legend.append("text")
        .attr("x", legendX )
        .attr("y", legendY - 7 )
        .attr("class", "legendTitle")
        .style("display", function(d) { return d3.select("#opponentSelector").property("value") == "Select Opponent" ? 'none' : null })
        .text("Net Difference");

    // add North section label
    svg.append("text")
        .attr("class", "standLabel")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (padding/3*2) + "," + (height/2) + ")")
        .text("North");

    // add South section label
    svg.append("text")
        .attr("class", "standLabel")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width/10*9+padding/4) + "," + (height/2) + ")")
        .text("South");

    // add East section label
    svg.append("text")
        .attr("class", "standLabel")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width/10*5+padding) + "," + padding + ")")
        .text("East");

    // add West section label
    svg.append("text")
        .attr("class", "standLabel")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width/10*5+padding) + "," + (height/11*10+padding/4) + ")")
        .text("West");

    // add in image of grant_field
    var img = svg.selectAll("image").data([0]);
    img.enter()
        .append("svg:image")
        .attr("xlink:href", "/images/grant_field.png")
        .attr("x", width/7*2)
        .attr("y", height/7*2)
        .attr("width", "460")
        .attr("height", "210");

    d3.json("/data/sections.json", function(sections) {

        // attach the Wtp, lower and upper bound, face, and net info to the sections dataset on section_name
        sections.forEach(function(d) { d.Wtp = wtpVector[d.section_name] });
        sections.forEach(function(d) { d.lower_bound = lowerVector[d.section_name] });
        sections.forEach(function(d) { d.upper_bound = upperVector[d.section_name] });
        sections.forEach(function(d) { d.Face = faceVector[d.section_name] });
        sections.forEach(function(d) { d.Net = netVector[d.section_name] });

        // draw each section and color
        svg.append("g")
            .selectAll("path")
            .data(sections)
            .enter()
            .append("path")
            .attr("class", "svg_sections")
            .attr("transform", "translate(" + padding + "," + 0 + ")")
            .attr("d", function(d) { return d.block; })
            .attr("fill", function(d) {
                if(d.Wtp != null) {
                    return colorScale(d.Net);
                } else {
                    return missing_color;
                }
            })
            .on("mouseover", function(d) {
                if(d.Wtp != null) {
                    tip.show(d);
                } else {
                    tipNull.show(d);
                }
            })
            // } ? tip.show(d) : tipNull.show(d) })
            .on("mouseout", function(d) {
                if(d.Wtp != null) {
                    tip.hide(d);
                } else {
                    tipNull.hide(d);
                }
            });

    })

}

// if opponent is changed - redraw stadium with new opponent but previous day_and_time
function opponentFilter() {
    var filterData = d3.select(this).property("value");
    var day_and_timeData = d3.select("#day_and_timeSelector").property("value");
    d3.select("svg").remove();
    stadium(filterData, day_and_timeData);
}

// if day_and_time is changed - redraw stadium with new day_and_time but previous opponent
function day_and_timeFilter() {
    var opponentData = d3.select("#opponentSelector").property("value");
    var filterData = d3.select(this).property("value");
    d3.select("svg").remove();
    stadium(opponentData, filterData);
}
