import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import useMediaQuery from "@mui/material/useMediaQuery";
import Cookies from "js-cookie";
import tinycolor from 'tinycolor2';



interface HeatmapProps {
  data: { date: string; count: number }[];
}

function darkenHexColor(hexColor: string, amount: number = 10): string {
  return tinycolor(hexColor).darken(amount).toHexString();
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const userColorHex = Cookies.get("userColor") || "#000000";
  const today = new Date().toISOString().split("T")[0];
  const isMobile = useMediaQuery("(max-width:800px)");

  const userColor = userColorHex
  const level0Color = "#808080"

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
        <CalendarHeatmap
          startDate={startDate.toISOString().split("T")[0]}
          endDate={today}
          values={data}
          classForValue={undefined} // classを無効化
          showWeekdayLabels={true}
          tooltipDataAttrs={(
            value: { date: string; count: number } | undefined
          ) =>
            value && value.date
              ? { "data-tip": `${value.date}: ${value.count} 回` }
              : { "data-tip": "No data" }
          }
          // セルのスタイルを動的に適用
          transformDayElement={(rect, value) => {
            const fillColor = getColor(value?.count);
            return React.cloneElement(rect, {
              style: { fill: fillColor },
            });
          }}
        />
      </div>
    </div>
  );
};

export default Heatmap;
