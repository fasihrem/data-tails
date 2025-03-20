import React, { useEffect, useState } from "react";
import WordCloud from "react-wordcloud";

const WordCloudChart = () => {
  const [words, setWords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/output.json");
        const jsonData = await response.json();

        if (!jsonData.word_cloud || !jsonData.word_cloud.data) {
          console.error("No word cloud data available.");
          setWords([]);
          return;
        }

        const formattedWords = jsonData.word_cloud.data.map((d) => ({
          text: d.word,
          value: parseFloat(d.weight.replace(" billion", "")),
        }));

        setWords(formattedWords);
      } catch (error) {
        console.error("Error loading word cloud data:", error);
      }
    };

    fetchData();

    // ✅ Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h2>Word Cloud</h2>
      {words.length === 0 ? (
        <p>No word cloud data available.</p>
      ) : (
        <WordCloud words={words} />
      )}
    </div>
  );
};

export default WordCloudChart;
