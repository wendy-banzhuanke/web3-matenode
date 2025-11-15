// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Overloading1 {
    function saySomething() public pure returns(string memory) {
        return("Nothing");
    }

    function saySomething(string memory something) public pure returns(string memory) {
        return(something);
    }

    function f1(uint8 _in) public pure returns(uint8 out) {
        out = _in;
    }

    function f1(uint256 _in) public pure returns(uint256 out) {
        out = _in;
    }
}