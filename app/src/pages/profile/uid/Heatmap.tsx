import React from "react";
import ReactCalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import useMediaQuery from "@mui/material/useMediaQuery";
import Cookies from "js-cookie";
import tinycolor from 'tinycolor2';



interface HeatmapValue {
  date: string;
  count: number;
}

interface HeatmapProps {
  data: HeatmapValue[];
}

function darkenHexColor(hexColor: string, amount: number = 10): string {
  return tinycolor(hexColor).darken(amount).toHexString();
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const userColorHex = Cookies.get("userColor") || "#000000";
  const today = new Date().toISOString().split("T")[0];
  const isMobile = useMediaQuery("(max-width:800px)");

  const userColor = userColorHex
  const level0Color = "#ebedf0"

  const level1Color = userColor

  const level2Color = darkenHexColor(userColor, 20);
   
  const level3Color = darkenHexColor(userColor, 40);
  
  const getColor = (count: number | undefined): string => {
    if (!count || count === 0) return level0Color
    if (count <= 2) return level1Color
    if (count <= 5) return level2Color
    return level3Color
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
        <ReactCalendarHeatmap
          startDate={startDate.toISOString().split("T")[0]}
          endDate={today}
          values={data}
          classForValue={undefined}
          showWeekdayLabels={true}
          tooltipDataAttrs={(value: any) =>
            value ? { "data-tip": `${value.count} 回` } : { "data-tip": "0 回" }
          }
          transformDayElement={(element: any, value: any) => {
            const fillColor = getColor(value?.count);
            return React.cloneElement(element, {
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
