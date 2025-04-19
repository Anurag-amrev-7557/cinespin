import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './LiveScoreCard.css';

const LiveScoreCard = () => {
  const [liveScore, setLiveScore] = useState(null);

  useEffect(() => {
    const fetchLiveScore = async () => {
      try {
        const response = await axios.get('https://api.sportsmonk.com/api/v2.0/ipl/match/live');
        setLiveScore(response.data);
      } catch (error) {
        console.error("Error fetching live score data", error);
      }
    };

    fetchLiveScore();
  }, []);

  if (!liveScore) return <div>Loading...</div>;

  return (
    <motion.div 
      className="live-score-card" 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
    >
      <div className="team-score">
        <img src={liveScore.team1.logo} alt="Team Logo" />
        <div>
          <h2>{liveScore.team1.name}</h2>
          <p>{liveScore.team1.score}</p>
        </div>
      </div>

      <div className="vs">vs</div>

      <div className="team-score">
        <img src={liveScore.team2.logo} alt="Team Logo" />
        <div>
          <h2>{liveScore.team2.name}</h2>
          <p>{liveScore.team2.score}</p>
        </div>
      </div>

      <div className="live-indicator">
        <span className="dot"></span> LIVE
      </div>
    </motion.div>
  );
};

export default LiveScoreCard;