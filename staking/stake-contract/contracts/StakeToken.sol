// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // IERC20: ERC20 标准接口，用于与代币交互。
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // SafeERC20: 提供安全的 ERC20 转账（防止未检查返回值的攻击）。
import "@openzeppelin/contracts/utils/Address.sol"; // Address: 地址工具库（如检查是否为合约）。
import "@openzeppelin/contracts/utils/math/Math.sol"; // Math: 安全数学运算（防溢出）。
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";  // Upgradeable 模式: 合约支持通过 UUPS 代理模式升级
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol"; // AccessControl: 基于角色的权限管理（如 ADMIN_ROLE）。
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol"; // Pausable: 允许管理员暂停关键功能（如提现）。

/*
 *   Initializable: 支持代理模式下初始化逻辑。
 *   UUPSUpgradeable: 用户可升级的代理模式（需手动管理升级逻辑）。
 *   Pausable: 可暂停合约（避免紧急情况下的资金风险）。
 *   AccessControl: 权限控制（如管理员、升级权限）。
 */ 
abstract contract StakeToken is Initializable, UUPSUpgradeable, PausableUpgradeable, AccessControlUpgradeable {

    /*
     * 为 ERC20 接口添加安全操作（如防重入的 safeTransfer），替换原生 transfer。
     * IERC20(token).safeTransfer(user, amount); // 自动检查返回值
     * 若不使用 SafeERC20，需手动检查返回值：
     * bool success = IERC20(token).transfer(user, amount);
     * require(success, "Transfer failed");
     */
    using SafeERC20 for IERC20; 
    /*
     * 为地址类型添加工具函数，如检查是否为合约地址（isContract）或安全发送 ETH（sendValue）。
     * if (userAddress.isContract()) {// 与合约交互的逻辑}
     */
    using Address for address;
    /*
     * 为无符号整数添加安全的数学运算（如防溢出的 tryAdd、tryMul）。
     * (bool success, uint256 result) = a.tryAdd(b);
     * require(success, "Addition overflow");
     */
    using Math for uint256;

    // ************************************** INVARIANT **************************************
    
    /*
     * 作用：通过 keccak256 哈希生成唯一的角色标识符，确保权限全局唯一。
     * ADMIN_ROLE：管理常规敏感操作（如修改质押参数、暂停合约）。
     * UPGRADE_ROLE：专门控制合约升级权限（需与 UUPSUpgradeable 配合）。
     * public constant：公开常量，节省 Gas（编译时替换值，不占用存储）。
     */
    bytes32 public constant ADMIN_ROLE = keccak256("admin_role");
    bytes32 public constant UPGRADE_ROLE = keccak256("upgrade_role");
    /*
     * 作用：ETH 质押池的固定 ID（pool[0]），其他池从 ID 1 开始。
     * 特殊处理 ETH：ETH 不是 ERC20，其地址为 address(0)，需单独逻辑（如 depositETH 函数）。
     * 硬编码常量：避免魔法数字（Magic Number），提升代码可读性。
     */
    uint256 public constant ETH_PID = 0;

    // ************************************** DATA STRUCTURE **********************************


    struct Pool {
        address stTokenAddress; // 质押代币地址（ETH池为0x0）
        uint256 poolWeight; // 权重（决定奖励分配比例）
        uint256 lastRewardBlock; // 最后一次发放奖励的区块
        uint256 accRewardPAKEAAAPreST; // 每质押代币累计的奖励（精度1e18），类似于 AMM 中的“累积奖励”，通过 (奖励 * 1e18) / 质押总量 计算。
        uint256 stTokenAmount; // 池中质押代币总量
        uint256 minDepositAmount; // 最小质押量 
        uint256 unstakeLockedBlocks; // 解质押锁定区块个数
    }

    struct UnstakeRequest {
        uint256 amount; // 用户取消质押的代币数量，要取出多少个 token
        uint256 unlockBlocks; // 解质押的区块高度
    }

    struct User {
        uint256 stAmount; // 用户质押量
        uint256 finishedRewardPAKEAAA; // 已领取的奖励
        uint256 pendingRewardPAKEAAA; // 待领取的奖励
        UnstakeRequest[] requests; // 解质押请求队列
    }

    /**
        奖励公式：
        pendingReward=(stAmount*accRewardPAKEAAAPreST)/1e18-finishedMetaNode+pendingMetaNode
    */

    // ************************************** STATE VARIABLES ********************************

    uint256 public startBlock; // 质押开始区块
    uint256 public endBlock; // 质押结束区块
    uint256 public PAKEAAAPerBlock; // 每个区块的奖励数量
    bool public withdrawPaused; // 提现是否暂停
    bool public claimPaused; // 领取奖励是否暂停
    IERC20 public PAKEAAA; // MetaNode 代币合约
    uint256 public totalPoolWeight; // 所有资金池的权重总和，用来分配奖励的
    Pool[] public pool; // 资金池列表
    mapping(uint256 => mapping(address => User)) public user; // 资金池 id => 用户地址 => 用户信息  // pool id => user address => user info

    // ************************************** EVENT **************************************

}