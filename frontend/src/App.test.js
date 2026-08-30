import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sign in and sign up toggle buttons', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /switch to sign in/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /switch to sign up/i })).toBeInTheDocument();
});