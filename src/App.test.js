import { render, screen } from '@testing-library/react';
import App from './App';

test('renders bijlesengels app', () => {
  render(<App />);
  // Check if the header with "BIJLESSEN ENGELS" is rendered
  const headerElement = screen.getByText(/bijlessen engels/i);
  expect(headerElement).toBeInTheDocument();
});
