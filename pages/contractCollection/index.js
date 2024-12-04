'use client';
import { Menu } from 'antd';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { WalletColorful, WalletWhiteColorful } from '@ant-design/web3-icons';
import { useState,lazy } from 'react';
import { http } from "wagmi";
import { Mainnet, WagmiWeb3ConfigProvider, MetaMask, Sepolia } from '@ant-design/web3-wagmi';
import { Address, NFTCard, Connector, ConnectButton } from "@ant-design/web3";
import Erc20Coin from './component/erc20Coin';
import styles from './index.module.scss'
const CoinTimeLock = lazy(() => delayForDemo(import('./component/coinTimeLock/index.js')));


export default function ContractCollection() {

    const [currentKey, setCurrentKey] = useState('erc20Coin')

    const items = [
        {
            key: 'erc20Coin',
            label: 'ERC20 代币',
            icon: <MailOutlined />,
        },
        {
            key: 'coinTimeLock',
            label: '代币时间锁',
            icon: <AppstoreOutlined />,
        },

    ];

    const selectItem = (item) => {
        setCurrentKey(item.key)
    }

    const renderComponentFunc = () => {
        if (currentKey === 'erc20Coin') {
            return (
                <Erc20Coin

                />
            )
        } else if (currentKey === 'coinTimeLock') {
            return (
                <CoinTimeLock

                />
            )
        } else {
            return null
        }
    }

    return (
        <WagmiWeb3ConfigProvider
            chains={[Mainnet,Sepolia]}
            transports={{
                [Mainnet.id]: http(),
                [Sepolia.id]: http(),
            }}
            wallets={[MetaMask()]}
        >
            <div className={styles.contractCollection}>
                <div className={styles.menuContent}>
                    <Menu
                        style={{ height: '100%' }}
                        defaultSelectedKeys={['erc20Coin']}
                        mode="inline"
                        items={items}
                        onSelect={selectItem}
                        inlineCollapsed={false}
                    />
                </div>
                <div className={styles.main}>
                    <div className={styles.mainHeader}>
                        <span className={styles.title}>Contract collection</span>
                        <Connector>
                            <ConnectButton 
                                type="link" 
                                actionsMenu
                                avatar={{
                                    src: 'https://mdn.alipayobjects.com/huamei_mutawc/afts/img/A*9jfLS41kn00AAAAAAAAAAAAADlrGAQ/original',
                                }}
                            />
                        </Connector>
                    </div>

                    <div className={styles.renderComponent}>
                        {renderComponentFunc()}
                    </div>
                </div>
            </div>
        </WagmiWeb3ConfigProvider>

    );
}
