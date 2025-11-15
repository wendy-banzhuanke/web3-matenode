// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import  "../ERC20Demo/IERC20.sol";

contract airdrop {
    function getSum(uint256[] calldata _arr) public pure returns(uint256 sum) {
        for(uint i = 0; i<_arr.length; i++) 
            sum = sum + _arr[i];
    }

    function multiTransferToken(address _erc20Token, address[] calldata _address, uint256[] calldata _amount) external  {
        require(_address.length == _amount.length, "Lengths of Addresses and Amounts NOT EQUAL");
        uint256 _sum = getSum(_amount);

        IERC20 tokens = IERC20(_erc20Token);

        require(tokens.allowance(msg.sender, address(this)) > _sum, "Need Approve ERC20 token");

        for(uint i = 0; i<_address.length; i++) {
            tokens.transferFrom(msg.sender, _address[i], _amount[i]);
        }
    }
}