import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useUserStore } from '../store/user-store';
import App from '../App';
import theme from '../theme';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider theme={theme}>{component}</ChakraProvider>);
};

describe('App', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.setState({
      user: null,
      users: [],
      isLoading: false,
      error: null,
    });
  });
  it('should render the app title', () => {
    renderWithChakra(<App />);
    expect(screen.getByText('AWS Starter Kit')).toBeInTheDocument();
  });

  it('should render welcome message', () => {
    renderWithChakra(<App />);
    expect(screen.getByText('Welcome to the Web Client')).toBeInTheDocument();
  });

  it('should render load demo user button initially', () => {
    renderWithChakra(<App />);
    expect(screen.getByText('Load Demo User')).toBeInTheDocument();
  });

  it('should display user info when demo user is loaded', () => {
    renderWithChakra(<App />);
    
    const loadButton = screen.getByText('Load Demo User');
    fireEvent.click(loadButton);

    expect(screen.getByText('Current User:')).toBeInTheDocument();
    expect(screen.getByText('demo@example.com')).toBeInTheDocument();
    expect(screen.getByText('Demo User')).toBeInTheDocument();
  });

  it('should clear user when clear button is clicked', async () => {
    renderWithChakra(<App />);
    
    // Load user
    const loadButton = screen.getByText('Load Demo User');
    fireEvent.click(loadButton);

    // Verify user is loaded
    expect(screen.getByText('Current User:')).toBeInTheDocument();

    // Clear user
    const clearButton = screen.getByText('Clear User');
    fireEvent.click(clearButton);

    // Should show load button again (user is null, but users array still has data)
    // So we check that "Current User:" is not visible anymore
    expect(screen.queryByText('Current User:')).not.toBeInTheDocument();
  });

  it('should list all features', () => {
    renderWithChakra(<App />);
    
    expect(screen.getByText(/React 18 with TypeScript/)).toBeInTheDocument();
    expect(screen.getByText(/Vite for fast development/)).toBeInTheDocument();
    expect(screen.getByText(/Chakra UI component library/)).toBeInTheDocument();
    expect(screen.getByText(/Zustand for state management/)).toBeInTheDocument();
    expect(screen.getByText(/Jest for testing/)).toBeInTheDocument();
  });
});

