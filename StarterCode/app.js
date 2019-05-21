const svgWidth = 800;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

// function used for updating x-scale const upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}
// function used for updating y-scale const upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    const yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(healthData, d => d[chosenYAxis])
      ])
      .range([height, 0]);
    return yLinearScale;
}

// function used for updating xAxis const upon click on axis label
function renderXAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}
// function used for updating xAxis const upon click on axis label
function renderYAxes(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis, textsGroup) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    textsGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]-.3));
    return circlesGroup;
}
function renderYCircles(circlesGroup, newYScale, chosenYAxis, textsGroup) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    textsGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]-.3));
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        let xlabel = ""
        let ylabel = ""

        if (chosenXAxis === "poverty") {
            xlabel = "poverty"
        }
        else if(chosenXAxis === "income"){
            xlabel = "income"
        }
        else if(chosenXAxis === "age") {
            xlabel = "age"
        }
        
        if (chosenYAxis === "healthcare") {
            ylabel = "healthcare"
        }
        else if(chosenYAxis === "smokes") {
            ylabel = "smokes"
        }
        else if(chosenYAxis === "obesity") {
            ylabel = "obesity"
        } 
        const toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([0, -20])
            .html(d => {
                return (`${d.state}<br>${xlabel}:${chosenXAxis}<br>${ylabel}:${d[chosenYAxis]}%`)
        });

    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data) {
        toolTip.hide(data, this);
    });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
(async function(){
    const healthData = await d3.csv("data.csv");

    // parse data
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // xLinearScale function above csv import
    let xLinearScale = xScale(healthData, chosenXAxis);

    // Create y scale function
    let yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    let yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    let theCircles = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()


    let circlesGroup =  theCircles.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "20px")
        .attr("fill", "blue")
        .attr("opacity", "0.5");

    // append initial text to circles
    let textsGroup = theCircles.append("text")
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[chosenXAxis]-0.3))
        .attr("dy", d => yLinearScale(d[chosenYAxis]-0.3))

    // Create group for  3 x- axis labels
    const xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 10})`);

    const povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    const ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
    
    const incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
  
    // Create group for  3 y- axis labels
    const ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    // append y axis
    const healthLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 50)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");
    
    const smokeLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 30)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Smokes (%)");
    
    const obeseLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 10)
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Obese (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textsGroup);
    
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        let value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis, textsGroup);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textsGroup);
           
            // changes classes to change bold text
            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if(chosenXAxis === "poverty"){
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if(chosenXAxis === "income") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            } 
        }
    });
     // y axis labels event listener
     ylabelsGroup.selectAll("text")
     .on("click", function() {
     // get value of selection
     let value = d3.select(this).attr("value");
     if (value !== chosenYAxis) {

         // replaces chosenXAxis with value
         chosenYAxis = value;
         // console.log(chosenXAxis)

         // functions here found above csv import
         // updates y scale for new data
         yLinearScale = yScale(healthData, chosenYAxis);

         // updates y axis with transition
         yAxis = renderYAxes(yLinearScale, yAxis);

         // updates circles with new y values
         circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis, textsGroup);
        
         // updates tooltips with new info
         circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textsGroup);

         // changes classes to change bold text
         if (chosenYAxis === "obesity") {
             obeseLabel
                 .classed("active", true)
                 .classed("inactive", false);
             smokeLabel
                 .classed("active", false)
                 .classed("inactive", true);
             healthLabel
                 .classed("active", false)
                 .classed("inactive", true);
         }
         else if(chosenYAxis === "smokes"){
             obeseLabel
                 .classed("active", false)
                 .classed("inactive", true);
             smokeLabel
                 .classed("active", true)
                 .classed("inactive", false);
             healthLabel
                 .classed("active", false)
                 .classed("inactive", true);
         }
         else if(chosenYAxis === "healthcare"){
             obeseLabel
                 .classed("active", false)
                 .classed("inactive", true);
             smokeLabel
                 .classed("active", false)
                 .classed("inactive", true);
             healthLabel
                 .classed("active", true)
                 .classed("inactive", false);
         } 
     }
 });
})()