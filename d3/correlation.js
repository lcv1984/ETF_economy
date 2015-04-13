//Set width and height of bars
var margin = {top: 20, right: 20, bottom: 20, left: 30}
var width = 350 - margin.left - margin.right;
var height= 275 - margin.top - margin.bottom;
var barPadding = 0.5;
var simvals;
var series;
var subsimvals;
var country = "Peru";
var index1 = 0;
var index2 = 0;

d3.json("../data/econvar_similarity.json", function(error1, data1) {
  d3.json("../data/econvar_timeseries.json", function(error2, data2) {
    //Import data to JS objects
    simvals = data1;
    series  = data2;

    d3.select("div.country")
      .text(function(d) { return country; });


    //Define filtering functions
    function filterByCountry(obj) {
      if (obj.country == country) {
        return true;
      } else {
        return false;
      }
    }

    function filterByCountryIndex1(obj) {
      if (obj.country == country && obj.iproperty == index1)
      {
        return true;
      }
      else
      {
        return false;
      }
    }


    function filterByCountryIndex2(obj) {
      if (obj.country == country && obj.iproperty == index2)
      {
        return true;
      }
      else
      {
        return false;
      }
    }

    //Get unique list of countries and properties

    var country_dict = {};
    var country_list = [];
    for (var i = 0; i < simvals.length; i++) {
      if (!country_dict[simvals[i].country]) {
        country_list.push(simvals[i].country);
      }
      country_dict[simvals[i].country] = 1;
    }

    var property_dict = {};
    var property_list = [];
    for (var i = 0; i < series.length; i++) {
      if (!property_dict[series[i].property]) {
        property_list.push(series[i].property);
      }
      property_dict[series[i].property] = 1;
    }

    var dropdown_countries = d3.select("#drop-down-countries").append("ul")
      .attr("class","dropdown-menu")
      .attr("role","menu")
      .attr("aria-labelledby","dropdownMenu1");

    dropdown_countries.selectAll("li.country-list")
      .data(country_list)
      .enter()
      .append("li")
      .attr("class","country-list")
      .insert("a")
        .attr("href","#")
        .attr("class", "country-list")
        .text(function(d) { return d; });

    //Filter objects by wanted country and property to be compared
    subsimvals = simvals.filter(filterByCountry);
    subseries1 = series.filter(filterByCountryIndex1);
    subseries2 = series.filter(filterByCountryIndex2);

    d3.select("div.text-property-one")
      .text(function(d) { return subseries1[0].property });

    d3.select("div.text-property-two")
      .text(function(d) { return subseries2[0].property });

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
        .domain(d3.extent(simvals, function(d) { return parseFloat(d.simscore); }))
        .range(["red","white"]);


    xScale.domain([xScale.domain()[0],xScale.domain()[1] + 1]);
    yScale.domain([yScale.domain()[0],yScale.domain()[1] + 1]);
    zScale.domain([0,zScale.domain()[1]]);


    var svg = d3.select("div #heatmap").append("svg")
        .attr("class","svg-heatmap")
        .attr("width",width + margin.top + margin.bottom)
        .attr("height",height + margin.left + margin.right)

    svg.append("g")
        .attr("transform","translate(" + margin.left.toString() + "," + margin.top.toString() + ")");

    svg.selectAll(".tile")
        .data(subsimvals)
        .enter().append("rect")
        .attr("class", "tile")
        .attr("x", function(d) { return xScale(d.index1); })
        .attr("y", function(d) { return yScale(d.index2); })
        .attr("width", dx)
        .attr("height", dy)
        .style("fill", function(d) {
          if (d.simscore < 0) {
            return "black";
          } else {
          return zScale(d.simscore);
          }
        });

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

    //Create timeseries svg element (right element)

    var xScaleTS = d3.scale.linear()
        .domain([1998,2013])
        .range([margin.left,margin.left+width]);

    var yScaleTS = d3.scale.linear()
        .domain([0,1.1])
        .range([margin.top+height,margin.top]);

    var svg2 = d3.select("div #timeseries").append('svg')
        .attr("class","svg-timeseries")
        .attr("width",width + margin.top + margin.bottom)
        .attr("height",height + margin.left + margin.right)

    svg2.append("g")
        .attr("transform","translate(" + margin.left.toString() + "," +
            margin.top.toString() + ")");

    var xytmp1 = [];
    for (var i = 0; i < subseries1[0].years.length; i++) {
      if (subseries1[0].years[i] != "null" & subseries1[0].values[i] != "null")
        {
        xytmp1.push([subseries1[0].years[i],subseries1[0].values[i]]);
        }
    }

    var xytmp2 = [];
    for (var i = 0; i < subseries2[0].years.length; i++) {
      if (subseries2[0].years[i] != "null" & subseries2[0].values[i] != "null")
        {
        xytmp2.push([subseries2[0].years[i],subseries2[0].values[i]]);
        }
    }

    //Normalize y-axes for time series
    var xymax1 = d3.extent(xytmp1, function(d) { return d[1]; });
    var xymax2 = d3.extent(xytmp2, function(d) { return d[1]; });

    var x1scale = d3.scale.linear().domain([xymax1[0],xymax1[1]])
        .range([0,1]);
    var x2scale = d3.scale.linear().domain([xymax2[0],xymax2[1]])
        .range([0,1]);

    for (var i = 0; i < xytmp1.length; i++) {
        xytmp1[i][1] = x1scale(xytmp1[i][1]);
    }
    for (var i = 0; i < xytmp2.length; i++) {
        xytmp2[i][1] = x2scale(xytmp2[i][1]);
    }


    svg2.selectAll("circle.prop1")
        .data(xytmp1)
        .enter().append("circle")
        .attr("class","prop1")
        .attr("r", function(d) { return 3.0; })
        .attr("cx", function(d) { return xScaleTS(d[0]); })
        .attr("cy", function(d) { return yScaleTS(d[1]); })
        .style("fill", "rgba(83, 213, 77, 1.0)");


    svg2.selectAll("circle.prop2")
        .data(xytmp2)
        .enter().append("circle")
        .attr("class","prop2")
        .attr("r", function(d) { return 3.0; })
        .attr("cx", function(d) { return xScaleTS(d[0]); })
        .attr("cy", function(d) { return yScaleTS(d[1]); })
        .style("fill", "rgba(78, 139, 213, 1.0)");

    var xAxisTS = d3.svg.axis()
        .scale(xScaleTS)
        .ticks(6)
        .tickSize(5)
        .orient("bottom");

    var yAxisTS = d3.svg.axis()
        .scale(yScaleTS)
        .ticks(5)
        .tickSize(5)
        .orient("left");

    svg2.append("g")
        .attr("class","x axis")
        .attr("transform","translate(0,"+(height+margin.top).toString()+")")
        .call(xAxisTS)
        .append("text")
        .attr("x", function(d) { return width/2.; })
        .attr("y", function(d) { return 30; })
        .text("Time (Year)");

    svg2.append("g")
        .attr("class","y axis")
        .attr("transform","translate("+(margin.left).toString()+",0)")
        .call(yAxisTS)


    dropdown_countries.selectAll("a.country-list")
      .on("click", function(d) {
        country = d3.select(this).property("text");

        //Update country div
        d3.select("div.country")
          .text(function(d) { return country; });

        subsimvals = simvals.filter(filterByCountry);
        subseries1 = series.filter(filterByCountryIndex1);
        subseries2 = series.filter(filterByCountryIndex2);

        d3.select("div.text-property-one")
          .text(function(d) { return subseries1[0].property });

        d3.select("div.text-property-two")
          .text(function(d) { return subseries2[0].property });
        /*nvars = d3.max(simvals, function(d) { return parseInt(d.index1); }) + 1;
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
        zScale.domain([0,zScale.domain()[1]]);

        var svg = d3.select("div #heatmap").append("svg")
            .attr("class","svg-heatmap")
            .attr("width",width + margin.top + margin.bottom)
            .attr("height",height + margin.left + margin.right)

        svg.append("g")
            .attr("transform","translate(" + margin.left.toString() + "," + margin.top.toString() + ")");*/

        svg.selectAll(".tile").data([]).exit().remove();

        svg.selectAll(".tile")
            .data(subsimvals)
            .enter().append("rect")
            .attr("class", "tile")
            .attr("x", function(d) { return xScale(d.index1); })
            .attr("y", function(d) { return yScale(d.index2); })
            .attr("width", dx)
            .attr("height", dy)
            .style("fill", function(d) {
              if (d.simscore < 0) {
                return "black";
              } else {
              return zScale(d.simscore);
              }
            });

            svg.selectAll(".tile")
                .on("mouseover", function(d) {
                    d3.select(this)
                      .style("fill", function(d) { return "blue"; });
                    index1 = xScale.invert(d3.select(this).attr("x"));
                    index2 = yScale.invert(d3.select(this).attr("y"));

                    subseries1 = series.filter(filterByCountryIndex1);
                    subseries2 = series.filter(filterByCountryIndex2);

                    d3.select("div.text-property-one")
                      .text(function(d) { return subseries1[0].property });

                    d3.select("div.text-property-two")
                      .text(function(d) { return subseries2[0].property });

                    //Update timeseries svg element
                    xytmp1 = [];
                      for (var i = 0; i < subseries1[0].years.length; i++) {
                        if (subseries1[0].years[i] != "null" & subseries1[0].values[i] != "null")
                          {
                          xytmp1.push([subseries1[0].years[i],subseries1[0].values[i]]);
                          }
                      }

                    xytmp2 = [];
                      for (var i = 0; i < subseries2[0].years.length; i++) {
                        if (subseries2[0].years[i] != "null" & subseries2[0].values[i] != "null")
                          {
                          xytmp2.push([subseries2[0].years[i],subseries2[0].values[i]]);
                          }
                      }

                    //Normalize y-axes for time series
                    xymax1 = d3.extent(xytmp1, function(d) { return d[1]; });
                    xymax2 = d3.extent(xytmp2, function(d) { return d[1]; });

                    x1scale = d3.scale.linear().domain([xymax1[0],xymax1[1]])
                          .range([0,1]);
                    x2scale = d3.scale.linear().domain([xymax2[0],xymax2[1]])
                          .range([0,1]);

                    for (var i = 0; i < xytmp1.length; i++) {
                        xytmp1[i][1] = x1scale(xytmp1[i][1]);
                    }
                    for (var i = 0; i < xytmp2.length; i++) {
                        xytmp2[i][1] = x2scale(xytmp2[i][1]);
                    }

                    svg2.selectAll("circle").data([]).exit().remove();

                    svg2.selectAll("circle.prop1")
                        .data(xytmp1)
                        .enter().append("circle")
                        .attr("class","prop1")
                        .attr("r", function(d) { return 3.0; })
                        .attr("cx", function(d) { return xScaleTS(d[0]); })
                        .attr("cy", function(d) { return yScaleTS(d[1]); })
                        .style("fill", "rgba(83, 213, 77, 1.0)");

                    svg2.selectAll("circle.prop2")
                        .data(xytmp2)
                        .enter().append("circle")
                        .attr("class","prop2")
                        .attr("r", function(d) { return 3.0; })
                        .attr("cx", function(d) { return xScaleTS(d[0]); })
                        .attr("cy", function(d) { return yScaleTS(d[1]); })
                        .style("fill", "rgba(78, 139, 213, 1.0)");

                })
                .on("mouseout", function(d) {
                    d3.select(this)
                    .style("fill", function(d) {
                      if (d.simscore < 0) {
                        return "black";
                      } else {
                      return zScale(d.simscore);
                      }
                    });
                });

        /*
        //var xAxis = d3.svg.axis()
        //    .scale(xScale)
        //    .ticks(nvars)
        //    .tickSize(0);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height+margin.top).toString() + ")")
            .call(xAxis)
            .append("text")
            .attr("x", function(d) { return width/2.; })
            .attr("y", function(d) { return 30; })
            .text("Economic Variable"); */

        //Create timeseries svg element (right element)

        /*
        var xScaleTS = d3.scale.linear()
            .domain([1998,2013])
            .range([margin.left,margin.left+width]);

        var yScaleTS = d3.scale.linear()
            .domain([0,1.1])
            .range([margin.top+height,margin.top]);*/

            xytmp1 = [];
              for (var i = 0; i < subseries1[0].years.length; i++) {
                if (subseries1[0].years[i] != "null" & subseries1[0].values[i] != "null")
                  {
                  xytmp1.push([subseries1[0].years[i],subseries1[0].values[i]]);
                  }
              }

            xytmp2 = [];
              for (var i = 0; i < subseries2[0].years.length; i++) {
                if (subseries2[0].years[i] != "null" & subseries2[0].values[i] != "null")
                  {
                  xytmp2.push([subseries2[0].years[i],subseries2[0].values[i]]);
                  }
              }

            //Normalize y-axes for time series
            xymax1 = d3.extent(xytmp1, function(d) { return d[1]; });
            xymax2 = d3.extent(xytmp2, function(d) { return d[1]; });

            x1scale = d3.scale.linear().domain([xymax1[0],xymax1[1]])
                  .range([0,1]);
            x2scale = d3.scale.linear().domain([xymax2[0],xymax2[1]])
                  .range([0,1]);

            for (var i = 0; i < xytmp1.length; i++) {
                xytmp1[i][1] = x1scale(xytmp1[i][1]);
            }
            for (var i = 0; i < xytmp2.length; i++) {
                xytmp2[i][1] = x2scale(xytmp2[i][1]);
            }

            svg2.selectAll("circle").data([]).exit().remove();

            svg2.selectAll("circle.prop1")
                .data(xytmp1)
                .enter().append("circle")
                .attr("class","prop1")
                .attr("r", function(d) { return 3.0; })
                .attr("cx", function(d) { return xScaleTS(d[0]); })
                .attr("cy", function(d) { return yScaleTS(d[1]); })
                .style("fill", "rgba(83, 213, 77, 1.0)");

            svg2.selectAll("circle.prop2")
                .data(xytmp2)
                .enter().append("circle")
                .attr("class","prop2")
                .attr("r", function(d) { return 3.0; })
                .attr("cx", function(d) { return xScaleTS(d[0]); })
                .attr("cy", function(d) { return yScaleTS(d[1]); })
                .style("fill", "rgba(78, 139, 213, 1.0)");

      });


      ////////////////////////////////////////////////////////////////////

    //highlight box when mouseover
    svg.selectAll(".tile")
        .on("mouseover", function(d) {
            d3.select(this)
              .style("fill", function(d) { return "blue"; });
            index1 = xScale.invert(d3.select(this).attr("x"));
            index2 = yScale.invert(d3.select(this).attr("y"));

            subseries1 = series.filter(filterByCountryIndex1);
            subseries2 = series.filter(filterByCountryIndex2);

            d3.select("div.text-property-one")
              .text(function(d) { return subseries1[0].property });

            d3.select("div.text-property-two")
              .text(function(d) { return subseries2[0].property });

            //Update timeseries svg element
            xytmp1 = [];
              for (var i = 0; i < subseries1[0].years.length; i++) {
                if (subseries1[0].years[i] != "null" & subseries1[0].values[i] != "null")
                  {
                  xytmp1.push([subseries1[0].years[i],subseries1[0].values[i]]);
                  }
              }

            xytmp2 = [];
              for (var i = 0; i < subseries2[0].years.length; i++) {
                if (subseries2[0].years[i] != "null" & subseries2[0].values[i] != "null")
                  {
                  xytmp2.push([subseries2[0].years[i],subseries2[0].values[i]]);
                  }
              }

            //Normalize y-axes for time series
            xymax1 = d3.extent(xytmp1, function(d) { return d[1]; });
            xymax2 = d3.extent(xytmp2, function(d) { return d[1]; });

            x1scale = d3.scale.linear().domain([xymax1[0],xymax1[1]])
                  .range([0,1]);
            x2scale = d3.scale.linear().domain([xymax2[0],xymax2[1]])
                  .range([0,1]);

            for (var i = 0; i < xytmp1.length; i++) {
                xytmp1[i][1] = x1scale(xytmp1[i][1]);
            }
            for (var i = 0; i < xytmp2.length; i++) {
                xytmp2[i][1] = x2scale(xytmp2[i][1]);
            }

            svg2.selectAll("circle").data([]).exit().remove();

            svg2.selectAll("circle.prop1")
                .data(xytmp1)
                .enter().append("circle")
                .attr("class","prop1")
                .attr("r", function(d) { return 3.0; })
                .attr("cx", function(d) { return xScaleTS(d[0]); })
                .attr("cy", function(d) { return yScaleTS(d[1]); })
                .style("fill", "rgba(83, 213, 77, 1.0)");

            svg2.selectAll("circle.prop2")
                .data(xytmp2)
                .enter().append("circle")
                .attr("class","prop2")
                .attr("r", function(d) { return 3.0; })
                .attr("cx", function(d) { return xScaleTS(d[0]); })
                .attr("cy", function(d) { return yScaleTS(d[1]); })
                .style("fill", "rgba(78, 139, 213, 1.0)");

        })
        .on("mouseout", function(d) {
            d3.select(this)
            .style("fill", function(d) {
              if (d.simscore < 0) {
                return "black";
              } else {
              return zScale(d.simscore);
              }
            });
        });

  });
});
