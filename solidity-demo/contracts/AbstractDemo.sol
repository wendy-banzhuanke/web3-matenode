// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

abstract contract AbstractDemo {
    string public name = "hello";
    function insertionSort() public pure virtual returns(string memory);
}

contract demoA is AbstractDemo{
    function insertionSort() public pure override returns(string memory) {
        return "demoA";
    }
}

interface iA {
    function getFirstName() external pure returns(string memory);
}

contract iB is iA{
    function getFirstName() external pure override returns(string memory) {
        return "hello";
    }
}

// contract interactBAYC {
//     IERC721 BAYC = IERC721(0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D);
// }