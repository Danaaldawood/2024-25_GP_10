import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";

function ComparisonMap({ baseRegion, compareRegion, similarity = 0, topic }) {
  const mapRef = useRef(null);

  const regionToIds = {
    Western: [840, 124, 826, 250, 276, 380, 724, 620, 528, 56, 756, 40, 372, 752, 578, 208, 246],
    Arab: [12, 48, 818, 368, 400, 414, 422, 434, 504, 512, 275, 634, 682, 729, 760, 788, 784, 887],
    Chinese: [156, 344, 446, 158, 702],
  };

  const regionToName = {
    Western: "Western",
    Arab: "Arab",
    Chinese: "Chinese",
  };

  useEffect(() => {
    const drawMap = async () => {
      try {
        d3.select(mapRef.current).selectAll("*").remove();

        const width = 960;
        const height = 500;

        const svg = d3
          .select(mapRef.current)
          .append("svg")
          .attr("viewBox", `0 0 ${width} ${height}`)
          .attr("width", "100%")
          .attr("height", "100%");

        // Add background sea color
        svg
          .append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "#cfeefc"); // Light blue for the sea

        const projection = d3
          .geoMercator()
          .scale(140)
          .center([0, 30])
          .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const world = await response.json();
        const countries = feature(world, world.objects.countries);

        const regionColor = d3
          .scaleLinear()
          .domain([0, 100])
          .range(["#e0f2e9", "#10a37f"]); // Light green to dark green

        svg
          .append("g")
          .selectAll("path")
          .data(countries.features)
          .join("path")
          .attr("d", path)
          .attr("fill", (d) => {
            const countryId = parseInt(d.id);
            if (
              regionToIds[baseRegion]?.includes(countryId) ||
              regionToIds[compareRegion]?.includes(countryId)
            ) {
              return regionColor(similarity);
            }
            return "#e0e0e0"; // Default color for other countries
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5);

        // Add centered legend
        const legendWidth = 200;
        const legendHeight = 15;

        const legend = svg
          .append("g")
          .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - 50})`);

        const gradient = svg
          .append("defs")
          .append("linearGradient")
          .attr("id", "legend-gradient")
          .attr("x1", "0%")
          .attr("x2", "100%");

        gradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "#e0f2e9"); // Light green
        gradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#10a37f"); // Dark green

        legend
          .append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#legend-gradient)");

        const legendScale = d3.scaleLinear().domain([0, 100]).range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale).ticks(5).tickFormat((d) => `${d}%`);

        legend.append("g").attr("transform", `translate(0, ${legendHeight})`).call(legendAxis);
      } catch (error) {
        console.error("Error drawing map:", error);
      }
    };

    drawMap();
  }, [baseRegion, compareRegion, similarity, topic]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 style={{ margin: "0", fontWeight: "bold", fontSize: "1.25rem" }}>Similarity for {topic}</h2>
        <span style={{ fontSize: "1rem" }}>Similarity: {similarity.toFixed(2)}%</span>
      </div>
      <div ref={mapRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export { ComparisonMap };
