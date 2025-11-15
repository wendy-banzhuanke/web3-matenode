// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract C {
    uint256 public  num;
    address public  sender;

    function setVars(uint256 _num) public payable {
        num = _num;
        sender = msg.sender;
    }
}

contract B {
    uint256 public num;
    address public sender;

    event Log(bool success, address sender, bytes data);

    function callToSetVars(address addr, uint256 _num) public payable {
        (bool success, bytes memory data)= addr.call(
            abi.encodeWithSignature("setVars(uint256)", _num)
        );

        emit Log(success,msg.sender, data);
    }

    function delegateToSetVars(address addr, uint256 _num) public payable {
        (bool success, bytes memory data) = addr.delegatecall(
            abi.encodeWithSignature("setVars(uint256)", _num)
        );

        emit Log(success,msg.sender, data);
    }
} 