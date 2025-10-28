// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrganNFT is ERC721, ERC721URIStorage, Ownable {
    enum Status { Donated, Transferred, Transplanted }

    struct Organ {
        string organType;
        string bloodType;
        uint256 createdAt;
        Status status;
    }

    mapping(uint256 => Organ) public organs;
    uint256 public nextTokenId;

    event OrganDonated(uint256 tokenId, address donor, string organType, string bloodType);
    event OrganTransferred(uint256 tokenId, address hospital);
    event OrganTransplanted(uint256 tokenId, address recipient);

    constructor() ERC721("OrganNFT", "ONFT") {}

    function mintOrgan(
        address donor,
        string memory organType,
        string memory bloodType,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId;
        _safeMint(donor, tokenId);
        _setTokenURI(tokenId, tokenURI);

        organs[tokenId] = Organ({
            organType: organType,
            bloodType: bloodType,
            createdAt: block.timestamp,
            status: Status.Donated
        });

        nextTokenId++;
        emit OrganDonated(tokenId, donor, organType, bloodType);
        return tokenId;
    }

    function transferToHospital(uint256 tokenId, address hospital) public {
        require(ownerOf(tokenId) != hospital, "Already with hospital");
        require(organs[tokenId].status == Status.Donated, "Not in donated status");

        _transfer(msg.sender, hospital, tokenId);
        organs[tokenId].status = Status.Transferred;
        emit OrganTransferred(tokenId, hospital);
    }

    function transplant(uint256 tokenId, address recipient) public {
        require(ownerOf(tokenId) != recipient, "Already with recipient");
        require(organs[tokenId].status == Status.Transferred, "Not transferred to hospital");

        _transfer(msg.sender, recipient, tokenId);
        organs[tokenId].status = Status.Transplanted;
        emit OrganTransplanted(tokenId, recipient);
    }

    function getOrgan(uint256 tokenId) public view returns (Organ memory) {
        return organs[tokenId];
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
