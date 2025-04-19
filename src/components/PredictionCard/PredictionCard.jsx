import React from 'react';
import './PredictionCard.css';

const PredictionCard = () => {
  const prediction = {
    winner: 'RCB',
    winProbability: 75, // In percentage
    topScorer: 'Virat Kohli',
    topBowler: 'Mohammad Siraj',
  };

  return (
    <div className="prediction-card">
      <h2>Match Prediction</h2>
      <div className="prediction-details">
        <p><strong>Predicted Winner:</strong> {prediction.winner}</p>
        <p><strong>Win Probability:</strong> {prediction.winProbability}%</p>
        <p><strong>Top Scorer:</strong> {prediction.topScorer}</p>
        <p><strong>Top Bowler:</strong> {prediction.topBowler}</p>
      </div>

      <div className="win-probability-chart">
        <div className="win-bar" style={{ width: `${prediction.winProbability}%` }} />
      </div>
    </div>
  );
};

export default PredictionCard;
