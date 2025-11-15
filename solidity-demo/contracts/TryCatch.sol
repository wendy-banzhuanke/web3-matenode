// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract OnlyEven {
    constructor(uint a) {
        require(a != 0, "invalid number");
        assert(a != 1);
    }

    function onlyEven(uint256 b) external pure returns(bool success) {
        require(b % 2 == 0, "Ups! Reverting");
        success = true;
    }
}

contract TryCatch {
    event SuccessEvent();

    event CatchEvent(string message);
    event CatchByte(bytes data);

    OnlyEven even;

    constructor(uint a) {
        even = new OnlyEven(a);
    }

    function execute(uint256 amount) external returns(bool success) {
        try even.onlyEven(amount) returns(bool _success){
            emit SuccessEvent();
            return _success;
        } catch Error(string memory err){
            emit CatchEvent(err);
        }
    }

    function executeNew(uint a) external returns (bool success) {
        try new OnlyEven(a) returns(OnlyEven _even){
            // if call succeeds
            emit SuccessEvent();
            success = _even.onlyEven(a);
        } catch Error(string memory reason) {
            // catch revert("reasonString") and require(false, "reasonString")
            emit CatchEvent(reason);
        } catch (bytes memory reason) {
            // catch assert() of failure, the error type of assert is Panic(uint256) instead of Error(string), so it will go into this branch
            emit CatchByte(reason);
        }
    }
}