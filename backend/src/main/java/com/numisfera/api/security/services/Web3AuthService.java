package com.numisfera.api.security.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Service
public class Web3AuthService {

    private static final Logger logger = LoggerFactory.getLogger(Web3AuthService.class);

    public boolean verifySignature(String publicAddress, String signature, String message) {
        try {
            logger.info("Verifying signature for address: {}", publicAddress);
            logger.debug("Message to sign: {}", message);

            // Get bytes using UTF-8 to account for special characters like 'ñ'
            byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);

            // Personal sign message prefix uses BYTE length, not string char length
            String prefix = "\u0019Ethereum Signed Message:\n" + messageBytes.length;
            byte[] prefixBytes = prefix.getBytes(StandardCharsets.UTF_8);

            // Combine prefix + message
            byte[] fullMessageBytes = new byte[prefixBytes.length + messageBytes.length];
            System.arraycopy(prefixBytes, 0, fullMessageBytes, 0, prefixBytes.length);
            System.arraycopy(messageBytes, 0, fullMessageBytes, prefixBytes.length, messageBytes.length);

            // Hash the combined result using Keccak-256 (sha3 in Web3j)
            byte[] messageHash = Hash.sha3(fullMessageBytes);

            // Check signature formatting
            byte[] signatureBytes = Numeric.hexStringToByteArray(signature);
            if (signatureBytes.length != 65) {
                logger.error("Invalid signature length. Expected 65 bytes, got {}", signatureBytes.length);
                return false;
            }

            // Web3j extracts v from the final byte. Depending on client, v might be 27, 28,
            // or 0, 1.
            byte v = signatureBytes[64];
            if (v < 27) {
                v += 27;
            }

            Sign.SignatureData sd = new Sign.SignatureData(
                    v,
                    Arrays.copyOfRange(signatureBytes, 0, 32),
                    Arrays.copyOfRange(signatureBytes, 32, 64));

            // Recover public key
            BigInteger publicKey = Sign.signedMessageHashToKey(messageHash, sd);
            if (publicKey == null) {
                logger.error("Failed to recover public key from the message hash and signature");
                return false;
            }

            // Keys.getAddress() generates the address from public key without "0x"
            String recoveredAddress = "0x" + Keys.getAddress(publicKey);

            logger.info("Recovered address: {}", recoveredAddress);

            if (recoveredAddress.equalsIgnoreCase(publicAddress)) {
                logger.info("Cryptographic signature validation SUCCESS.");
                return true;
            } else {
                logger.warn("Validation FAILED. Expected: {}, but recovered: {}", publicAddress, recoveredAddress);
                return false;
            }
        } catch (Exception e) {
            logger.error("Web3 signature verification exception: ", e);
            return false;
        }
    }
}
