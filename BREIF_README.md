# Project Handover Documentation

## Architecture & Tech Stack

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
src/
├── components/ # Reusable UI components
├── hooks/ # Custom React hooks including Web3 hooks
├── libs/ # Core libraries and Web3 providers
├── modules/ # Feature-specific modules (governance, dashboard)
├── store/ # Zustand store slices
├── ui-config/ # Network and market configurations
└── utils/ # Utility functions and helpers


### State Management Architecture

1. **Zustand Store**
Main store slices:
- Pool Slice: Handles lending pool operations
- Governance Slice: Manages governance operations
- Wallet Slice: Manages wallet state
- Stake Slice: Handles staking operations

Example implementation:
- typescript:src/hooks/governance-data-provider/AaveTokensDataProvider.tsx
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
- typescript:src/ui-config/networksConfig.ts
- startLine: 63
- endLine: 113


### Key Features

1. **Governance**
- Token delegation
- Proposal voting
- Power delegation
- Governance forum integration

2. **Staking**
- AAVE staking
- Rewards claiming
- Cooldown period management

3. **Dashboard**
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







