const tooltip = d3.select("#vis1-tab-pane").append("div")
tooltip.attr("id", "tooltip")

let geoJson = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/united-states/us-albers-counties.json";
let arboDataCsv = "../data/Data_WNV.csv"
let fipsByState = "https://raw.githubusercontent.com/kjhealy/us-county/master/data/census/fips-by-state.csv"

Promise.all([d3.json(geoJson),
        d3.csv(arboDataCsv, (d) => {
            if (d.State.match(/^MA|CT|NH|RI|ME|VT$/)) {
                return d
            }
        }),
        d3.csv(fipsByState, (d) => {
            if (d.state.match(/^MA|CT|NH|RI|ME|VT$/)) {
                return d
            }
        }),
    ],
    d3.autoType())
    .then(main)

function main(data) {

    let arboData = d3.group(data[1], d => d.Year);
    let countyFips = d3.group(data[2], d => d.fips);

    const yearSelector = d3.select("#vis1-tab-pane")
        .append('select')
        .attr("id", "yearSelector")
        .on('change', onchange)

    let options = yearSelector
        .selectAll('option')
        .data(arboData.keys()).enter()
        .append('option')
        .text(function (d) { return d; });

    yearSelector.property("value", Math.max(...arboData.keys()))
    function onchange() {
        selectValue = d3.select('select').property('value')
        console.log(`Filtering by year: ${selectValue}, rerendering map`)
        d3.selectAll("#geo").remove()
        renderMap()
    }
    function getCountyDataForYear(year, county) {
        // console.log(`Getting counts for county=${county} in year=${year}`)
        let results = {
            total: 0,
            speciesTotals: []
        }
        arboData.get(year).forEach(d=>{
            if (d.County == county) {
                results.total += +d.COUNT
                results.speciesTotals.push(`${d.name}: ${d.COUNT}`)
            }
        })
        return results
    }

    renderMap()
    function renderMap() {
        const svg = d3.select("#vis1-tab-pane").append("svg")
        const width = 1300
        const height = 1000
        svg.attr("viewBox", `0 0 ${width} ${height}`)
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("id", "geo")
        let projection = d3.geoMercator()
            .center([-71.5, 45.5])
            .scale(5500)
            .translate([width / 2, height / 3]);
        let geoGenerator = d3.geoPath().projection(projection);
        const geoJson = topojson.feature(data[0], data[0].objects.collection).features.filter((d) => {
            return d.properties.state_fips == "25" ||
                d.properties.state_fips == "23" ||
                d.properties.state_fips == "33" ||
                d.properties.state_fips == "50" ||
                d.properties.state_fips == "44" ||
                d.properties.state_fips == "09"
        })
        let year = yearSelector.property("value")
        let casesExtent = d3.extent(data[1], d => {
            if(d.Year == year){
                return Number(d.COUNT)
            }
        })
        casesExtent[0] = 1
        // console.log(casesExtent)
        function getColor(cases) {
            const color = d3.rgb(d3.interpolateYlOrRd(cases/casesExtent[1]))
            return color.formatHex()
        }
        let mapCanvas = svg.append('g')
        mapCanvas.selectAll('path')
            .data(geoJson)
            .enter()
            .append('path')
            .attr("class", "path_geo")
            .attr("d", geoGenerator)
            .attr("fill", "white")
            .on("mousemove", (mouseData, d) => {
                try {
                    let county = countyFips.get(d.properties.fips.toString())[0].name
                    let state = countyFips.get(d.properties.fips.toString())[0].state
                    let counts = getCountyDataForYear(year, d.properties.fips.toString())
                    d3.select('#tooltip')
                        .style("opacity", .8)
                        .style("left", (mouseData.clientX + 10).toString() + "px")
                        .style("top", (mouseData.clientY + 10).toString() + "px")
                        .html(`<div class='tooltipData'>
                        ${county}, ${state}<br>
                        Total: ${counts.total}<br>
                        ${counts.speciesTotals.join("<br>")}
                        </div>
                `)
                } catch (TypeError) {
                    console.log(`Error: Data not found for county FIPS=${d.properties.fips.toString()}`)
                }
            })
            .on("mouseout", (mouseData, d) => {
                d3.select('#tooltip')
                    .style("opacity", 0)
            })
            .transition()
            .delay((_, i) => i * 2)
            .duration(800)
            .style("fill", d => {
                try {
                    let year = yearSelector.property("value")
                    let total = getCountyDataForYear(year, d.properties.fips.toString()).total
                    let color = getColor(total)
                    console.log(`determining color for year=${year}, fips=${d.properties.fips.toString()}, total=${total}... color=${color}`)
                    return color;
                } catch (error) {
                    // in the case of counties with no data;
                    return "white";
                }
            })
        svg.call(
            d3.zoom()
                .extent([[0, 0], [1000, 800]])
                .scaleExtent([0, 8])
                .on("zoom", zoomed)
        )
        function zoomed({transform}) {
            mapCanvas.attr("transform", transform);
        }
    }
}