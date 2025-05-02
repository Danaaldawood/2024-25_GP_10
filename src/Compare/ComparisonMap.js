// --- Imports ---
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { useTranslation } from "react-i18next";

// --- Main Component: ComparisonMap ---
function ComparisonMap({ baseRegion = "", similarities = {}, topic = "" }) {
  const mapRef = useRef(null);
  const { t } = useTranslation('comparepage');

  // --- Constants & Configurations ---
  const regionToIds = {
    Western: [840, 124, 826, 250, 276, 380, 724, 620, 528, 56, 756, 40, 372, 752, 578, 208, 246],
    Arab: [12, 48, 818, 368, 400, 414, 422, 434, 504, 512, 275, 634, 682, 729, 760, 788, 784, 887],
    Chinese: [156, 344, 446, 158, 702],
  };

  const customGreenColors = ["#edf8e9", "#095c474f", "#12c697"];

  const getRegionColor = (value) => {
    if (value === undefined || value === null || value === 0) return "#095c474f";
    const greenScale = d3
      .scaleLinear()
      .domain([0, 15, 100])
      .range(customGreenColors);
    return greenScale(value);
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

        const defs = svg.append("defs");
        const gradient = defs
          .append("linearGradient")
          .attr("id", "background-gradient")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "100%");

        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#f5f7fa");
        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#e4e8eb");

        svg.append("rect").attr("width", width).attr("height", height).attr("fill", "url(#background-gradient)");

        const projection = d3.geoMercator().scale(140).center([0, 30]).translate([width / 2, height / 2]);
        const path = d3.geoPath().projection(projection);

        const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const world = await response.json();
        const countries = feature(world, world.objects.countries);

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

        svg
          .append("g")
          .selectAll("path")
          .data(countries.features)
          .join("path")
          .attr("d", path)
          .attr("fill", (d) => {
            const countryId = parseInt(d.id);
            // Ensure the base region is always gray (#C0C0C0) if baseRegion is defined
            if (baseRegion && regionToIds[baseRegion]?.includes(countryId)) {
              return "#C0C0C0"; // Gray for the base region
            }
            // Color comparison regions based on similarity scores, excluding the base region
            for (const [region, score] of Object.entries(similarities)) {
              if (region !== baseRegion && regionToIds[region]?.includes(countryId)) {
                return getRegionColor(score);
              }
            }
            return "#e0e0e0"; // Default color for unassigned regions
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
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
              const translatedRegion = t(`comparepage.regions.${region.toLowerCase()}`);
              tooltip
                .style("visibility", "visible")
                .html(
                  similarity !== null
                    ? `<strong>${t('comparepage.regions.region')}:</strong> ${translatedRegion}<br><strong>${t('comparepage.similarity.sim')}:</strong> ${similarity.toFixed(2)}%`
                    : `<strong>${t('comparepage.regions.region')}:</strong> ${translatedRegion}`
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

        if (Object.keys(similarities).length > 0) {
          const legendWidth = 200;
          const legendHeight = 15;
          const legendY = height - 70;

          const gradients = svg.append("defs");
          // Define gradients for the legend: gray for 0%, then orange for 1-100%
          const linearGradient = gradients
            .append("linearGradient")
            .attr("id", "legend-gradient-green")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

            linearGradient
            .selectAll("stop")
            .data([
              { offset: "0%", color: "#095c474f" },
              { offset: "100%", color: "#12c697" },
            ])
          
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

          const legend = svg
            .append("g")
            .attr("transform", `translate(${(width - legendWidth) / 2}, ${legendY})`);

          legend
            .append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient-green)")
            .style("stroke", "#000")
            .style("stroke-width", 1);

          legend
            .append("text")
            .attr("x", 0)
            .attr("y", legendHeight + 15)
            .attr("text-anchor", "start")
            .style("fill", "#722F57")
            .style("font-size", "12px")
            .text("0%");

          legend
            .append("text")
            .attr("x", legendWidth * 0.15)
            .attr("y", legendHeight + 15)
            .attr("text-anchor", "middle")
            .style("fill", "#722F57")
            .style("font-size", "12px")
            .text("15%");

          legend
            .append("text")
            .attr("x", legendWidth)
            .attr("y", legendHeight + 15)
            .attr("text-anchor", "end")
            .style("fill", "#722F57")
            .style("font-size", "12px")
            .text("100%");

          legend
            .append("text")
            .attr("x", legendWidth / 2)
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .style("fill", "#722F57")
            .style("font-size", "14px")
            .text(t('comparepage.similarity.title'));
        }
      } catch (error) {
        console.error("Error drawing map:", error);
      }
    };

    drawMap();
  }, [baseRegion, similarities, topic, t]);

  return (
    <div>
      <div ref={mapRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export { ComparisonMap };
