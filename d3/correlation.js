//Set width and height of bars
var margin = {top: 30, right: 30, bottom: 30, left: 30}
var width = 300 - margin.left - margin.right;
var height= 300 - margin.top - margin.bottom;
var barPadding = 0.5;
var simvals;
var series;
var subsimvals;
var country = "Peru"

d3.json("../data/econvar_similarity.json", function(error1, data1) {
  d3.json("../data/econvar_timeseries.json", function(error2, data2) {
    simvals = data1;
    series  = data2;
    console.log(error1);
    console.log(error2);

    function filterByCountry(obj) {
      if (obj.country == country) {
        return true;
      } else {
        return false;
      }
    }

    subsimvals = simvals.filter(filterByCountry);

    console.log(subsimvals);

    nvars = d3.max(simvals, function(d) { return parseInt(d.index1); }) + 1;
    var dx = width / nvars;
    var dy = width / nvars;

    var xScale = d3.scale.linear()
        .domain(d3.extent(simvals, function(d) { return parseInt(d.index1); }))
        .range([margin.left,margin.left+width]);

    var yScale = d3.scale.linear()
        .domain(d3.extent(simvals, function(d) { return parseInt(d.index1); }))
        .range([margin.top,margin.top+height]);

    var zScale = d3.scale.linear()
        .domain(d3.extent(simvals, function(d) { return parseInt(d.simscore); }))
        .range(["steelblue","white"]);

    xScale.domain([xScale.domain()[0],xScale.domain()[1] + 1]);
    yScale.domain([yScale.domain()[0],yScale.domain()[1] + 1]);

    var svg = d3.select("div #heatmap").append("svg")
        .attr("width",width + margin.top + margin.bottom)
        .attr("height",height + margin.left + margin.right)

    svg.append("g")
        .attr("transform","translate(" + margin.left.toString() + "," + margin.top.toString() + ")");

    svg.selectAll(".tile")
        .data(simvals)
        .enter().append("rect")
        .attr("class", "tile")
        .attr("x", function(d) { return xScale(d.index1); })
        .attr("y", function(d) { return yScale(d.index2); })
        .attr("width", dx)
        .attr("height", dy)
        .style("fill", function(d) {return zScale(d.simscore); });

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(nvars)
        .tickSize(0);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height+margin.top).toString() + ")")
        .call(xAxis)
        .append("text")
        .attr("x", function(d) { return width/2.; })
        .attr("y", function(d) { return 30; })
        .text("Economic Variable");

    //highlight box when mouseover
    svg.selectAll(".tile")
        .on("mouseover", function(d) {
            d3.select(this)
              .style("fill", function(d) { return "blue"; });
            var svg2 = d3.select("div #timeseries").append('svg')
              .attr("width",width + margin.top + margin.bottom)
              .attr("height",height + margin.left + margin.right)

        })
        .on("mouseout", function(d) {
            d3.select(this)
            .style("fill", function(d) { return zScale(d.simscore); });
        });

  });
});
