// import React, { useEffect, useState } from "react";
// import {LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,} from "recharts";
//
// const LineChart = () => {
//   const [data, setData] = useState([]);
//
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch("/output.json");
//         if (!response.ok) throw new Error("Failed to load JSON");
//         const jsonData = await response.json();
//
//         if (!jsonData.line_chart || !jsonData.line_chart.data) {
//           console.error("No data available for the line chart.");
//           setData([]);
//           return;
//         }
//
//         const formattedData = jsonData.line_chart.data.map((d) => ({
//           title: d.title,
//           gross: parseFloat(d.gross.replace(" billion", "")),
//         }));
//
//         setData(formattedData);
//       } catch (error) {
//         console.error("Error loading data:", error);
//       }
//     };
//
//     fetchData();
//
//   }, []);
//
//   return (
//     <div>
//       <h2>Line Chart</h2>
//       {data.length === 0 ? (
//         <p>Line chart data not available.</p>
//       ) : (
//         <ResponsiveContainer width="100%" height={400}>
//           <ReLineChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="title" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="gross" stroke="#8884d8" />
//           </ReLineChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   );
// };
//
// export default LineChart;
