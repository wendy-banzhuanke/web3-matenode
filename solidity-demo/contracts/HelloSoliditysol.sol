// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.21;

contract HelloSolidity {
    string public hello = "hello solidity";

    bool public _bool = true;

    // boolean
    // bool public _bool1 = !_bool;
    // bool public _bool2 = _bool && _bool1;
    // bool public _bool3 = _bool || _bool1;
    // bool public _bool4 = _bool == _bool1;
    // bool public _bool5 = _bool != _bool1;

    // Integer
    // int public _int = -1;
    // uint public _uint = 1;
    // uint256 public _number = 20251104;
    // uint256 public _number1 = _number + 1;
    // uint256 public _number2 = 2**2;
    // uint256 public _number3 = 7%2;
    // bool public _number4 = _number2 > _number3;

    // address public _address = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    // address payable _address1 = payable(_address);
    // uint256 public _balance = _address1.balance;

    // bytes32 public _bytes32 = "zhangjian";
    // bytes1 public _bytes = _bytes32[0];

    enum ActionSet {Buy, Hold, Self}

    ActionSet action = ActionSet.Buy;
    
    bool public a = 1-1==0&&1%2==1;

    bytes32 public _bytes32 = "zhangjian";
    bytes4 public _bytes = _bytes32[0];

}