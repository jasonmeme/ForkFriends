import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getTimeRemaining, isMatchingComplete } from '../utils';

interface CountdownTimerProps {
  onTimeUp: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ onTimeUp }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());
  const [isComplete, setIsComplete] = useState(isMatchingComplete());
  
  useEffect(() => {
    if (isComplete) {
      onTimeUp();
      return;
    }
    
    const timer = setInterval(() => {
      const newTimeRemaining = getTimeRemaining();
      setTimeRemaining(newTimeRemaining);
      
      if (newTimeRemaining.hours === 0 && 
          newTimeRemaining.minutes === 0 && 
          newTimeRemaining.seconds === 0) {
        setIsComplete(true);
        onTimeUp();
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isComplete, onTimeUp]);
  
  const formatTime = (value: number) => {
    return value < 10 ? `0${value}` : value;
  };
  
  return (
    <Container>
      <Title>Matching Deadline</Title>
      {isComplete ? (
        <TimeUpText 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Matching Complete
        </TimeUpText>
      ) : (
        <CountdownContainer>
          <TimeUnit>
            <TimeValue>{formatTime(timeRemaining.hours)}</TimeValue>
            <TimeLabel>Hours</TimeLabel>
          </TimeUnit>
          <Separator>:</Separator>
          <TimeUnit>
            <TimeValue>{formatTime(timeRemaining.minutes)}</TimeValue>
            <TimeLabel>Minutes</TimeLabel>
          </TimeUnit>
          <Separator>:</Separator>
          <TimeUnit>
            <TimeValue
              key={timeRemaining.seconds}
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formatTime(timeRemaining.seconds)}
            </TimeValue>
            <TimeLabel>Seconds</TimeLabel>
          </TimeUnit>
        </CountdownContainer>
      )}
      <Subtitle>
        {isComplete ? 
          'Check below for your lunch match' : 
          'Until today\'s matches are made'}
      </Subtitle>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.primary};
  text-align: center;
`;

const CountdownContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const TimeUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TimeValue = styled(motion.div)`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  min-width: 3rem;
  text-align: center;
`;

const TimeLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Separator = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0 0.5rem;
  padding-bottom: 1.75rem;
`;

const TimeUpText = styled(motion.div)`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme.colors.text};
  text-align: center;
`;

export default CountdownTimer; 