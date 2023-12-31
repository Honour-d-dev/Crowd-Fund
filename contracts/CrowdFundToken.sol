// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract CrowdFundToken is ERC20, Ownable, ERC20Permit {
  constructor(address initialOwner) ERC20("CrowdFundToken", "CFT") Ownable(initialOwner) ERC20Permit("CrowdFundToken") {
    _mint(msg.sender, 1000 * 10 ** decimals());
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }
}
