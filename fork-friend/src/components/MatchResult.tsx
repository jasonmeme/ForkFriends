import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Match, User } from '../types';
import { formatDate } from '../utils';

interface MatchResultProps {
  match: Match | null;
  currentUser: User | null;
  loading: boolean;
}

const MatchResult: React.FC<MatchResultProps> = ({ match, currentUser, loading }) => {
  if (loading) {
    return (
      <Container>
        <LoadingText>Loading your match...</LoadingText>
      </Container>
    );
  }
  
  if (!match) {
    return (
      <Container
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <NoMatchCard>
          <NoMatchTitle>No Match Today</NoMatchTitle>
          <NoMatchDescription>
            There weren't enough people available for lunch today.
            Try again tomorrow!
          </NoMatchDescription>
        </NoMatchCard>
      </Container>
    );
  }
  
  // Determine which user is the match
  const matchedUser = currentUser?.id === match.user1Id ? 
    { id: match.user2Id, name: match.user2Name } : 
    { id: match.user1Id, name: match.user1Name };
  
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <MatchCard
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ConfettiIcon>🎉</ConfettiIcon>
        <MatchTitle>Your Lunch Match</MatchTitle>
        <MatchDate>{formatDate(match.date)}</MatchDate>
        
        <MatchName>{matchedUser.name}</MatchName>
        
        <Instructions>
          Reach out to your match via Webex and enjoy your lunch!
        </Instructions>
      </MatchCard>
    </Container>
  );
};

const Container = styled(motion.div)`
  margin: 1.5rem 0;
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
`;

const NoMatchCard = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.theme.boxShadow};
  padding: 2rem;
  text-align: center;
`;

const NoMatchTitle = styled.h3`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const NoMatchDescription = styled.p`
  color: ${props => props.theme.colors.text};
  line-height: 1.5;
`;

const MatchCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.theme.boxShadow};
  padding: 2.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const ConfettiIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const MatchTitle = styled.h3`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const MatchDate = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 2rem;
  opacity: 0.7;
`;

const MatchName = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 2rem;
  padding: 0.5rem 0;
  border-top: 1px solid ${props => props.theme.colors.lightGray};
  border-bottom: 1px solid ${props => props.theme.colors.lightGray};
`;

const Instructions = styled.p`
  color: ${props => props.theme.colors.text};
  line-height: 1.5;
`;

export default MatchResult; 