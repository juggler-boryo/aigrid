import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

interface HeatmapProps {
  data: { date: string; count: number }[];
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const today = new Date().toISOString().split("T")[0];

  // カスタムスタイル関数
  const getColor = (count: number | undefined): string => {
    if (!count || count === 0) return "#ebedf0"; // グレー
    if (count <= 2) return "#c6e48b"; // 薄い緑
    if (count <= 5) return "#7bc96f"; // 中間緑
    return "#196127"; // 濃い緑
  };

  return (
    <div style={{ width: "100%", marginTop: "20px" }}>
      <CalendarHeatmap
        startDate={`${new Date(today).getFullYear()}-01-01`}
        endDate={today}
        values={data}
        classForValue={undefined} // classを無効化
        showWeekdayLabels={true}
        tooltipDataAttrs={(value: { date: string; count: number } | undefined) =>
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
  );
};

export default Heatmap;
