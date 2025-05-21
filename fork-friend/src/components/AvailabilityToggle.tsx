import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { updateUserAvailability } from '../services/firebase';

interface AvailabilityToggleProps {
  userId: string;
  available: boolean;
  disabled: boolean;
  onChange: (available: boolean) => void;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({ 
  userId, 
  available, 
  disabled,
  onChange 
}) => {
  const handleToggle = async () => {
    if (disabled) return;
    
    try {
      const newAvailability = !available;
      await updateUserAvailability(userId, newAvailability);
      onChange(newAvailability);
    } catch (err) {
      console.error('Failed to update availability:', err);
    }
  };
  
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <Title>Today's Lunch Availability</Title>
        
        <ToggleContainer>
          <ToggleLabel available={available}>
            I am {available ? 'available' : 'not available'} for lunch today
          </ToggleLabel>
          
          <ToggleButton 
            active={available} 
            disabled={disabled}
            onClick={handleToggle}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
          >
            <ToggleThumb 
              active={available}
              animate={{ 
                x: available ? 18 : 0,
                backgroundColor: available ? '#fff' : '#eee' 
              }}
              transition={{ duration: 0.2 }}
            />
          </ToggleButton>
        </ToggleContainer>
        
        {disabled && (
          <DisabledMessage>
            Matching is complete. Please return tomorrow to set your availability.
          </DisabledMessage>
        )}
      </Card>
    </Container>
  );
};

const Container = styled(motion.div)`
  margin: 1.5rem 0;
`;

const Card = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.theme.boxShadow};
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ToggleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ToggleLabel = styled.span<{ available: boolean }>`
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.available ? 
    props.theme.colors.success : 
    props.theme.colors.text};
`;

interface ToggleButtonProps {
  active: boolean;
  disabled: boolean;
}

const ToggleButton = styled(motion.button)<ToggleButtonProps>`
  width: 44px;
  height: 26px;
  background-color: ${props => 
    props.active ? 
    props.theme.colors.success : 
    props.theme.colors.gray};
  border-radius: 13px;
  padding: 3px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  opacity: ${props => props.disabled ? 0.6 : 1};
`;

const ToggleThumb = styled(motion.div)<{ active: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#fff' : '#eee'};
`;

const DisabledMessage = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  text-align: center;
  opacity: 0.8;
  font-style: italic;
`;

export default AvailabilityToggle; 