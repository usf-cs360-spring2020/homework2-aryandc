
    const svg_width = 960;
    const svg_height = 500;

    var margin = {
      top: 10,
      right: 10,
      bottom: 35,
      left: 50
    };

    // var nx_ticks = 5;
    // var ny_ticks = 5;

    // var padding = 110;

    var width = svg_width - margin.left - margin.right;
    var height = svg_height - margin.top - margin.bottom;    
    var padding = 0;

    var n_rows = 4;
    var n_columns = n_rows;
    
    var space = {
      width: (width + padding) / n_columns,
      height: (height + padding) / n_rows
    }

    var size = (width - 8 * padding) / n_rows;
    console.log("width, size", space.width , space.height);
    

    var x = d3.scaleLinear()
        .range([0, space.width]);

    var y = d3.scaleLinear()
        .range([space.height, 0]);

    var xAxis = d3.axisBottom()
        .scale(x)
        .tickPadding(0)
        .ticks(6)
        .tickFormat(formatter);

    var yAxis = d3.axisLeft()
        .scale(y)
        .tickPadding(0)
        .ticks(6)
        .tickFormat(formatter);

    var color = d3.scaleOrdinal(d3.schemeTableau10);


    // var svg = d3.select("svg#bubble")
    //     .attr("width", svg_width)
    //     .attr("height", svg_height);

    // const color = d3.scaleOrdinal(d3.schemeTableau10);

    // var xAxis = d3.axisBottom();
    // var yAxis = d3.axisLeft();

    // var n_rows = 4;
    // var n_columns = n_rows;
    // var space = {
    //   width: (width - padding) / n_columns,
    //   height: (height - padding) / n_rows
    // }

    d3.csv("mrc_table2.csv", convert).then(draw);
    
    function draw(data) {
  
      console.log("loaded:", data.length, data[0]);

      // filter for only california universities
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
      data = data.filter(row => row.state === "CA");
      console.log("filter:", data.length, data[0]);

      // sort by count so small circles are drawn last
      data.sort((a, b) => b.count - a.count);
      console.log("sorted:", data.length, data[0]);

      var domainByTrait = {},
      traits = d3.keys(data[0]).filter(function(d) {
        return d !== "name" && d !== "state" && d !== "type";
      })
      n = traits.length;

      console.log("traits", traits);

      traits.forEach(function(trait) {
        domainByTrait[trait] = d3.extent(data, function(d) {
          return d[trait];
        });
      });

      
      xAxis.tickSize(margin.top + height);
      yAxis.tickSize(-width - margin.right);


      // var brush = d3.brush()
      //     .on("start", brushstart)
      //     .on("brush", brushmove)
      //     .on("end", brushend)
      //     .extent([[0,0],[size,size]]);


      var svg = d3.select("svg#bubble")
          .attr("width", svg_width)
          .attr("height", svg_height)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.selectAll(".x.axis")
          .data(traits)
          .enter().append("g")
          .attr("class", "x axis")
          .attr("transform", function(d, i) {
            return "translate(" + i * space.width + ",-" + 0  + ")";
          })
          .each(function(d) {
            console.log("x.domain(domainByTrait[d])", domainByTrait[d]);
            x.domain(domainByTrait[d]);
            d3.select(this).call(xAxis);
          })

      svg.selectAll(".y.axis")
          .data(traits)
          .enter().append("g")
          .attr("class", "y axis")
          .attr("transform", function(d, i) { 
            return "translate("+ -margin.right +"," + i * space.height + ")"; 
          })
          .each(function(d) { 
            console.log("y.domain(domainByTrait[d])", domainByTrait[d]);
            y.domain(domainByTrait[d]); 
            d3.select(this).call(yAxis);
          });

      var cell = svg.selectAll(".cell")
          .data(cross(traits, traits))
          .enter().append("g")
          .attr("class", "cell")
          .attr("transform", function(d) { return "translate(" + d.i * space.width + "," + d.j * space.height + ")"; })
          .each(plot);

      cell.filter(function(d) { return d.i === 0; }).append("text")
          .attr("transform", "rotate(-90)")
          .style("font-size", "11px")
          .attr("x", padding)
          .attr("y", padding)
          .attr("dx", -63)
          .attr("dy", -45)
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle')
          // .attr("dy", ".71em")
          .text(function(d) { 
            switch(d.y) {
              case "parMean":
                return "Mean parent Income";

              case "mobility":
                return "Mobility";

              case "income":
                return "Income";

              case "count":
                return "Count";

              default:
                return d.x;
            }
          });

          cell.filter(function(d) { return d.j === 0; }).append("text")
          .style("font-size", "11px")
          .attr("x", padding)
          .attr("y", padding)
          .attr("dx", space.width/2)
          .attr("dy", width/2 + margin.bottom)
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle')
          // .attr("dy", ".71em")
          .text(function(d) { 
            switch(d.x) {
              case "parMean":
                return "Mean parent Income";

              case "mobility":
                return "Mobility";

              case "income":
                return "Income";

              case "count":
                return "Count";

              default:
                return d.x;
            }
          });

      // cell.call(brush);

      function plot(p) {

        var cell = d3.select(this);

        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);

        cell.append("rect")
            .attr("class", "frame")
            // .attr("x", padding / 2)
            // .attr("y", padding / 2)
            // .attr("width", size - padding)
            // .attr("height", size - padding);
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', space.width)
            .attr('height', space.height)

        cell.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function(d) {
              return x(d[p.x]);
            })
            .attr("cy", function(d) {
              return y(d[p.y]);
            })
            .attr("r", 3)
            .style("fill", function(d) {
              return color(d)
            });

        // var brushCell;

        // function brushstart(p) {
        //   if (brushCell !== this) {
        //     d3.select(brushCell).call(brush.move, null);
        //     brushCell = this;

        //     x.domain(domainByTrait[p.x]);
        //     y.domain(domainByTrait[p.y]);
        //   }
        // }

        // // Highlight the selected circles.
        // function brushmove(p) {
        //   var e = d3.brushSelection(this);
        //   svg.selectAll("circle").classed("hidden", function(d) {
        //     return !e
        //       ? false
        //       : (
        //         e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
        //         || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
        //       );
        //   });

        // If the brush is empty, select all circles.
          // function brushend() {
          //   var e = d3.brushSelection(this);
          //   if (e === null) svg.selectAll(".hidden").classed("hidden", false);
          // }

      }

      function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        return c;
      }


    
        console.log("data[0], n", data[0], n);
        

      
      // let key_values = Object.entries(data[0]);

      // let i = 0;

      // for (const [ky, vy] of key_values) {
      //   if (isNaN(Number(vy))) {
      //     continue
      //   }
        
      //   let j = 0;
      //   for (const [kx, vx] of key_values) {
          
      //     if (isNaN(Number(vx))) {
      //       continue;
      //     }
      //     if (kx === 'count') {
		  //       draw_rect_name_left(0, 
			// 					margin.top + i * (space.height + padding / (n_rows - 1)), 
			// 					 ky);
      //     }

      //     if (kx === 'count') {
      //       draw_rect_name_right(margin.left + i * (space.width + padding / (n_columns - 1)), 
			// 					margin.top + j * (space.height + padding / (n_rows - 1)) + 2 * margin.bottom, 
			// 					 ky);
      //     }
      //     // else {
			// 			draw_scatter(data, 
			// 					margin.left + j * (space.width + padding / (n_columns - 1)), 
			// 					margin.top + i * (space.height + padding / (n_rows - 1)), 
			// 					kx, ky)
      //     // }
      //     j++;
      //   }
      //   i++;
      // }
    };

    // function draw_scatter(data, x_start, y_start, attr1, attr2) {

    //   var scale1 = d3.scaleLinear()
    //       .domain(d3.extent(data, d => {
    //         return d[attr1]
    //       }))
    //       .range([0, space.width]);

    //   var scale2 = d3.scaleLinear()
    //   .domain(d3.extent(data, d => {
    //     return d[attr2]
    //   }))
    //   .range([space.height, 0]);
			
    //   xAxis
    //       .scale(scale1)
    //       .ticks(nx_ticks)
    //       .tickFormat(formatter);

    //   yAxis
    //       .scale(scale2)
    //       .ticks(ny_ticks)
    //       .tickFormat(formatter);

    //   svg.selectAll(".x.axis")
    //       .data(traits)
    //       .enter().append("g")
    //       .attr("class", "x axis")
    //       .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
    //       .each(function(d) { xAxis.domain(domainByTrait[d]); d3.select(this).call(xAxis); });
      
    //   var g = svg.append('g')
			
		// 	g.attr('transform', 'translate(' + x_start + ', ' + y_start + ')');

		// 	g.append('rect')
		// 	.attr('x', 0)
		// 	.attr('y', 0)
		// 	.attr('width', space.width)
		// 	.attr('height', space.height)
		// 	.style('fill', 'none')
		// 	.attr('pointer-events', 'all');
		// 	// .on('mousedown', mousedown);

		// 	g.append('g')
		// 	.attr("class", "x-axis")
		// 	.attr("transform", "translate(0," + (space.height) + ")")
		// 	.call(xAxis);

		// 	g.append('g')
		// 	.attr("class", "y-axis")
    //   .call(yAxis);
      
    //   g.selectAll('circle')
		// 	.data(data)
		// 	.enter()
		// 	.append('circle')
		// 	.attr('class', (d, i) => 'circle' + i.toString())
		// 	.attr('cx', d => scale1(d[attr1]))
		// 	.attr('cy', d => scale2(d[attr2]))
		// 	.attr('r', 2)
		// 	.attr('fill', (d, i) => color(d.species));
		// 	// .on('mouseover', mouseover_circle)
		// 	// .on('mouseout', mouseout_circle)

		// 	// if (!legend_made) {
		// 	// 	legend_made = true;
		// 	// 	make_legend();
    //   // }

    // }

    // function draw_rect_name_left(x_start, y_start, attr) {
		// 	var g = svg.append('g')

		// 	g.attr('transform', 'translate(' + x_start + ', ' + y_start + ')')

		// 	g.append('rect')
		// 	.attr('x', 0)
		// 	.attr('y', 0)
		// 	.attr('width', space.width)
		// 	.attr('height', space.height)
		// 	.style('fill', 'none')

    //   g.append('text')
    //   .attr("transform", "rotate(-90)")
    //   .style("font-size", "10px")
		// 	.attr('class', attr + '-text')
		// 	.text(attr)
		// 	.attr('x', space.width/2)
    //   .attr('y', space.height/2)
    //   .attr("dx", - 140)
    //   .attr("dy", -32)
		// 	.attr('dominant-baseline', 'middle')
		// 	.attr('text-anchor', 'middle')
    // }

    // function draw_rect_name_right(x_start, y_start, attr) {
		// 	var g = svg.append('g')

		// 	g.attr('transform', 'translate(' + x_start + ', ' + y_start + ')')

		// 	g.append('rect')
		// 	.attr('x', 0)
		// 	.attr('y', 0)
		// 	.attr('width', space.width)
		// 	.attr('height', space.height)
		// 	.style('fill', 'none')

    //   g.append('text')
    //   .style("font-size", "10px")
		// 	.attr('class', attr + '-text')
		// 	.text(attr)
		// 	.attr('x', space.width/2)
    //   .attr('y', space.height/2)
    //   .attr("dx", +margin.right)
		// 	.attr('dominant-baseline', 'middle')
		// 	.attr('text-anchor', 'middle')
    // }
    

    /*
 * converts values as necessary and discards unused columns
 */
 function convert(row) {
  let keep = {}

  keep.name = row.name;
  keep.state = row.state;

  keep.parMean = parseInt(row.par_mean);
  keep.mobility = parseFloat(row.k_top1pc);
  keep.income = parseFloat(row.k_q1);
  keep.count = parseFloat(row.count);
  keep.type = parseFloat(row.type);

  // keep.parMean = parseInt(row.par_median);
  // keep.mobility = parseFloat(row.k_top1pc);
  // keep.income = parseFloat(row.k_0inc);
  // keep.count = parseFloat(row.mr_kq5_pq1);

  return keep;
}

function formatter(d) {
  let num = parseFloat(d);

  if (num / 1000 >= 1) {
    num = num / 1000;
    return num + ' K'
  } else {
    return num;
  }
}


    function translate(x, y) {
      return 'translate(' + String(x) + ',' + String(y) + ')';
    }


