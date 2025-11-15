// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Grandfather {
    // mapping(address => uint256) public override balanceOf;
    event Log(string msg);

    function hip() public virtual {
        emit Log("Grandfather");
    }

    function pop() public virtual {
        emit Log("Grandfather");
    }

    function Grandfather1() public virtual {
        emit Log("Grandfather");
    }
}

contract Father is Grandfather{
    function hip() public virtual override {
        emit Log("Father");
    }
    function pop() public virtual override {
        emit Log("Father");
    }
    function father() public virtual {
        emit Log("Father");
    }
}

contract Son is Grandfather, Father{
    // Apply inheritance to the following 2 functions: hip() and pop()， then change the log value to "Son".
    function hip() public virtual override(Grandfather, Father){
        emit Log("Son");
    }

    function pop() public virtual override(Grandfather, Father) {
        emit Log("Son");
    }

    function _testA() public {
        Grandfather.pop();
    }

    function _testB() public {
        super.pop();
    }
}


contract Base1 {
    modifier exactDividedBy2And3(uint _a) virtual {
        require(_a % 2 == 0 && _a % 3 == 0);
        _;
    }
}

contract Identifier is Base1 {

    modifier exactDividedBy2And3(uint _a) override {
        _;
        require(_a % 2 == 0 && _a % 3 == 0);
    }


    // Calculate _dividend/2 and _dividend/3, but the _dividend must be a multiple of 2 and 3
    function getExactDividedBy2And3(uint _dividend) public exactDividedBy2And3(_dividend) pure returns(uint, uint) {
        return getExactDividedBy2And3WithoutModifier(_dividend);
    }

    // Calculate _dividend/2 and _dividend/3
    function getExactDividedBy2And3WithoutModifier(uint _dividend) public pure returns(uint, uint){
        uint div2 = _dividend / 2;
        uint div3 = _dividend / 3;
        return (div2, div3);
    }
}

contract A {
    uint256 a;
    constructor(uint256 _a) {
        a = _a;
    }
}

contract B is A(1) {

}

contract C is A {
    uint256 _c;
    constructor(uint c) A(_c * _c) {

    }
}