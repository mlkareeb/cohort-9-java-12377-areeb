import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sign in and sign up toggle buttons', () => {
  render(<App />);
  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  expect(screen.getByText(/sign up/i)).toBeInTheDocument();
});