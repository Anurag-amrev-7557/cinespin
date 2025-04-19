import React from 'react';
import './UpcomingMatches.css';

const sampleMatches = [
  {
    id: 1,
    teamA: 'MI',
    teamB: 'KKR',
    date: 'April 21, 2025',
    venue: 'Wankhede Stadium, Mumbai'
  },
  {
    id: 2,
    teamA: 'DC',
    teamB: 'SRH',
    date: 'April 22, 2025',
    venue: 'Arun Jaitley Stadium, Delhi'
  },
];

const UpcomingMatches = () => {
  return (
    <div className="upcoming-matches">
      {sampleMatches.map((match) => (
        <div className="match-card" key={match.id}>
          <div className="match-teams">
            <span>{match.teamA}</span> <span className="vs-text">vs</span> <span>{match.teamB}</span>
          </div>
          <div className="match-info">
            <p>{match.date}</p>
            <p>{match.venue}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingMatches;