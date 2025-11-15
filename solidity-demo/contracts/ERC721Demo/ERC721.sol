// SPDX-License-Identifier: MIT
// by 0xAA
pragma solidity ^0.8.21;

import "./IERC165.sol";
import "./IERC721.sol";
import "./IERC721Receiver.sol";
import "./IERC721Metadata.sol";
// import "./String.sol";

abstract contract ERC721 is IERC721, IERC721Metadata {
    // using Strings for uint256;

    string public override name;
    string public override symbol;

    mapping(uint => address) private _owners;
    mapping(address => uint) private _balances;
    mapping(uint => address) private _tokenApproval;
    mapping(address => mapping(address => bool)) private _operatorApproval;

    error ERC721InvalidReceiver(address receiver);

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId;
    }

    function balanceOf(address _owner)  external override view returns(uint num) {
        require(_owner != address(0), "owner = zero address");
        return _balances[_owner];
    }

    function ownerOf(uint256 _tokenId) public  override view returns(address ownerAddr) {
        ownerAddr = _owners[_tokenId];
        require(ownerAddr!=address(0), "token doesn't exist");
    }

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) private {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                if (retval != IERC721Receiver.onERC721Received.selector) {
                    revert ERC721InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert ERC721InvalidReceiver(to);
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        }
    }

    function _isApprovedOrOwner(address owner,address spender,uint tokenId) private view returns (bool) {
        return (spender == owner ||
            _tokenApproval[tokenId] == spender ||
            _operatorApproval[owner][spender]);
    }

    function _approve(address owner, address to, uint256 tokenId) private {
        _tokenApproval[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function _transfer(address owner, address from, address to, uint256 tokenId) private {
        require(from == owner, "not owner");
        require(to != address(0), "transfer to the zero address");

        _approve(owner, address(0), tokenId);

        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function _safeTransfer(address owner, address from, address to, uint tokenId, bytes memory _data) private {
        _transfer(owner, from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, _data);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public override {
        address _oAddr = _owners[tokenId];
        require(_isApprovedOrOwner(_oAddr, msg.sender, tokenId), "not owner nor approved");

        _safeTransfer(_oAddr, from, to, tokenId, _data);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external override {
        safeTransferFrom(from, to, tokenId, "");
    }

    function transferFrom(address from, address to, uint256 _token) external override {
        address owner = ownerOf(_token);
        require(_isApprovedOrOwner(owner, msg.sender, _token), "not owner nor approved");

        _transfer(owner, from, to, _token);
    }

    function approve(address to, uint tokenId) external override {
        address owner = _owners[tokenId];

        require(
            msg.sender == owner || _operatorApproval[owner][msg.sender],
            "not owner nor approved for all"
        );

        _approve(owner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external override {
        _operatorApproval[msg.sender][operator] = approved;

        emit ApprovalForAll(msg.sender, operator, approved);

    }

    function getApproved(uint256 tokenId) external view returns (address operator) {
        require(_owners[tokenId] != address(0), "token doesn't exist");
        return _tokenApproval[tokenId];
    }

    function isApprovedForAll(address owner, address operator) external view returns (bool) {
        return _operatorApproval[owner][operator];
    }

    function _mint(address to, uint tokenId) internal virtual {
        require(to != address(0), "mint to zero address");
        require(_owners[tokenId] == address(0), "token already minted");

        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }

    function _burn(uint tokenId) internal virtual {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner, "not owner of token");

        _approve(owner, address(0), tokenId);

        _balances[owner] -= 1;
        delete _owners[tokenId];

        emit Transfer(owner, address(0), tokenId);
    }

    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }
    

    // function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    //     require(_owners[tokenId] != address(0), "Token Not Exist");

    //     string memory baseURI = _baseURI();
    //     return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    // }

}