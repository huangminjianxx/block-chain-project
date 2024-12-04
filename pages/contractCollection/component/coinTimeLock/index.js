'use client';
//合约地址：0x085491796fDB6e5Bf5b595246e0e139c690417fd
//第二次：0x00d145eFdabcAa7d772755C4E4258562F8cd97EC
//0x80605Ec7AFF7D602Cdff13f74693143F89cd8312
//0x74f3b3e6D0af640Df0DD1595845760EE2a5372E0
const getUserWithdrawInforAbi = [
    {
        "inputs": [
          {
            "internalType": "address",
            "name": "acount",
            "type": "address"
          }
        ],
        "name": "getUserWithdrawInfor",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "moneyAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "withdrawTime",
                "type": "uint256"
              }
            ],
            "internalType": "struct TimeLock.UserInfor[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
]

const depositAbi = [
    {
      type: "function",
      name: "deposit",
      stateMutability: "payable",
      inputs: [
        {
          internalType: "uint256",
          name: "time",
          type: "uint256",
        },
      ],
      outputs: [],
    },
]

const withdrawAbi = [
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
  ]
import { useEffect, useState , useCallback} from 'react';
import { parseEther } from "viem";
import { BigNumber, ethers } from "ethers";
import { Input, DatePicker, Button } from 'antd';
import { http, useReadContract, useWriteContract } from "wagmi";
import { useAccount } from "@ant-design/web3";
import { Mainnet, WagmiWeb3ConfigProvider, MetaMask, Sepolia } from '@ant-design/web3-wagmi';
import dayjs from 'dayjs';
// import { getUserWithdrawInforAbi, depositAbi , withdrawAbi } from '../../../../components/abi'
import styles from './index.module.scss'
import moment from 'moment';
const contractAddress = "0x74f3b3e6D0af640Df0DD1595845760EE2a5372E0"
const ALCHEMY_GOERLI_URL = 'https://eth-sepolia.g.alchemy.com/v2/6IC7PZjP5PR1jVIAfr1dsK0VNCB87Tou';
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_GOERLI_URL);
const abiWETH = [
    "event UserDeposit(address indexed origin,uint256 amount,uint256 lockTime)",
    "event UserWithdraw(address indexed origin,uint256 amount,uint withdrawTime)"
];
const contract = new ethers.Contract(contractAddress, abiWETH, provider)

