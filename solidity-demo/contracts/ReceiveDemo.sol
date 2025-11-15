// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract ReceiveDemo {
    event Log(uint amount, uint gas);

    event Received(address Sender, uint value);

    receive() external payable {
        emit Received(msg.sender, msg.value);
        emit Log(msg.value, gasleft());
    }

    event fallbackCalled(address Sender, uint value, bytes data);

    fallback() external payable {
        emit fallbackCalled(msg.sender, msg.value, msg.data);
    }

    function getBalance() view public returns(uint) {
        return address(this).balance;
    }
}