### Testing

1. **Jest Testing Setup**

The project uses Jest as its primary testing framework. Tests are located in `__tests__` directories throughout the codebase, with the main test files in `src/utils/__tests__/`.

To run tests:

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage

# Run specific test file
yarn test RotationProvider.test.ts
```

2. **Test File Structure**

Tests are organized following the Jest convention:
- Test files are suffixed with `.test.ts` or `.spec.ts`
- Tests are grouped in `describe` blocks
- Individual test cases use `it()` or `test()`

Example test structure:
```typescript
import { someFunction } from '../path-to-file';

describe('Component/Function Name', () => {
  it('should do something specific', () => {
    // Test setup
    const result = someFunction();
    // Assertions
    expect(result).toBe(expectedValue);
  });
});
```

3. **Current Test Files**

Location: `src/utils/__tests__/`
- `RotationProvider.test.ts`: Tests for provider rotation functionality
- `marketsAndNetworkConfig.spec.ts`: Tests for network configuration

4. **Test Results**

When tests are run, you'll see output similar to:

```
Test Suites: 2 passed, 2 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        5.559 s, estimated 12 s
```

This indicates:
- Number of test suites (files) that passed/failed
- Total number of individual tests passed/failed
- Snapshot test results (if any)
- Time taken to run tests