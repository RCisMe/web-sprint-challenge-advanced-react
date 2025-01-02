import server from './backend/mock-server';
import React from 'react';
import AppFunctional from './frontend/components/AppFunctional';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

jest.setTimeout(1000); // default 5000 too long for Codegrade
const queryOptions = { exact: false };

let up, down, left, right, reset, submit;
let squares, coordinates, steps, message, email;

const updateStatelessSelectors = (document) => {
  up = document.querySelector('#up');
  down = document.querySelector('#down');
  left = document.querySelector('#left');
  right = document.querySelector('#right');
  reset = document.querySelector('#reset');
  submit = document.querySelector('#submit');
};

const updateStatefulSelectors = (document) => {
  squares = document.querySelectorAll('.square');
  coordinates = document.querySelector('#coordinates');
  steps = document.querySelector('#steps');
  message = document.querySelector('#message');
  email = document.querySelector('#email');
};

const testSquares = (squares, activeIdx) => {
  squares.forEach((square, idx) => {
    if (idx === activeIdx) {
      expect(square.textContent).toBe('B');
      expect(square.className).toMatch(/active/);
    } else {
      expect(square.textContent).toBeFalsy();
      expect(square.className).not.toMatch(/active/);
    }
  });
};

test('AppFunctional is a functional component', () => {
  expect(
    AppFunctional.prototype && AppFunctional.prototype.isReactComponent
  ).not.toBeTruthy();
});

[AppFunctional].forEach((Component) => {
  describe('AppFunctional Tests', () => {
    beforeAll(() => { server.listen(); });
    afterAll(() => { server.close(); });
    beforeEach(() => {
      render(<Component />);
      updateStatelessSelectors(document);
      updateStatefulSelectors(document);
    });
    afterEach(() => {
      server.resetHandlers();
      document.body.innerHTML = '';
    });

    describe('Active Square Navigation', () => {
      test('Initial State - Active Square should be index 4', () => {
        testSquares(squares, 4);
      });

      test('Move Up - Active Square should be index 1', () => {
        fireEvent.click(up);
        testSquares(squares, 1);
      });

      test('Move Left from Up - Active Square should be index 0', () => {
        fireEvent.click(up);
        fireEvent.click(left);
        testSquares(squares, 0);
      });

      test('Move Right from Up - Active Square should be index 2', () => {
        fireEvent.click(up);
        fireEvent.click(right);
        testSquares(squares, 2);
      });
    });

    describe('Coordinates Updates', () => {
      test('Initial State - Coordinates should be (2, 2)', () => {
        expect(coordinates.textContent).toMatch(/\(2.*2\)$/);
      });

      test('Move Right - Coordinates should be (3, 2)', () => {
        fireEvent.click(right);
        expect(coordinates.textContent).toMatch(/\(3.*2\)$/);
      });

      test('Move Down - Coordinates should be (3, 3)', () => {
        fireEvent.click(down);
        expect(coordinates.textContent).toMatch(/\(3.*3\)$/);
      });
    });

    describe('Steps Counter', () => {
      test('Steps should increment correctly', () => {
        fireEvent.click(up);
        fireEvent.click(left);
        expect(steps.textContent).toBe('You moved 2 times');
      });

      test('Steps counter resets correctly after reset', () => {
        fireEvent.click(up);
        fireEvent.click(left);
        fireEvent.click(reset);
        expect(steps.textContent).toBe('You moved 0 times');
      });
    });

    describe('Reset Button Functionality', () => {
      test('Resets coordinates, steps, and message', () => {
        fireEvent.click(up);
        fireEvent.click(reset);
        expect(coordinates.textContent).toMatch(/\(2.*2\)$/);
        expect(steps.textContent).toBe('You moved 0 times');
        expect(message.textContent).toBeFalsy();
      });
    });

    describe('Form Submit Tests', () => {
      test('Submit form with email', async () => {
        fireEvent.change(email, { target: { value: 'lady@gaga.com' } });
        fireEvent.click(submit);

        // Use `findByText` directly with the appropriate query options
        const successMessage = await screen.findByText('lady win #31', queryOptions);
        expect(successMessage).toBeInTheDocument();
      });

      test('Submit form with invalid email', async () => {
        fireEvent.change(email, { target: { value: 'bad@email' } });
        fireEvent.click(submit);

        const errorMessage = await screen.findByText('Ouch: email must be a valid email', queryOptions);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
