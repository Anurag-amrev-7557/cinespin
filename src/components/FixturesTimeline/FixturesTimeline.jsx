import React from 'react';
import './FixturesTimeline.css';

const fixtureData = [
  { id: 1, date: 'April 21, 2025', teamA: 'MI', teamB: 'KKR', venue: 'Wankhede Stadium, Mumbai', score: 'MI 180/5 (20)' },
  { id: 2, date: 'April 22, 2025', teamA: 'DC', teamB: 'SRH', venue: 'Arun Jaitley Stadium, Delhi', score: 'SRH 170/8 (20)' },
  { id: 3, date: 'April 23, 2025', teamA: 'CSK', teamB: 'RR', venue: 'MA Chidambaram Stadium, Chennai', score: 'CSK 190/6 (20)' },
  // Add more fixture data here
];

const FixturesTimeline = () => {
  return (
    <div className="fixtures-timeline">
      <h2>Fixtures Timeline</h2>
      <div className="timeline">
        {fixtureData.map((match) => (
          <div className="timeline-event" key={match.id}>
            <div className="event-date">{match.date}</div>
            <div className="event-details">
              <p><strong>{match.teamA}</strong> vs <strong>{match.teamB}</strong></p>
              <p><em>Venue:</em> {match.venue}</p>
              <p><em>Score:</em> {match.score}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FixturesTimeline;