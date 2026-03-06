const calculator = require("../src/calculator");

describe("Calculator", () => {
  describe("add", () => {
    it("should add two positive numbers", () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it("should add negative numbers", () => {
      expect(calculator.add(-5, -3)).toBe(-8);
    });

    it("should add zero", () => {
      expect(calculator.add(5, 0)).toBe(5);
    });
  });

  describe("subtract", () => {
    it("should subtract two numbers", () => {
      expect(calculator.subtract(5, 3)).toBe(2);
    });

    it("should handle negative results", () => {
      expect(calculator.subtract(3, 5)).toBe(-2);
    });
  });

  describe("multiply", () => {
    it("should multiply two positive numbers", () => {
      expect(calculator.multiply(3, 4)).toBe(12);
    });

    it("should multiply by zero", () => {
      expect(calculator.multiply(5, 0)).toBe(0);
    });

    it("should multiply negative numbers", () => {
      expect(calculator.multiply(-3, -4)).toBe(12);
    });
  });

  describe("divide", () => {
    it("should divide two numbers", () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it("should handle decimal results", () => {
      expect(calculator.divide(5, 2)).toBe(2.5);
    });

    it("should throw error when dividing by zero", () => {
      expect(() => calculator.divide(5, 0)).toThrow("Cannot divide by zero");
    });
  });

  describe("power", () => {
    it("should raise a positive base to a positive exponent", () => {
      expect(calculator.power(2, 3)).toBe(8);
    });

    it("should raise a positive base to 0", () => {
      expect(calculator.power(5, 0)).toBe(1);
    });

    it("should raise a positive base to a negative exponent", () => {
      expect(calculator.power(2, -1)).toBe(0.5);
    });

    it("should raise a negative base to an odd exponent", () => {
      expect(calculator.power(-2, 3)).toBe(-8);
    });

    it("should raise a negative base to an even exponent", () => {
      expect(calculator.power(-2, 2)).toBe(4);
    });

    it("should raise 0 to a positive exponent", () => {
      expect(calculator.power(0, 5)).toBe(0);
    });

    it("should handle decimal base with positive exponent", () => {
      expect(calculator.power(2.5, 2)).toBe(6.25);
    });

    it("should handle decimal exponent", () => {
      expect(calculator.power(4, 0.5)).toBe(2);
    });

    it("should handle 1 raised to any exponent", () => {
      expect(calculator.power(1, 100)).toBe(1);
    });

    it("should handle negative base with negative even exponent", () => {
      expect(calculator.power(-2, -2)).toBe(0.25);
    });
  });
});
