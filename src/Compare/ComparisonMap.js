// --- Imports ---
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";

// --- Main Component: ComparisonMap ---
// Renders an interactive map showing cultural similarities between regions
function ComparisonMap({ baseRegion = "", similarities = {}, topic = "" }) {
  const mapRef = useRef(null);

  // --- Constants & Configurations ---
  // Map of regions to their corresponding country IDs in topojson format
  const regionToIds = {
    Western: [840, 124, 826, 250, 276, 380, 724, 620, 528, 56, 756, 40, 372, 752, 578, 208, 246],
    Arab: [12, 48, 818, 368, 400, 414, 422, 434, 504, 512, 275, 634, 682, 729, 760, 788, 784, 887],
    Chinese: [156, 344, 446, 158, 702],
  };

  // Helper function to determine colors based on similarity values
  const getRegionColor = (value) => {
    if (value === undefined || value === null) return "#e0e0e0";
    
    if (value <= 15) {
      // Red gradient for values 0-15
      const redScale = d3
        .scaleLinear()
        .domain([0, 15])
        .range(["#ffcdd2", "#ef5350"]);
      return redScale(value);
    } else {
      // Green gradient for values 15-100
      const greenScale = d3
        .scaleLinear()
        .domain([15, 100])
        .range(["#e0f2e9", "#10a37f"]);
      return greenScale(value);
    }
  };

  // --- Map Drawing Logic ---
  useEffect(() => {
    const drawMap = async () => {
      try {
        // Clear existing map
        d3.select(mapRef.current).selectAll("*").remove();

        // --- SVG Setup and Background ---
        const width = 960;
        const height = 500;

        const svg = d3
          .select(mapRef.current)
          .append("svg")
          .attr("viewBox", `0 0 ${width} ${height}`)
          .attr("width", "100%")
          .attr("height", "100%");

        svg
          .append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "white");

        // --- Map Projection Configuration ---
        const projection = d3
          .geoMercator()
          .scale(140)
          .center([0, 30])
          .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // --- World Data Fetching ---
        const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const world = await response.json();
        const countries = feature(world, world.objects.countries);

        // --- Tooltip Creation ---
        const tooltip = d3
          .select(mapRef.current)
          .append("div")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background", "white")
          .style("border", "1px solid #ccc")
          .style("border-radius", "4px")
          .style("padding", "8px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("color", "#10a37f")
          .style("box-shadow", "0 4px 8px rgba(0, 0, 0, 0.1)");

        // --- Country Drawing and Interactions ---
        svg
          .append("g")
          .selectAll("path")
          .data(countries.features)
          .join("path")
          .attr("d", path)
          .attr("fill", (d) => {
            const countryId = parseInt(d.id);
            if (!baseRegion || regionToIds[baseRegion]?.includes(countryId)) {
              return "#C0C0C0";
            }
            for (const [region, score] of Object.entries(similarities)) {
              if (regionToIds[region]?.includes(countryId)) {
                return getRegionColor(score);
              }
            }
            return "#e0e0e0";
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          // Event Handlers for Tooltips
          .on("mouseover", (event, d) => {
            const countryId = parseInt(d.id);
            let region = null;
            let similarity = null;

            if (regionToIds[baseRegion]?.includes(countryId)) {
              region = baseRegion;
            } else {
              for (const [r, score] of Object.entries(similarities)) {
                if (regionToIds[r]?.includes(countryId)) {
                  region = r;
                  similarity = score;
                  break;
                }
              }
            }

            if (region) {
              tooltip
                .style("visibility", "visible")
                .html(
                  similarity !== null
                    ? `<strong>Region:</strong> ${region}<br><strong>Similarity:</strong> ${similarity.toFixed(2)}%`
                    : `<strong>Region:</strong> ${region}`
                );
            }
          })
          .on("mousemove", (event) => {
            tooltip
              .style("top", `${event.pageY + 10}px`)
              .style("left", `${event.pageX + 10}px`);
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });

        // --- Legend Creation ---
        if (Object.keys(similarities).length > 0) {
          const legendWidth = 200;
          const legendHeight = 15;
          const legendY = height - 70;
          const redWidth = (legendWidth * 15) / 100;
          const greenWidth = legendWidth - redWidth;

          // Gradient Definitions
          const gradients = svg.append("defs");

          // Red gradient (0-15%)
          gradients
            .append("linearGradient")
            .attr("id", "legend-gradient-red")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .selectAll("stop")
            .data([
              { offset: "0%", color: "#ffcdd2" },
              { offset: "100%", color: "#ef5350" }
            ])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

          // Green gradient (15-100%)
          gradients
            .append("linearGradient")
            .attr("id", "legend-gradient-green")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .selectAll("stop")
            .data([
              { offset: "0%", color: "#e0f2e9" },
              { offset: "100%", color: "#10a37f" }
            ])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

          const legend = svg
            .append("g")
            .attr("transform", `translate(${(width - legendWidth) / 2}, ${legendY})`);

          // Color Bars
          legend
            .append("rect")
            .attr("width", redWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient-red)");

          legend
            .append("rect")
            .attr("x", redWidth)
            .attr("width", greenWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient-green)");

          // Scale and Labels
          const legendScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, legendWidth]);

          const legendAxis = d3.axisBottom(legendScale)
            .tickValues([0, 15, 50, 100])
            .tickFormat(d => `${d}%`);

          legend
            .append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);

          // Legend Title
          legend
            .append("text")
            .attr("x", legendWidth / 2)
            .attr("y", legendHeight + 30)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Similarity Index");
        }
      } catch (error) {
        console.error("Error drawing map:", error);
      }
    };

    drawMap();
  }, [baseRegion, similarities, topic]);

  // --- Component Return ---
  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export { ComparisonMap };