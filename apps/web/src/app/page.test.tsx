import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('exibe o título da aplicação', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { level: 1, name: /agendamento de sessões/i }),
    ).toBeInTheDocument();
  });
});
