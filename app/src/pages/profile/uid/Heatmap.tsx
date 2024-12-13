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

  // カスタムスタイル関数
  const getColor = (count: number | undefined): string => {
    if (!count || count === 0) return "#ebedf0"; // グレー
    if (count <= 2) return "#c6e48b"; // 薄い緑
    if (count <= 5) return "#7bc96f"; // 中間緑
    return "#196127"; // 濃い緑
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
