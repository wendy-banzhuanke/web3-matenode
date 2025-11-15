// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;


import "hardhat/console.sol";

contract FunctionTypes {
    uint256 public number = 5;

    uint[] x = [1,2,3];

    uint[8] array1;
    bytes2[5] array2;
    address[100] array3;

    uint[] array4;
    bytes3[] array5;
    address[] array6;
    bytes array7;

    struct Student {
        uint256 id;
        string name;
        uint256 score;
    }

    Student student;

    mapping(uint => address) public idToAddress;
    mapping(address => address) public swapPair;

    // custom type not as key !!!
    // mapping(Student => uint) public testare;

    bool public _bool;
    string public _string;
    int public _int;
    uint public _uint;
    address public _address;
    enum ActionSet {Buy, Hold, Sell}
    ActionSet public _enum;
    bytes1 public _bytes1;

    function fi() internal {}
    function fe() external {}

    uint[8] public _staticArray;
    uint[] public _dynamicArray;
    mapping(uint => address) public _mapping;

    struct Student11 {
        uint id;
        uint score;
    }

    Student public student11;

    bool public _bool2 = true;

    function fd() public {
        delete _bool2;
    }

    function writeMap(uint _key, address _value) public {
        idToAddress[_key] = _value;
    } 

    function writeMap1(uint _key, address _value) public  {
        writeMap(_key, _value);
    }

    function Student1() external {
        Student storage student1 = student;
        student1.id = 3434;
        student1.name = "zhangsan";
        student1.score = 100;
    }

    function fArray() external view {
        console.log("Owner contract deployed by:", 1, 2);
        uint[8] memory array8 = array1;
        // bytes memory array9 = new bytes(9);
        array8[0] = 1000; //uint256[3](12,3,4);
        // array9[0] = 101;

        uint[] memory x1 = new uint[](3);
        x1[0] = 1;
        x1[1] = 2;
        x1[2] = 3;
    }



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