export default function CoinTimeLock() {
    const GetUserWithdrawInfor = () => {
        const { account } = useAccount();
        const withdrawInfor = useReadContract({
            abi: getUserWithdrawInforAbi,
            address: contractAddress,
            functionName: 'getUserWithdrawInfor',
            args: [account?.address],
            chainId:Sepolia.id
        })
        const [, updateState] = useState();
        const forceUpdate = useCallback(() => updateState({}), []);

        const list = withdrawInfor.data || []
        return (
            <div className={styles.userWithdrawInfor}>
                <span onClick={forceUpdate}>刷新</span>
                {
                    list.length ?
                    list.map(item => {
                        return (
                            <div className={styles.userWithdrawItem}>
                                {moment.unix(item.withdrawTime.toString()).format('YYYY-MM-DD HH:mm:ss')}
                                后可以领取
                                <span>{ethers.utils.formatEther(item.moneyAmount)}</span>eth
                            </div>
                        )
                    }) : '暂无存款信息'
                }
            </div>
        )
    }

    const [moneyInput,setMoneyInput] = useState('')
    const addressChange = (e) => {
        setMoneyInput(e.target.value)
    }

    const [timeInput,setTimeInput] = useState('')
    const dateOnChange = (date,dateString) => {
        setTimeInput(new Date(date).getTime()/1000)
    }

    const DepositBtn = () => {
        const { writeContract } = useWriteContract();
        const startDeposit = () => {
            writeContract(
                {
                  abi: depositAbi,
                  address: contractAddress,
                  functionName: "deposit",
                  args: [timeInput],
                  value: parseEther(moneyInput),
                  chainId:Sepolia.id
                },
                {
                  onSuccess: () => {
                    console.log("Success")
                  },
                  onError: (err) => {
                    console.log("fail",err)
                  },
                }
            );
        }
          return (
            <Button onClick={startDeposit}>存入</Button>
          )
    }

    const WithdrawBtn = () => {
        const { writeContract } = useWriteContract();
        const startWithdraw = () => {
            writeContract(
                {
                  abi: withdrawAbi,
                  address: contractAddress,
                  functionName: "withdraw",
                  args: [],
                  value: "",
                  chainId:Sepolia.id
                },
                {
                  onSuccess: () => {
                    console.log("Success")
                  },
                  onError: (err) => {
                    console.log("fail",err)
                  },
                }
            );
        }
        return (
            <Button onClick={startWithdraw}>取款</Button>
        )
    }

    //历史存款记录
    const [depositHistory,setDepositHistory] = useState([])
    const getDepositHistory = async () => {
        const block = await provider.getBlockNumber()
        const depositEvents = await contract.queryFilter('UserDeposit', 0, block)
        const depositEventsLength = depositEvents.length;
        const tempDepositHistory = []
        for(let i=depositEventsLength - 1;i<depositEventsLength && i > 0;i--){
            if(tempDepositHistory.length <= 10){
                const item = depositEvents[i]
                const tempItem = {
                    address:item.args[0],
                    depositTime:moment.unix(item.args["lockTime"].toString()).format('YYYY-MM-DD HH:mm:ss'),
                    amount:ethers.utils.formatEther(item.args["amount"])
                }
                tempDepositHistory.push(tempItem)
            }else{
                break;
            }
        }
        setDepositHistory(tempDepositHistory)
    }
    const startListenDeposit = useCallback(() => {
        contract.on("UserDeposit", (origin,amount,lockTime) => {
            setDepositHistory((preList) => {
                const tempDepositHistory = JSON.parse(JSON.stringify(preList))
                const tempItem = {
                    address:origin,
                    depositTime:moment.unix(lockTime.toString()).format('YYYY-MM-DD HH:mm:ss'),
                    amount:ethers.utils.formatEther(amount)
                }
                tempDepositHistory.push(tempItem)
                return tempDepositHistory
            })
        })
    },[])

    //历史取款记录
    const [withdrawHistory,setWithdrawHistory] = useState([])
    const getWithdrawHistory = async () => {
        const block = await provider.getBlockNumber()
        const withdrawEvents = await contract.queryFilter('UserWithdraw', 0, block)
        const withdrawEventsLength = withdrawEvents.length;
        const tempWithdrawHistory = []
        for(let i=withdrawEventsLength - 1;i<withdrawEventsLength && i >= 0;i--){
            if(tempWithdrawHistory.length <= 10){
                const item = withdrawEvents[i]
                const tempItem = {
                    address:item.args[0],
                    withdrawTime:moment.unix(item.args["withdrawTime"].toString()).format('YYYY-MM-DD HH:mm:ss'),
                    amount:ethers.utils.formatEther(item.args["amount"])
                }
                tempWithdrawHistory.push(tempItem)
            }else{
                break;
            }
        }
        setWithdrawHistory(tempWithdrawHistory)
    }
    const startListenWithdraw = () => {
        contract.on("UserWithdraw", (origin,amount,withdrawTime) => {
            setWithdrawHistory((preList) => {
                const tempWithdrawHistory = JSON.parse(JSON.stringify(preList))
                const tempItem = {
                    address:origin,
                    depositTime:moment.unix(withdrawTime.toString()).format('YYYY-MM-DD HH:mm:ss'),
                    amount:ethers.utils.formatEther(amount)
                }
                tempWithdrawHistory.push(tempItem)
                return tempWithdrawHistory
            })
        })
    }

    const removeListener = () => {
        contract.removeAllListeners("UserDeposit");
        contract.removeAllListeners("UserWithdraw");
    }


    useEffect(() => {
        getDepositHistory()
        startListenDeposit()
        getWithdrawHistory()
        startListenWithdraw()
        return () => {
            removeListener()
        }
    },[])

    return (
        <WagmiWeb3ConfigProvider
            chains={[Mainnet,Sepolia]}
            transports={{
                [Mainnet.id]: http(),
                [Sepolia.id]: http(),
            }}
            wallets={[MetaMask()]}
        >
        <div className={styles.coinTimeLock}>
            {/* 代币时间锁2
            <Input 
                value={moneyInput}
                onChange={addressChange}
            />
            <DatePicker
                format="YYYY-MM-DD HH:mm:ss"
                // disabledDate={disabledDate}
                onChange={dateOnChange}
                showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
            /><br/>
            <DepositBtn/>
            <GetUserWithdrawInfor/>
            <WithdrawBtn/> */}
            <div className={styles.withdrwaHistory}>
                历史存款记录
                {
                    depositHistory.map(item => {
                        return (
                            <div>
                                <span>{item.address}</span>在
                                <span>{item.depositTime}</span>存入
                                <span>{item.amount}</span>
                            </div>
                        )
                    })
                }
            </div>
            <div className={styles.withdrwaHistory}>
                历史取款记录
                {
                    withdrawHistory.map(item => {
                        return (
                            <div>
                                <span>{item.address}</span>在
                                <span>{item.withdrawTime}</span>取出
                                <span>{item.amount}</span>
                            </div>
                        )
                    })
                }
            </div>
        </div>
        </WagmiWeb3ConfigProvider>
    );
}
