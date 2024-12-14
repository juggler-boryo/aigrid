import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import useMediaQuery from "@mui/material/useMediaQuery";

interface HeatmapProps {
  data: { date: string; count: number }[];
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const today = new Date().toISOString().split("T")[0];
  const isMobile = useMediaQuery("(max-width:800px)");

  const getColor = (count: number | undefined): string => {
    if (!count || count === 0) return "#ebedf0";
    if (count === 1) return "#c6e48b";
    if (count === 2) return "#9ae264";
    if (count === 3) return "#7bc96f";
    if (count === 4) return "#5ab055";
    if (count === 5) return "#3c8c3e";
    if (count <= 7) return "#2a6b2c";
    return "#196127";
  };

  const startDate = isMobile
    ? new Date(new Date(today).setMonth(new Date(today).getMonth() - 2))
    : new Date(new Date(today).setFullYear(new Date(today).getFullYear() - 1));

  return (
    <div
      style={{
        width: "100%",
        marginTop: "20px",
        maxWidth: isMobile ? "300px" : "100%",
        margin: "0 auto",
      }}
    >
      <div style={{ width: "100%" }}>
        <CalendarHeatmap
          startDate={startDate.toISOString().split("T")[0]}
          endDate={today}
          values={data}
          classForValue={undefined}
          showWeekdayLabels={true}
          tooltipDataAttrs={(
            value: { date: string; count: number } | undefined
          ) =>
            value && value.date
              ? { "data-tip": `${value.count} 回` }
              : { "data-tip": "0 回" }
          }
          transformDayElement={(rect, value) => {
            const fillColor = getColor(value?.count);
            return React.cloneElement(rect, {
              style: {
                fill: fillColor,
                cursor: "pointer",
              },
              onMouseEnter: (event: React.MouseEvent<SVGElement>) => {
                const tooltip = document.createElement("div");
                tooltip.className = "heatmap-tooltip";
                tooltip.textContent = value?.count
                  ? `${value.count} 回`
                  : "0 回";
                tooltip.style.position = "absolute";
                tooltip.style.backgroundColor = "#333";
                tooltip.style.color = "#fff";
                tooltip.style.padding = "4px 8px";
                tooltip.style.borderRadius = "4px";
                tooltip.style.fontSize = "12px";
                tooltip.style.zIndex = "1000";
                document.body.appendChild(tooltip);

                const rect = event.currentTarget.getBoundingClientRect();
                tooltip.style.left = `${rect.left}px`;
                tooltip.style.top = `${rect.top - 30}px`;
              },
              onMouseLeave: () => {
                const tooltip = document.querySelector(".heatmap-tooltip");
                if (tooltip) {
                  tooltip.remove();
                }
              },
            });
          }}
        />
      </div>
    </div>
  );
};

export default Heatmap;
