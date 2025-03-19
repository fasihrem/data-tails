import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, ResponsiveContainer } from "recharts";

const ChartComponent = ({ chartType, chartData }) => {
    if (!chartData || !chartData[chartType]) {
        return <p>No data available for {chartType}</p>;
    }

    const data = chartData[chartType].data;

    return (
        <ResponsiveContainer width="100%" height={300}>
            {chartType === "line_chart" && (
                <LineChart data={data}>
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
            )}

            {chartType === "bar_chart" && (
                <BarChart data={data}>
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
            )}

            {chartType === "area_chart" && (
                <AreaChart data={data}>
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
            )}

            {/* Optional: Handle unsupported chart types */}
            {!["line_chart", "bar_chart", "area_chart"].includes(chartType) && (
                <p>Chart type "{chartType}" is not supported.</p>
            )}
        </ResponsiveContainer>
    );
};

export default ChartComponent;
