// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract SendETH {
    constructor() payable {}

    receive() external payable {}

    event Log(uint value);

    function transferETH(address payable _to, uint256 amount) external payable {
        _to.transfer(amount);
    }

    function SendFailed() public payable   {
        // emit Log();
    }

    function SendETHDemo(address payable _to, uint256 amount) external payable {
        bool success = _to.send(amount);
        if(!success) {
            // revert SendFailed();
        }
    } 

    function CallETHDemo(address payable _to, uint256 amount) external payable {
        (bool success, ) = _to.call{value: amount}("");
        if(!success) {
            // revert CallFailed();
        }
    }
}