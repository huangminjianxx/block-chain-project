'use client';
export const getUserWithdrawInforAbi = [
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

export const depositAbi = [
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

export const withdrawAbi = [
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
  ]