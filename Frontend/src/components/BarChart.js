import React from "react";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer
} from "recharts";

const BarChart = ({ data }) => {
  if (!data || data.length === 0) {
    console.log("BarChart data:", data); // Debugging: Check if data is received
    return <p style={{ textAlign: "center", color: "red" }}>No data available for the bar chart.</p>;
  }



  return (
    <ResponsiveContainer width="100%" height={350}>
      <ReBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="movie"
          angle={-15}
          textAnchor="end"
          interval={0}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="adjusted_gross" fill="#8884d8" />
      </ReBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
