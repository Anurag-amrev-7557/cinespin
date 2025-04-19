import React from 'react';
import './TeamInfoPanel.css';

const sampleTeamInfo = {
  teamName: 'RCB',
  coach: 'Mike Hesson',
  squad: [
    { id: 1, name: 'Virat Kohli', role: 'Batsman' },
    { id: 2, name: 'Glenn Maxwell', role: 'All-rounder' },
    { id: 3, name: 'Mohammad Siraj', role: 'Bowler' },
    { id: 4, name: 'Harshal Patel', role: 'Bowler' },
    // Add more players
  ],
};

const TeamInfoPanel = () => {
  return (
    <div className="team-info-panel">
      <div className="team-header">
        <h2>{sampleTeamInfo.teamName}</h2>
        <p>Coach: {sampleTeamInfo.coach}</p>
      </div>

      <div className="team-squad">
        <h3>Team Squad</h3>
        <ul>
          {sampleTeamInfo.squad.map((player) => (
            <li key={player.id}>
              <span>{player.name}</span> - <span>{player.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeamInfoPanel;