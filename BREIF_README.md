# Architecture & Tech Stack

### Core Technologies
- **Frontend Framework**: Next.js (v12.1.1)
- **UI Library**: React (latest)
- **Type System**: TypeScript
- **State Management**: Zustand (v4.1.2)
- **UI Components**: Material UI (@mui/material v5.10.9)
- **Styling**: 
  - Emotion (@emotion/react v11.10.4)
  - @emotion/styled (v11.10.4)
  - @emotion/cache (v11.10.3)
- **Data Visualization**: @visx suite (v2.x)

### Web3 Integration
- **Core Libraries**:
  - ethers.js (v5.5.4)
  - @web3-react/core (v6.1.9)
  - @aave/contract-helpers (v1.13.7)
  - @aave/math-utils (v1.13.5)
  
- **Wallet Connectors**:
  - WalletConnect (@walletconnect/ethereum-provider v2.8.4)
  - Coinbase Wallet (walletlink-connector v6.2.14)
  - MetaMask (injected-connector)
  - Gnosis Safe
  - Ledger

### Folder Structure
src/\
├── components/ Reusable UI components\
├── hooks/ Custom React hooks including Web3 hooks\
├── libs/ Core libraries and Web3 providers\
├── modules/ Feature-specific modules (governance, dashboard)\
├── store/ Zustand store slices\
├── ui-config/ Network and market configurations\
└── utils/ Utility functions and helpers


### State Management Architecture

1. **Zustand Store**
Main store slices:
- Pool Slice: Handles lending pool operations
- Governance Slice: Manages governance operations
- Wallet Slice: Manages wallet state
- Stake Slice: Handles staking operations

Example implementation:
- [src/hooks/governance-data-provider/AaveTokensDataProvider.tsx](src/hooks/governance-data-provider/AaveTokensDataProvider.tsx)
- startLine: 23
- endLine: 79


2. **Context API**
Used for specific features:
- Web3 Context: Manages Web3 connection state
- Protocol Data Context: Handles protocol-specific data
- Modal Context: Manages application modals

### Network Configuration

The application supports multiple networks through a configuration-based approach:

1. **Supported Networks**:
- Ethereum Mainnet
- Etherlink
- Etherlink Testnet

Network configuration example:
  - [src/ui-config/networksConfig.ts](src/ui-config/networksConfig.ts)
  - startLine: 63
  - endLine: 113


### Key Features

1. **Staking**
  - Supply assets and earn interest
  - Borrow USDC, USDT & other assets seamlessly
  - Decentralized money market protocol

2. **Dashboard**
  - Asset overview
  - Transaction history
  - Reward tracking
  - Market statistics

### Testing & Development

1. **Fork Support**
The application supports running against forked networks for development and testing purposes. Configuration is done through localStorage:

```javascript
localStorage.setItem('forkEnabled', 'true');
localStorage.setItem('forkBaseChainId', <chainId>);
localStorage.setItem('forkNetworkId', '3030');
localStorage.setItem('forkRPCUrl', <rpcUrl>);
```

2. **Development Tools**
- TypeScript for type safety
- ESLint for code quality
- Zustand DevTools for state debugging

### API & SDK Integration

1. **Aave Protocol Integration**
- @aave/contract-helpers for protocol interactions
- @aave/math-utils for calculations
- Custom providers for specific features

2. **External Services**
- IPFS for governance proposals
- TheGraph for protocol data
- Multiple RPC providers for redundancy

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

5. **Testing Best Practices**

- Write descriptive test names that explain the expected behavior
- Use beforeEach/afterEach for test setup and cleanup
- Mock external dependencies using Jest's mocking capabilities
- Keep tests focused and isolated
- Aim for high test coverage of critical functionality

### Dependencies

For a complete list of dependencies and their versions, refer to package.json. Key dependencies include:

```json
{
"@aave/contract-helpers": "1.13.7",
"@aave/math-utils": "1.13.5",
"@emotion/react": "11.10.4",
"@mui/material": "5.10.9",
"ethers": "5.5.4",
"next": "12.1.1",
"react": "latest",
"zustand": "4.1.2"
}
```







