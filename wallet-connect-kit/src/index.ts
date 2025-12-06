// export { default as WalletConnectProvider } from './provider/WalletConnectProvider'
// export * from './context/WalletContext'

import './index.css';

// Components
import WalletConnectKitProvider from './provider/WalletConnectProvider';
export { WalletConnectKitProvider };

// Hooks
import { useWallet } from './hooks/useWallet';
import { useChains } from './hooks/useChains';
import { ConnectButton } from './components/ConnectButton';
export { useWallet, useChains, ConnectButton };

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