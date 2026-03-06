# RDF March

A simple Node.js calculator application with Jest tests.

## Installation

```bash
npm install
```

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Usage

```javascript
const calculator = require('./src/calculator');

console.log(calculator.add(2, 3));        // 5
console.log(calculator.subtract(5, 3));   // 2
console.log(calculator.multiply(3, 4));   // 12
console.log(calculator.divide(10, 2));    // 5
```

## Project Structure

```
rdf-march/
├── src/
│   └── calculator.js    # Calculator module  
├── tests/
│   └── calculator.test.js  # Jest tests
├── package.json
└── README.md
```
