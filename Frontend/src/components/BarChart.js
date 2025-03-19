import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const BarChartComponent = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data available for the bar chart.</p>;
  }

  // Extract keys dynamically (excluding "year")
  const keys = Object.keys(data[0]).filter(key => key !== "year");
  const colors = ["#8884d8", "#82ca9d", "#ffc658"]; // Assign colors

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        {keys.map((key, index) => (
          <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
