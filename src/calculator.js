/**
 * Simple calculator module
 */

/**
 * Adds two numbers together.
 * @param {number} a - The first number
 * @param {number} b - The second number
 * @returns {number} The sum of a and b
 * @example
 * add(5, 3); // returns 8
 * add(-2, 7); // returns 5
 */
function add(a, b) {
  return a + b;
}

/**
 * Subtracts the second number from the first number.
 * @param {number} a - The number to subtract from
 * @param {number} b - The number to subtract
 * @returns {number} The difference of a and b
 * @example
 * subtract(10, 3); // returns 7
 * subtract(5, 8); // returns -3
 */
function subtract(a, b) {
  return a - b;
}

/**
 * Multiplies two numbers together.
 * @param {number} a - The first number
 * @param {number} b - The second number
 * @returns {number} The product of a and b
 * @example
 * multiply(4, 5); // returns 20
 * multiply(-3, 6); // returns -18
 */
function multiply(a, b) {
  return a * b;
}

/**
 * Divides the first number by the second number.
 * @param {number} a - The dividend
 * @param {number} b - The divisor
 * @returns {number} The quotient of a and b
 * @throws {Error} If the divisor is zero
 * @example
 * divide(10, 2); // returns 5
 * divide(7, 2); // returns 3.5
 */
function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

/**
 * Raises a base number to a power.
 * @param {number} base - The base number
 * @param {number} power - The exponent
 * @returns {number} The result of base raised to power
 * @throws {Error} If base is not a valid number
 * @throws {Error} If power is not a valid number
 * @example
 * exponent(2, 3); // returns 8
 * exponent(5, 2); // returns 25
 * exponent(10, 0); // returns 1
 * exponent(2, -1); // returns 0.5
 * @note Returns 1 for 0^0 per JavaScript convention
 */
function exponent(base, power) {
  if (typeof base !== 'number' || Number.isNaN(base)) {
    throw new Error('Base must be a valid number');
  }
  if (typeof power !== 'number' || Number.isNaN(power)) {
    throw new Error('Power must be a valid number');
  }
  return base ** power;
}

module.exports = {
  add,
  subtract,
  multiply,
  divide,
  exponent
};
