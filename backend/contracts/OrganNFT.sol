// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrganNFT is ERC721("OrganNFT", "ONFT"), Ownable {
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

    constructor() Ownable(msg.sender) {}

    function mintOrgan(
        address donor,
        string memory organType,
        string memory bloodType,
        string memory /*tokenURI*/
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId;
        _safeMint(donor, tokenId);

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

        _transfer(ownerOf(tokenId), hospital, tokenId);
        organs[tokenId].status = Status.Transferred;
        emit OrganTransferred(tokenId, hospital);
    }

    function transplant(uint256 tokenId, address recipient) public {
        require(ownerOf(tokenId) != recipient, "Already with recipient");
        require(organs[tokenId].status == Status.Transferred, "Not transferred to hospital");

        _transfer(ownerOf(tokenId), recipient, tokenId);
        organs[tokenId].status = Status.Transplanted;
        emit OrganTransplanted(tokenId, recipient);
    }

    function getOrgan(uint256 tokenId) public view returns (string memory organType, string memory bloodType, uint256 createdAt, uint256 status) {
        Organ memory organ = organs[tokenId];
        return (organ.organType, organ.bloodType, organ.createdAt, uint256(organ.status));
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
