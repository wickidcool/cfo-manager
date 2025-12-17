import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { useUserStore } from '../store/user-store';
import App from '../App';
import theme from '../theme';

const renderWithChakra = async (component: React.ReactElement) => {
  let result;
  await act(async () => {
    result = render(<ChakraProvider theme={theme}>{component}</ChakraProvider>);
  });
  // Wait for any pending async operations
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return result!;
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

  afterEach(async () => {
    // Wait for any pending state updates to flush
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it('should render the app title', async () => {
    await renderWithChakra(<App />);
    expect(screen.getByText('AWS Starter Kit')).toBeInTheDocument();
  });

  it('should render welcome message', async () => {
    await renderWithChakra(<App />);
    expect(screen.getByText('Welcome to the Web Client')).toBeInTheDocument();
  });

  it('should render load demo user button initially', async () => {
    await renderWithChakra(<App />);
    expect(screen.getByText('Load Demo User')).toBeInTheDocument();
  });

  it('should display user info when demo user is loaded', async () => {
    await renderWithChakra(<App />);
    
    await act(async () => {
      const loadButton = screen.getByText('Load Demo User');
      fireEvent.click(loadButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Current User:')).toBeInTheDocument();
    });
    expect(screen.getByText('demo@example.com')).toBeInTheDocument();
    expect(screen.getByText('Demo User')).toBeInTheDocument();
  });

  it('should clear user when clear button is clicked', async () => {
    await renderWithChakra(<App />);
    
    // Load user
    await act(async () => {
      const loadButton = screen.getByText('Load Demo User');
      fireEvent.click(loadButton);
    });

    // Verify user is loaded
    await waitFor(() => {
      expect(screen.getByText('Current User:')).toBeInTheDocument();
    });

    // Clear user
    await act(async () => {
      const clearButton = screen.getByText('Clear User');
      fireEvent.click(clearButton);
    });

    // Should show load button again (user is null, but users array still has data)
    // So we check that "Current User:" is not visible anymore
    await waitFor(() => {
      expect(screen.queryByText('Current User:')).not.toBeInTheDocument();
    });
  });

  it('should list all features', async () => {
    await renderWithChakra(<App />);
    
    expect(screen.getByText(/React 18 with TypeScript/)).toBeInTheDocument();
    expect(screen.getByText(/Vite for fast development/)).toBeInTheDocument();
    expect(screen.getByText(/Chakra UI component library/)).toBeInTheDocument();
    expect(screen.getByText(/Zustand for state management/)).toBeInTheDocument();
    expect(screen.getByText(/Jest for testing/)).toBeInTheDocument();
  });
});
