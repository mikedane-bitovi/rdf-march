const calculator = require('../src/calculator');

describe('Calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(calculator.add(-5, -3)).toBe(-8);
    });

    it('should add zero', () => {
      expect(calculator.add(5, 0)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      expect(calculator.subtract(5, 3)).toBe(2);
    });

    it('should handle negative results', () => {
      expect(calculator.subtract(3, 5)).toBe(-2);
    });
  });

  describe('multiply', () => {
    it('should multiply two positive numbers', () => {
      expect(calculator.multiply(3, 4)).toBe(12);
    });

    it('should multiply by zero', () => {
      expect(calculator.multiply(5, 0)).toBe(0);
    });

    it('should multiply negative numbers', () => {
      expect(calculator.multiply(-3, -4)).toBe(12);
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should handle decimal results', () => {
      expect(calculator.divide(5, 2)).toBe(2.5);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => calculator.divide(5, 0)).toThrow('Cannot divide by zero');
    });
  });

  describe('exponent', () => {
    it('should calculate basic positive integer exponents', () => {
      expect(calculator.exponent(2, 3)).toBe(8);
      expect(calculator.exponent(3, 2)).toBe(9);
      expect(calculator.exponent(5, 3)).toBe(125);
    });

    it('should handle power of zero', () => {
      expect(calculator.exponent(5, 0)).toBe(1);
      expect(calculator.exponent(100, 0)).toBe(1);
      expect(calculator.exponent(-5, 0)).toBe(1);
    });

    it('should handle power of one', () => {
      expect(calculator.exponent(5, 1)).toBe(5);
      expect(calculator.exponent(42, 1)).toBe(42);
      expect(calculator.exponent(-7, 1)).toBe(-7);
    });

    it('should handle negative exponents', () => {
      expect(calculator.exponent(2, -2)).toBe(0.25);
      expect(calculator.exponent(10, -1)).toBe(0.1);
      expect(calculator.exponent(5, -2)).toBe(0.04);
    });

    it('should handle base of zero', () => {
      expect(calculator.exponent(0, 5)).toBe(0);
      expect(calculator.exponent(0, 100)).toBe(0);
      expect(calculator.exponent(0, 1)).toBe(0);
    });

    it('should handle edge case: 0^0', () => {
      expect(calculator.exponent(0, 0)).toBe(1);
    });

    it('should handle fractional exponents', () => {
      expect(calculator.exponent(4, 0.5)).toBe(2);
      expect(calculator.exponent(27, 1/3)).toBeCloseTo(3, 10);
      expect(calculator.exponent(16, 0.25)).toBe(2);
    });

    it('should handle negative bases with even exponents', () => {
      expect(calculator.exponent(-2, 2)).toBe(4);
      expect(calculator.exponent(-3, 4)).toBe(81);
    });

    it('should handle negative bases with odd exponents', () => {
      expect(calculator.exponent(-2, 3)).toBe(-8);
      expect(calculator.exponent(-5, 3)).toBe(-125);
    });

    // Input validation tests
    describe('input validation', () => {
      it('should throw error for non-numeric base - string', () => {
        expect(() => calculator.exponent('5', 2)).toThrow('Base must be a valid number');
      });

      it('should throw error for non-numeric base - null', () => {
        expect(() => calculator.exponent(null, 2)).toThrow('Base must be a valid number');
      });

      it('should throw error for non-numeric base - undefined', () => {
        expect(() => calculator.exponent(undefined, 2)).toThrow('Base must be a valid number');
      });

      it('should throw error for non-numeric power - string', () => {
        expect(() => calculator.exponent(2, '3')).toThrow('Power must be a valid number');
      });

      it('should throw error for non-numeric power - null', () => {
        expect(() => calculator.exponent(2, null)).toThrow('Power must be a valid number');
      });

      it('should throw error for non-numeric power - undefined', () => {
        expect(() => calculator.exponent(2, undefined)).toThrow('Power must be a valid number');
      });

      it('should throw error for NaN base', () => {
        expect(() => calculator.exponent(NaN, 2)).toThrow('Base must be a valid number');
      });

      it('should throw error for NaN power', () => {
        expect(() => calculator.exponent(2, NaN)).toThrow('Power must be a valid number');
      });

      it('should allow Infinity as base', () => {
        expect(calculator.exponent(Infinity, 2)).toBe(Infinity);
        expect(calculator.exponent(-Infinity, 2)).toBe(Infinity);
      });

      it('should allow Infinity as power', () => {
        expect(calculator.exponent(2, Infinity)).toBe(Infinity);
        expect(calculator.exponent(0.5, Infinity)).toBe(0);
      });

      it('should allow Infinity for both base and power', () => {
        expect(calculator.exponent(Infinity, Infinity)).toBe(Infinity);
      });
    });
  });
});
