// export { default as WalletConnectProvider } from './provider/WalletConnectProvider'
// export * from './context/WalletContext'

import './index.css';

// Components
import WalletConnectKitProvider from './provider/WalletConnectProvider';
import { ConnectButton } from './components/ConnectButton';
export { WalletConnectKitProvider, ConnectButton };

// Hooks
import { useWallet } from './hooks/useWallet';
import { useChains } from './hooks/useChains';
export { useWallet, useChains };

// Types
export type { WalletState } from './context/WalletContext';
export type { WalletType } from './constants/wallets';
export type { EthereumProvider } from './type/index';

// Default Export
export default {
  WalletConnectKitProvider,
  ConnectButton,
  useWallet,
  useChains
};