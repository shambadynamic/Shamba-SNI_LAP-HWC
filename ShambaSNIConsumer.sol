//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@shambadynamic/contracts/contracts/utils/ShambaChainSelector.sol";

contract ShambaSNIConsumer is ChainlinkClient, ShambaChainSelector {
    using Chainlink for Chainlink.Request;

    ShambaChainSelector shambaChainSelector;

    string private cid;

    uint256 public total_oracle_calls = 0;

    mapping(uint256 => string) private cids;

    mapping(uint256 => string) private recordWhat;

    mapping(uint256 => string) private predator;

    mapping(uint256 => string) private geometry_map;

    struct Geometry {
        uint256 property_id;
        string coordinates;
    }

    function getGeometry(uint256 property_id)
        public
        view
        returns (string memory)
    {
        return geometry_map[property_id];
    }

    function getCid(uint256 index) public view returns (string memory) {
        return cids[index];
    }

    constructor(uint256 chain_id) ShambaChainSelector(chain_id) {
        
        shambaChainSelector = new ShambaChainSelector(chain_id);
        setChainlinkToken(shambaChainSelector.linkTokenContractAddress());
        setChainlinkOracle(shambaChainSelector.operatorAddress());
    }

    function concat(string memory a, string memory b)
        private
        pure
        returns (string memory)
    {
        return (string(abi.encodePacked(a, "", b)));
    }

    function compare(string memory s1, string memory s2)
        private
        pure
        returns (bool)
    {
        return
            keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
    }
    

    function sendRequest(
        string memory category,
        string memory start_date,
        string memory end_date,
        Geometry[] memory geometry
    ) public {

        require(compare(category, "LAP") || compare(category, "HWC"), "Invalid Category");

        bytes32 specId;
        Chainlink.Request memory req;
        
        if (compare(category, "LAP")) {
            specId = shambaChainSelector.jobSpecId("sni-lap");

            req = buildChainlinkRequest(
                specId,
                address(this),
                this.fulfill_SNI_LAP.selector
            );
        }
        else if (compare(category, "HWC")) {
            specId = shambaChainSelector.jobSpecId("sni-hwc");

            req = buildChainlinkRequest(
                specId,
                address(this),
                this.fulfill_SNI_HWC.selector
            );
        }

        uint256 payment = 10 ** 18;

        string memory concatenated_data = concat('{"category":"', category);
        concatenated_data = concat(concatenated_data, '", "start_date":"');
        concatenated_data = concat(concatenated_data, start_date);
        concatenated_data = concat(concatenated_data, '", "end_date":"');
        concatenated_data = concat(concatenated_data, end_date);
        concatenated_data = concat(
            concatenated_data,
            '", "geometry":{"type":"FeatureCollection","features":['
        );

        for (uint256 i = 0; i < geometry.length; i++) {

            geometry_map[geometry[i].property_id] = geometry[i].coordinates;

            concatenated_data = concat(
                concatenated_data,
                '{"type":"Feature","properties":{"id":'
            );
            concatenated_data = concat(
                concatenated_data,
                Strings.toString(geometry[i].property_id)
            );
            concatenated_data = concat(
                concatenated_data,
                '},"geometry":{"type":"Polygon","coordinates":'
            );
            concatenated_data = concat(
                concatenated_data,
                geometry[i].coordinates
            );
            concatenated_data = concat(concatenated_data, "}}");

            if (i != geometry.length - 1) {
                concatenated_data = concat(concatenated_data, ",");
            }
        }
        concatenated_data = concat(concatenated_data, "]}}");
        string memory req_data = concatenated_data;

        req.add("data", req_data);

        sendOperatorRequest(req, payment);
    }

    function fulfill_SNI_LAP(
        bytes32 requestId,
        uint256[] memory dataIdList,
        string[] memory recordWhatList,
        string calldata cidValue
    ) public recordChainlinkFulfillment(requestId) {

        for (uint256 i = 0; i < dataIdList.length; i++) {
            recordWhat[dataIdList[i]] = recordWhatList[i];
        }

        cid = cidValue;
        cids[total_oracle_calls] = cid;
        total_oracle_calls = total_oracle_calls + 1;
    }

    function fulfill_SNI_HWC(
        bytes32 requestId,
        uint256[] memory dataIdList,
        string[] memory predatorList,
        string calldata cidValue
    ) public recordChainlinkFulfillment(requestId) {

        for (uint256 i = 0; i < dataIdList.length; i++) {
            predator[dataIdList[i]] = predatorList[i];
        }

        cid = cidValue;
        cids[total_oracle_calls] = cid;
        total_oracle_calls = total_oracle_calls + 1;
    }

    function getRecordWhat(uint256 dataId) public view returns (string memory) {
        return recordWhat[dataId];
    }

    function getPredator(uint256 dataId) public view returns (string memory) {
        return predator[dataId];
    }

    function getLatestCid() public view returns (string memory) {
        return cid;
    }
}