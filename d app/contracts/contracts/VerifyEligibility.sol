// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VerifyEligibility
 * @notice Smart contract to verify and store medical eligibility ZKP proofs
 * @dev Uses Groth16 verification for privacy-preserving eligibility checks
 */

interface IGroth16Verifier {
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[1] calldata _pubSignals
    ) external view returns (bool);
}

contract VerifyEligibility {
    // Verifier contract instance
    IGroth16Verifier public verifier;

    // Struct for storing verification results
    struct VerificationResult {
        bool eligible;
        uint256 timestamp;
        string transactionHash;
        address verifier;
    }

    // Mapping from credential hash to verification result
    mapping(bytes32 => VerificationResult) public results;

    // Events
    event ProofVerified(
        bytes32 indexed credentialHash,
        bool eligible,
        uint256 timestamp,
        address indexed verifier
    );

    event ResultStored(
        bytes32 indexed credentialHash,
        bool eligible,
        string transactionHash
    );

    // Modifiers
    modifier onlyValidResult(bytes32 _credentialHash) {
        require(
            results[_credentialHash].timestamp > 0,
            "No verification result found"
        );
        _;
    }

    /**
     * @notice Initialize the contract with default verifier
     */
    constructor() {
        // Initialize with default address - can be updated later
        verifier = IGroth16Verifier(address(0));
    }

    /**
     * @notice Verify proof and store result on-chain
     * @param _pA First component of proof point A
     * @param _pB First component of proof point B
     * @param _pC First component of proof point C
     * @param _pubSignals Public signals (eligibility status)
     * @return success Whether verification was successful
     */
    function verifyAndStoreProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[1] calldata _pubSignals
    ) external returns (bool success) {
        // Verify the proof
        require(
            verifier.verifyProof(_pA, _pB, _pC, _pubSignals),
            "Proof verification failed"
        );

        // Extract eligibility status (1 = eligible, 0 = not eligible)
        bool eligible = _pubSignals[0] == 1;

        // Generate credential hash from public signals
        bytes32 credentialHash = keccak256(abi.encodePacked(_pubSignals));

        // Store result
        results[credentialHash] = VerificationResult({
            eligible: eligible,
            timestamp: block.timestamp,
            transactionHash: "",
            verifier: msg.sender
        });

        emit ProofVerified(credentialHash, eligible, block.timestamp, msg.sender);
        return true;
    }

    /**
     * @notice Store verification result with transaction hash
     * @param _credentialHash Hash of the credential
     * @param _eligible Eligibility status
     * @param _txHash Transaction hash reference
     */
    function storeResult(
        bytes32 _credentialHash,
        bool _eligible,
        string calldata _txHash
    ) external {
        require(_credentialHash != bytes32(0), "Invalid credential hash");

        results[_credentialHash] = VerificationResult({
            eligible: _eligible,
            timestamp: block.timestamp,
            transactionHash: _txHash,
            verifier: msg.sender
        });

        emit ResultStored(_credentialHash, _eligible, _txHash);
    }

    /**
     * @notice Get verification result
     * @param _credentialHash Hash of the credential
     * @return Verification result struct
     */
    function getResult(bytes32 _credentialHash)
        external
        view
        onlyValidResult(_credentialHash)
        returns (VerificationResult memory)
    {
        return results[_credentialHash];
    }

    /**
     * @notice Check if credential is eligible
     * @param _credentialHash Hash of the credential
     * @return True if eligible, false otherwise
     */
    function isEligible(bytes32 _credentialHash)
        external
        view
        onlyValidResult(_credentialHash)
        returns (bool)
    {
        return results[_credentialHash].eligible;
    }

    /**
     * @notice Get eligibility status string
     * @param _credentialHash Hash of the credential
     * @return Status string
     */
    function getStatus(bytes32 _credentialHash)
        external
        view
        onlyValidResult(_credentialHash)
        returns (string memory)
    {
        return results[_credentialHash].eligible ? "ELIGIBLE" : "NOT_ELIGIBLE";
    }

    /**
     * @notice Check if result exists for credential
     * @param _credentialHash Hash of the credential
     * @return True if result exists
     */
    function resultExists(bytes32 _credentialHash)
        external
        view
        returns (bool)
    {
        return results[_credentialHash].timestamp > 0;
    }

    /**
     * @notice Get verification timestamp
     * @param _credentialHash Hash of the credential
     * @return Timestamp of verification
     */
    function getTimestamp(bytes32 _credentialHash)
        external
        view
        onlyValidResult(_credentialHash)
        returns (uint256)
    {
        return results[_credentialHash].timestamp;
    }

    /**
     * @notice Update verifier contract
     * @param _newVerifier Address of new verifier
     */
    function updateVerifier(address _newVerifier) external {
        require(_newVerifier != address(0), "Invalid verifier address");
        verifier = IGroth16Verifier(_newVerifier);
    }
}
