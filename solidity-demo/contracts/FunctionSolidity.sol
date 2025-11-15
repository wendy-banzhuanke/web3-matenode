// SPDX-License-Identifier: MTT

pragma solidity ^0.8.21;

contract FunctionTypes {
    uint256 public number = 5;

    uint[] x = [1,2,3];

    function fMemory() public view{
        uint[] memory xMemory = x;
        xMemory[0] = 101;
        xMemory[1] = 202;
        uint[] memory xMemory2 = x;
        xMemory2[1] = 10000;
    }

    function fMemory1() public view{
        //Declare a variable xMemory of Memory, copy x. Modifying xMemory will not affect x
        uint[] memory xMemory = x;
        xMemory[0] = 100;
    }

    function fCallTest() public view {
        fMemory();
    }
}