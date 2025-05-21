import React, { useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme, GlobalStyle } from './theme';
import Registration from './components/Registration';
import CountdownTimer from './components/CountdownTimer';
import AvailabilityToggle from './components/AvailabilityToggle';
import MatchResult from './components/MatchResult';
import { getUser, getTodayMatch } from './services/firebase';
import { User, Match } from './types';
import { isMatchingComplete } from './utils';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [todayMatch, setTodayMatch] = useState<Match | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchingComplete, setMatchingComplete] = useState(isMatchingComplete());
  
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    
    const fetchUser = async () => {
      if (savedUserId) {
        try {
          const userData = await getUser(savedUserId);
          setUser(userData);
        } catch (err) {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('userId');
        }
      }
      setLoadingUser(false);
    };
    
    fetchUser();
  }, []);
  
  useEffect(() => {
    if (user && matchingComplete) {
      fetchTodayMatch();
    }
  }, [user, matchingComplete]);
  
  const fetchTodayMatch = async () => {
    if (!user) return;
    
    try {
      setLoadingMatch(true);
      const match = await getTodayMatch(user.id);
      setTodayMatch(match);
    } catch (err) {
      console.error('Failed to fetch match:', err);
    } finally {
      setLoadingMatch(false);
    }
  };
  
  const handleRegister = async (userId: string) => {
    try {
      const userData = await getUser(userId);
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user after registration:', err);
    }
  };
  
  const handleAvailabilityChange = (available: boolean) => {
    if (user) {
      setUser({ ...user, availableToday: available });
    }
  };
  
  const handleTimeUp = () => {
    setMatchingComplete(true);
  };
  
  if (loadingUser) {
    return <Loading>Loading...</Loading>;
  }
  
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Logo>🍴 Fork Friend</Logo>
          <Subtitle>Connect with colleagues over lunch</Subtitle>
        </Header>
        
        {!user ? (
          <Registration onRegister={handleRegister} />
        ) : (
          <Content>
            <CountdownTimer onTimeUp={handleTimeUp} />
            
            {!matchingComplete && (
              <AvailabilityToggle 
                userId={user.id}
                available={user.availableToday}
                disabled={matchingComplete}
                onChange={handleAvailabilityChange}
              />
            )}
            
            {matchingComplete && (
              <MatchResult 
                match={todayMatch}
                currentUser={user}
                loading={loadingMatch}
              />
            )}
          </Content>
        )}
        
        <Footer>
          <FooterText>© {new Date().getFullYear()} Northeast Delta Dental</FooterText>
        </Footer>
      </AppContainer>
    </ThemeProvider>
  );
};

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 1.125rem;
`;

const Content = styled.main`
  flex: 1;
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.25rem;
`;

const Footer = styled.footer`
  margin-top: 3rem;
  text-align: center;
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  opacity: 0.7;
`;

export default App;
