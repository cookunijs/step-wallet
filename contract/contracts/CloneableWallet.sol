pragma solidity ^0.5.10;

import "./ERC721/ERC721Receivable.sol";
import "./ERC721X/ERC721XReceiver.sol";
import "./ERC223/ERC223Receiver.sol";
import "./KeyManager.sol";

contract CloneableWallet is ERC721Receivable, ERC223Receiver, ERC721XReceiver {

	uint public constant AUTHORIZED = 1;
	uint public constant RECOVERY = 2;
	uint public nonce;
	address public keyManager;
	address public cosigner;
	bool public initialized;

	event Authorized(address _keyManager, address _cosigner);
	event EmergencyRecovered(address _cosigner);
	event Received(address from, uint value);
	event InvocationSuccess(address _to, bytes _data, bool success);

	function() external payable {
		require(msg.data.length == 0, "Invalid transaction.");
		if (msg.value > 0) {
			emit Received(msg.sender, msg.value);
		}
	}

	function init(address _cosigner, address _keyManager) external {
		require(!initialized, "must not already be initialized");
		require(_cosigner != KeyManager(_keyManager).addresses(AUTHORIZED), "Do not use the authorized address as a cosigner.");
		require(_cosigner != KeyManager(_keyManager).addresses(RECOVERY), "Do not use the recovery address as a cosigner.");
		require(_cosigner != address(0), "Initial cosigner must not be zero.");
		require(_keyManager != address(0), "Authorized addresses must not be zero.");

		cosigner = _cosigner;
		keyManager = _keyManager;
		initialized = true;

		emit Authorized(_keyManager, _cosigner);
	}

	function invoke(uint8[2] calldata v, bytes32[2] calldata r, bytes32[2] calldata s, uint _nonce, address _authorized, bytes calldata _data, address _to, uint _value) external {
		require(nonce == _nonce, "invalid nonce");
		require(v[0] == 27 || v[0] == 28, "invalid signature version v[0]");
		require(v[1] == 27 || v[1] == 28, "invalid signature version v[1]");

	  bytes32 _operationHash = createHashInvoke(_nonce, _authorized, _data);
		address _signer = ecrecover(_operationHash, v[0], r[0], s[0]);
		address _cosigner = ecrecover(_operationHash, v[1], r[1], s[1]);

		require(_signer != address(0), "Invalid signature for signer.");
		require(_cosigner != address(0), "Invalid signature for cosigner.");
		require(_signer == KeyManager(keyManager).addresses(AUTHORIZED), "authorized addresses must be equal");
		require(_cosigner == cosigner, "cosigner addresses must be equal");

		nonce++;

		require(executeCall(_to, _value, _data));
	}

	function emergencyRecovery(uint8[2] calldata v, bytes32[2] calldata r, bytes32[2] calldata s, uint _nonce, address _cosigner) external {
		require(nonce == _nonce, "invalid nonce");
		require(v[0] == 27 || v[0] == 28, "invalid signature version v[0]");
		require(v[1] == 27 || v[1] == 28, "invalid signature version v[1]");
		require(_cosigner != KeyManager(keyManager).addresses(AUTHORIZED), "Do not use the authorized address as a cosigner.");
		require(_cosigner != KeyManager(keyManager).addresses(RECOVERY), "Do not use the recovery address as a cosigner.");
		require(_cosigner != address(0), "The cosigner must not be zero.");

		bytes32 _operationHash = createHashRecovery(_nonce, _cosigner);
		address _signer = ecrecover(_operationHash, v[0], r[0], s[0]);
		address _recover = ecrecover(_operationHash, v[1], r[1], s[1]);

		require(_signer != address(0), "Invalid signature for signer.");
		require(_recover != address(0), "Invalid signature for recover.");
		require(KeyManager(keyManager).addresses(AUTHORIZED) == _signer, "Invalid authorization in signer");
		require(KeyManager(keyManager).addresses(RECOVERY) == _recover, "Invalid authorization in recover");

		nonce++;
		cosigner = _cosigner;

		emit EmergencyRecovered(_cosigner);
	}

	function createHashInvoke(uint _nonce, address _authorized, bytes memory _data) public view returns(bytes32) {
		bytes32 _hash = keccak256(
			abi.encodePacked(
				this,
				_nonce,
				_authorized,
				_data
			)
		);
		return keccak256(
			abi.encodePacked(
					"\x19Ethereum Signed Message:\n32",
					_hash
			)
		);
	}

	function createHashRecovery(uint _nonce, address _cosigner) public view returns(bytes32) {
		bytes32 _hash = keccak256(
			abi.encodePacked(
				this,
				_nonce,
				_cosigner
			)
		);
		return keccak256(
			abi.encodePacked(
				"\x19Ethereum Signed Message:\n32",
				_hash
			)
		);
	}

	function executeCall(address _to, uint256 _value, bytes memory _data) internal returns (bool success) {
		assembly {
			success := call(gas, _to, _value, add(_data, 0x20), mload(_data), 0, 0)
		}
		emit InvocationSuccess(_to, _data, success);
	}
}