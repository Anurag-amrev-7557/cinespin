import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LiveScoreCard from '../../../components/LiveScoreCard/LiveScoreCard';
import MatchTimeline from '../../../components/MatchTimeline/MatchTimeline';
import UpcomingMatches from '../../../components/UpcomingMatches/UpcomingMatches';
import PlayerRadarStats from '../../../components/PlayerRadarStats/PlayerRadarStats';
import PredictionCard from '../../../components/PredictionCard/PredictionCard';
import TeamInfoPanel from '../../../components/TeamInfoPanel/TeamInfoPanel';
import FixturesTimeline from '../../../components/FixturesTimeline/FixturesTimeline';

const IPLDashboard = () => {
  const [liveScore, setLiveScore] = useState(null);
  const [matchTimeline, setMatchTimeline] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [predictionData, setPredictionData] = useState({});
  const [teamInfo, setTeamInfo] = useState({});

  // Fetch live score data
  const fetchLiveScore = async () => {
    try {
      const response = await fetch('https://cricket.sportmonks.com/api/v2.0/ipl/match/live?api_token=BohhnuGFG1lfTmT5BPE1fnii1GQwiCmStgpE78FGwgouotsuZIPLLnPFBOFw');
      const data = await response.json();
      setLiveScore(data);
    } catch (error) {
      console.error("Error fetching live score data", error);
    }
  };

  // Fetch upcoming matches data
  const fetchUpcomingMatches = async () => {
    try {
      const response = await axios.get('https://api.sportsmonk.com/BohhnuGFG1lfTmT5BPE1fnii1GQwiCmStgpE78FGwgouotsuZIPLLnPFBOFw/v2.0/ipl/matches/upcoming');  // Adjust API URL accordingly
      setUpcomingMatches(response.data);
    } catch (error) {
      console.error("Error fetching upcoming matches", error);
    }
  };

  // Fetch match timeline data (example)
  const fetchMatchTimeline = async () => {
    try {
      const response = await axios.get('https://api.sportsmonk.com/BohhnuGFG1lfTmT5BPE1fnii1GQwiCmStgpE78FGwgouotsuZIPLLnPFBOFw/v2.0/ipl/match/timeline');  // Adjust API URL accordingly
      setMatchTimeline(response.data);
    } catch (error) {
      console.error("Error fetching match timeline", error);
    }
  };

  // Fetch player stats (example)
  const fetchPlayerStats = async () => {
    try {
      const response = await axios.get('https://api.sportsmonk.com/BohhnuGFG1lfTmT5BPE1fnii1GQwiCmStgpE78FGwgouotsuZIPLLnPFBOFw/v2.0/ipl/player/stats');  // Adjust API URL accordingly
      setPlayerStats(response.data);
    } catch (error) {
      console.error("Error fetching player stats", error);
    }
  };

  // Fetch prediction data (example)
  const fetchPredictionData = async () => {
    try {
      const response = await axios.get('https://api.sportsmonk.com/BohhnuGFG1lfTmT5BPE1fnii1GQwiCmStgpE78FGwgouotsuZIPLLnPFBOFw/v2.0/ipl/match/predictions');  // Adjust API URL accordingly
      setPredictionData(response.data);
    } catch (error) {
      console.error("Error fetching prediction data", error);
    }
  };

  // Fetch team info data (example)
  const fetchTeamInfo = async () => {
    try {
      const response = await axios.get('https://api.sportsmonk.com/BohhnuGFG1lfTmT5BPE1fnii1GQwiCmStgpE78FGwgouotsuZIPLLnPFBOFw/v2.0/ipl/team');  // Adjust API URL accordingly
      setTeamInfo(response.data);
    } catch (error) {
      console.error("Error fetching team info", error);
    }
  };

  useEffect(() => {
    fetchLiveScore();
    fetchUpcomingMatches();
    fetchMatchTimeline();
    fetchPlayerStats();
    fetchPredictionData();
    fetchTeamInfo();
  }, []);  // Only run once when the component mounts

  return (
    <div className="ipl-dashboard">
      <LiveScoreCard liveScore={liveScore} />
      <MatchTimeline timeline={matchTimeline} />
      <UpcomingMatches matches={upcomingMatches} />
      <PlayerRadarStats playerStats={playerStats} />
      <PredictionCard predictionData={predictionData} />
      <TeamInfoPanel teamInfo={teamInfo} />
      <FixturesTimeline fixtures={upcomingMatches} />
    </div>
  );
};

export default IPLDashboard;