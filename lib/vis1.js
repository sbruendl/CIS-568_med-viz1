const svg = d3.select("#vis1-tab-pane").append("svg")
svg.attr("viewBox", "0 0 1300 1000")
    .attr("height", "100%")
    .attr("width", "100%")
    .append("g")

let countiesMap = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers-counties.json";
let stateMap = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

Promise.all([d3.json(countiesMap), d3.json(stateMap)]).then(main)

function main(data) {
    //d3.json("https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers-counties.json").then(data=>{

    console.log(data)
    const counties = topojson.feature(data[0], data[0].objects.collection).features.filter(function (d) { return d.properties.state_fips == "25" || d.properties.state_fips == "23" || d.properties.state_fips == "33" || d.properties.state_fips == "50" || d.properties.state_fips == "44" || d.properties.state_fips == "09"; })
    console.log(counties)

    const states = topojson.feature(data[1], data[1].objects.states).features.filter(function (d) { return d.id == "25" | d.id == "33" | d.id == "09" | d.id == "23" | d.id == "44" | d.id == "50" })

    console.log(states)

    const projection = d3.geoAlbersUsa().scale(8000).translate([-2000, 1600])
    const path = d3.geoPath().projection(projection)


    //console.log(topocounties)

    svg.selectAll(".states")
        .data(states)
        .enter()
        .append("path")
        .attr("class", "states")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "2.5")

    svg.selectAll(".counties")
        .data(counties)
        .enter()
        .append("path")
        .attr("class", "counties")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "0.5")
}