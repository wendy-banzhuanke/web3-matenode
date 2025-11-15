// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract ConstantSolidity {
    uint constant CONSTANT_NUM = 10;
    string constant CONSTANT_STR = "zhangsan";
    bytes constant CONSTANT_BYTES = "0X00haha";
    address constant CONSTANT_ADDRESS = 0x0000000000000000000000000000000000000000;

    uint256 public immutable IMMUTABLE_NUM = 9999999;
    address public immutable IMMUTABLE_ADDRESS;
    uint256 public immutable IMMUTABLE_BLOCK;
    uint256 public immutable IMMUTABLE_TEST;

    constructor() {
        IMMUTABLE_ADDRESS = address(this);
        IMMUTABLE_BLOCK = block.number;
        IMMUTABLE_TEST = test();
    }

    function test() public pure returns(uint256) {
        uint256 what = 9;
        return(what);
    }

    function ifElseTest(uint256 _number) public pure returns(bool) {
        if(_number == 0) {
            return(true);
        } else {
            return(false);
        }
    }

    function forLoopTest() public pure returns(uint256) {
        uint sum = 0;
        for(uint i = 0; i< 10; i++) {
            sum += i;
        }
        return(sum);
    } 

    function doWhileTest() public pure returns(uint256) {
        uint sum = 0;
        uint i = 0;
        do {
            sum += i;
            i++;
        } while (i < 10);
        return(sum);
    }

    // function ternaryTest(uint256 x, uint256 y) public pure returns(uint256) {
    //     return x >= y ? x : y;
    // }
    
}

