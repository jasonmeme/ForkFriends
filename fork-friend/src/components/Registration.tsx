import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { createUser } from '../services/firebase';

interface RegistrationProps {
  onRegister: (userId: string) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    try {
      setLoading(true);
      const user = await createUser(name.trim());
      localStorage.setItem('userId', user.id);
      onRegister(user.id);
    } catch (err) {
      setError('Failed to register. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <Title>Welcome to Fork Friend</Title>
        <Description>
          Connect with colleagues for lunch by simply registering your name.
        </Description>
        
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          {error && <ErrorText>{error}</ErrorText>}
          <Button 
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

const Container = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.theme.boxShadow};
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const Description = styled.p`
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.text};
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid ${props => props.theme.colors.gray};
  border-radius: ${props => props.theme.borderRadius};
  margin-bottom: 1rem;
  transition: ${props => props.theme.transition};
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const Button = styled(motion.button)`
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: ${props => props.theme.borderRadius};
  transition: ${props => props.theme.transition};
  margin-top: 0.5rem;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: ${props => props.theme.colors.danger};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

export default Registration; 