const svg2 = d3.select("#vis2-tab-pane").append("svg")
svg2.attr("viewBox", "0 0 1300 1000")
    .attr("height", "100%")
    .attr("width", "100%")
    .attr("id", "bubble")

const datereForm = d3.timeParse("%B %Y")

            data = d3.csv("../data/mosquitoinfo2.csv", d=>{

                return{

                    CollectionYear: datereForm((d.CollectionDate)),
                    County: (d.County),
                    Species: (d.Species),
                    CountofCounty: (d.CountofCounty),
                    Virus: (d.Virus),
                    CollectionDate: new Date (d.CollectionDate)
                }

            }).then(data=>{

                const dateRange = d3.extent(data, d=>d.CollectionDate)
                const domainY = ([70,0])
                console.log(dateRange)

            console.log(data)


            const xScale = d3.scaleTime().domain(d3.extent(data, d=>d.CollectionDate)).range([20,1200])
            const yscale = d3.scaleLinear().domain(domainY).range([10,470])

            const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.timeFormat("%b %Y")).ticks(32)
                svg2.append("g")
                    .attr("class","Axis")
                    .attr("transform", "translate(-180,900)").call(xAxis)
                    .selectAll("text").attr("transform","translate(-10,10)rotate(-45)")

                const yAxis = d3.axisLeft().scale(yscale)
                svg2.append("g")
                    .attr("class","Axis")
                    .attr("transform",`translate(-160,430)`)
                    .call(yAxis)

                const myColor = d3.scaleOrdinal().domain(d3.extent(data, d=>d.County))
                    .range(d3.schemeSet3);


                const scatterPlot= svg2.append("g").selectAll('circles')
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("cx",d=> xScale(d.CollectionDate))
                    .attr("cy",d=>yscale(d.CountofCounty))
                    .attr("r",d=>d.CountofCounty)
                    .attr("fill",(function(d) {return myColor(d.County)}))
                    .attr("stroke","darkblue")
                    .attr("stroke-width",.4)
                    .attr("transform",`translate(-180,435)`)
            })