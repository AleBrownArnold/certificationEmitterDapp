// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Certificate is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter public _tokenIds;

  constructor() ERC721("Certificate", "CRT") { }

  function awardItem(address receiver, string memory tokenURI) public returns (uint256) {
    uint256 newItemId = _tokenIds.current();
    
    _safeMint(receiver, newItemId);
    _setTokenURI(newItemId, tokenURI);

    _tokenIds.increment();
    return newItemId;
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 firstTokenId,
    uint256 batchSize
  ) internal override virtual {
    require (from == address(0) || to == address(0), "This is not a transferable token");
  }
}
