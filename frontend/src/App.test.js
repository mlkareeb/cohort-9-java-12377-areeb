import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sign in and sign up toggle buttons', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
});