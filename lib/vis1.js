const tooltip = d3.select("#vis1-tab-pane").append("div")
tooltip.attr("id", "tooltip")

const svg = d3.select("#vis1-tab-pane").append("svg")
svg.attr("viewBox", "0 0 1300 1000")
    .attr("height", "100%")
    .attr("width", "100%")
    .attr("id", "geo")
    .append("g")

let geoJson = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers-counties.json";
let arboDataCsv = "../data/arbodata.csv"
let projection = d3.geoAlbersUsa()
    .scale(29000).translate([-8600, 3500])
Promise.all([d3.json(geoJson),
        d3.csv(arboDataCsv, (d)=> {
            if (d.state == "Massachusetts"){ return d }
        })
    ], // asynchronous load of both data sources using promise.all()
    d3.autoType())                              // Auto formatting data
    .then(main)

function main(data){
    const geoJson = topojson.feature(data[0], data[0].objects.collection).features.filter((d)=>{ return d.properties.state_fips == "25" })
    let geoGenerator = d3.geoPath().projection(projection);
    let arboData = d3.group(data[1],d=>d.fips);
    let casesExtent = d3.extent(data[1],d=>Number(d.cases))
    console.log(arboData)
    casesExtent[0]=1
    let colorScale = d3.scaleLinear()
        .domain(casesExtent)
        .range(["red", "green"])
    console.log(colorScale)
    let mapCanvas = svg.append('g')
    mapCanvas.selectAll('path')
        .data(geoJson)
        .enter()
        .append('path')
        .attr("class","path_geo")
        .attr("d",geoGenerator)
        .attr("fill","white")
        .on("mousemove", (mouseData,d)=>{
            d3.select('#tooltip')
                .style("opacity",.8)
                .style("left",(mouseData.clientX+10).toString()+"px")
                .style("top",(mouseData.clientY+10).toString()+"px")
                .html(`<div class='tooltipData'>
                        County: ${arboData.get(d.properties.fips.toString())[0].county}<br>
                        Cases: 2 EEE, 23 WNV
                        </div>
                `)
        })
        .transition()
        .delay((_,i)=>i*2)
        .duration(800)
        .style("fill",d=>{
            try{
                // normal condition
                return colorScale(parseInt(arboData.get(d.properties.fips.toString())[0].cases));
            }
            catch (error)
            {
                // in the case of counties with no data;
                return "white";
            }
        })
    svg
        .call(
            d3.zoom()
                .extent([[0,0],[1000,800]])
                .scaleExtent([0,8])
                .on("zoom",zoomed) // when the zoom even is triggered, zoomed function runs
        )
    function zoomed({transform}){
        mapCanvas.attr("transform",transform); // when zoom function runs, it updates the transform of the mapCancas
    }
}