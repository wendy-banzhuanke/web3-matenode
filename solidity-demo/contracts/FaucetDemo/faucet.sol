// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import  "../ERC20Demo/IERC20.sol";

contract faucet {
    uint256 public amount = 100;
    address public erc20TokenAddress;
    mapping(address => bool) public requestAddress;

    event requestTransfer(address receiver, uint256 amount);

    constructor(address tokenAddr) {
        erc20TokenAddress = tokenAddr;
    }

    function requestTokens() external returns(bool success) {
        require(requestAddress[msg.sender] == false, "Can't Request Multiple Times!");

        IERC20 tokens = IERC20(erc20TokenAddress);

        require(tokens.balanceOf(address(this)) > amount, "Faucet Empty!");

        bool _result = tokens.transfer(msg.sender, amount);
        requestAddress[msg.sender] = true;
        
        success = _result;

        emit requestTransfer(msg.sender, amount);
    }

}