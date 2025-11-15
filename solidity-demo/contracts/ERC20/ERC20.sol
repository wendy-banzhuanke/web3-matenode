// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import  "./IERC20.sol";
// interface IERC20 {
//     event Transfer(address from, address to, uint256 amount);
//     event Approval(address owner, address spender, uint256 value);

//     function totalSupply() external returns(uint256);
//     function balanceOf(address account) external returns(uint256);
//     function transfer(address to, uint256 amount) external returns(bool);
//     function allowance(address owner, address spender) external returns(uint256);
//     function approval(address spender, uint256 amount) external returns(bool);
//     function transferFrom(address from, address to, uint256 amount) external returns(bool);
// }

contract ERC20 is IERC20 {
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;
    uint256 public totalSupply;

    string public name;
    string public symbol;
    uint8 public decimals = 18;

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function transfer(address to, uint256 amount) external returns(bool result) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        result=true;
    }

    function approve(address spender, uint256 amount) external returns(bool result) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        result = true;
    }

    function transferFrom(address sender, address to, uint256 amount) external returns(bool result) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount; 
        balanceOf[to] += amount;

        emit Transfer(sender, to, amount);

        result = true;
    }

    
    
    
    
    
    
    
    function mint(uint amount) external {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external {
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

}