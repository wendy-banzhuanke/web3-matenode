// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract DeleteContract {
    uint256 public value = 10;

    constructor() {}

    receive() external payable {}

    function deleteContract() external {
        selfdestruct(payable(msg.sender));

    }

    function getBalance() external view returns(uint256 amount) {
        amount = address(this).balance;
    }

}