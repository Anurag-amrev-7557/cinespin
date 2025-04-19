import React from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import './PlayerRadarStats.css';

const PlayerRadarStats = ({ playerStats }) => {
  // Check if playerStats is defined and provide default values if it's not
  if (!playerStats) {
    return <div>Loading...</div>; // Or any other fallback component/UI
  }

  const data = [
    {
      "trait": "Batting Avg",
      "value": playerStats.battingAvg || 0  // Provide default value if undefined
    },
    {
      "trait": "Strike Rate",
      "value": playerStats.strikeRate || 0
    },
    {
      "trait": "Economy Rate",
      "value": playerStats.economyRate || 0
    },
    {
      "trait": "Wickets",
      "value": playerStats.wickets || 0
    },
    {
      "trait": "Runs Scored",
      "value": playerStats.runsScored || 0
    },
  ];

  return (
    <div className="player-radar-stats">
      <h2>{playerStats.name || 'Player'} - Player Stats</h2>
      <div style={{ height: '300px' }}>
        <ResponsiveRadar
          data={data}
          keys={['value']}
          indexBy="trait"
          maxValue="auto"
          margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          curve="linearClosed"
          borderWidth={2}
          borderColor="rgba(255, 255, 255, 0.7)"
          gridShape="circular"
          gridLabelOffset={15}
          enableDots={true}
          dotSize={10}
          dotColor="rgba(255, 255, 255, 0.8)"
          fillOpacity={0.15}
          fill="rgba(255, 150, 50, 0.5)"
          animate={true}
          motionConfig="wobbly"
        />
      </div>
    </div>
  );
};

export default PlayerRadarStats;