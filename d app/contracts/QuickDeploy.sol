// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QuickDeploy - Simple Medical Eligibility Contract
 * @notice Minimal contract for storing proof results on-chain
 */
contract VerifyEligibility {
    struct VerificationResult {
        bool eligible;
        uint256 timestamp;
        address verifier;
    }

    mapping(bytes32 => VerificationResult) public results;

    event ProofStored(
        bytes32 indexed credentialHash,
        bool eligible,
        uint256 timestamp,
        address verifier
    );

    /**
     * @notice Store proof result on-chain
     * @param _credentialHash Hash of credential
     * @param _eligible Eligibility status
     */
    function storeResult(
        bytes32 _credentialHash,
        bool _eligible
    ) external {
        require(_credentialHash != bytes32(0), "Invalid credential hash");

        results[_credentialHash] = VerificationResult({
            eligible: _eligible,
            timestamp: block.timestamp,
            verifier: msg.sender
        });

        emit ProofStored(_credentialHash, _eligible, block.timestamp, msg.sender);
    }

    /**
     * @notice Get result for credential
     * @param _credentialHash Hash of credential
     */
    function getResult(bytes32 _credentialHash)
        external
        view
        returns (VerificationResult memory)
    {
        return results[_credentialHash];
    }

    /**
     * @notice Check if eligible
     * @param _credentialHash Hash of credential
     */
    function isEligible(bytes32 _credentialHash)
        external
        view
        returns (bool)
    {
        return results[_credentialHash].timestamp > 0 ? results[_credentialHash].eligible : false;
    }
}
