pragma solidity ^0.5.10;

contract KeyManager {

	event Initialized(address _authorized, address _recovery);
	event Reset(address _previous, address _new, uint _target);

	uint public AUTHORIZED = 1;
	uint public RECOVERY = 2;
	uint public nonce;
	mapping (uint => address) public addresses;

	constructor (address _authorized, address _recovery) public {
		require(_authorized != _recovery, "Do not use the recovery address as an authorized address.");
		require(_authorized != address(0), "Authorized address must not be zero.");
		require(_recovery != address(0), "Recovery　Address must not be zero.");
		addresses[AUTHORIZED] = _authorized;
		addresses[RECOVERY] = _recovery;
		emit Initialized(_authorized, _recovery);
	}

	function update(uint8[2] calldata v, bytes32[2] calldata r, bytes32[2] calldata s, uint _nonce, uint _target, address _new) external {
		require(nonce == _nonce, "invalid nonce");
		require(v[0] == 27 || v[0] == 28, "invalid signature version v[0]");
		require(v[1] == 27 || v[1] == 28, "invalid signature version v[1]");
		require(_target == AUTHORIZED || _target == RECOVERY, "Target mush be authorized address or recovery address");
		require(_new != address(0), "Authorized addresse must not be zero.");
		require(_new != addresses[AUTHORIZED] || _new != addresses[RECOVERY], "New Address must differ from previous addresses.");

		bytes32 _operationHash = createHash(_nonce, _target, _new);
		address _signer = ecrecover(_operationHash, v[0], r[0], s[0]);
		address _recover = ecrecover(_operationHash, v[1], r[1], s[1]);

		require(_signer != address(0), "Invalid signature for signer.");
		require(_recover != address(0), "Invalid signature for recover.");
		require(addresses[AUTHORIZED] == _signer, "Signature must be signed by authorized address");
		require(addresses[RECOVERY] == _recover, "Signature must be signed by recovery address");
	
		address _previous;
		_previous = addresses[_target];
		addresses[_target] = _new;
		nonce++;
		emit Reset(_previous, _new, _target);
	}

	function createHash(uint _nonce, uint _target, address _new) public view returns(bytes32){
		bytes32 _hash = keccak256(
			abi.encodePacked(
				this,
				_nonce,
				_target,
				_new
			)
		);
		return keccak256(
			abi.encodePacked(
				"\x19Ethereum Signed Message:\n32",
				_hash
			)
		);
	}
}
