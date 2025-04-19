import React from 'react';
import './MatchTimeline.css';

const matchEvents = [
  { time: '1st over', event: 'MI scores 6 runs' },
  { time: '3rd over', event: 'Kieron Pollard hits a six' },
  { time: '6th over', event: 'Wicket: Rohit Sharma out' },
  { time: '8th over', event: 'Quinton de Kock scores 4 runs' },
  { time: '10th over', event: 'Boundary: Hardik Pandya' },
  // Add more match events here
];

const MatchTimeline = () => {
  return (
    <div className="match-timeline">
      <h2>Match Timeline</h2>
      <div className="timeline">
        {matchEvents.map((event, index) => (
          <div className="timeline-event" key={index}>
            <div className="event-time">{event.time}</div>
            <div className="event-description">{event.event}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchTimeline;