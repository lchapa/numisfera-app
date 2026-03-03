package com.numisfera.api.security.services;

import org.springframework.stereotype.Service;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;

@Service
public class Web3AuthService {

    public boolean verifySignature(String publicAddress, String signature, String message) {
        try {
            // Personal sign message prefix
            String prefix = "\u0019Ethereum Signed Message:\n" + message.length();
            byte[] messageHash = Hash.sha3((prefix + message).getBytes());

            // Check signature formatting
            byte[] signatureBytes = Numeric.hexStringToByteArray(signature);
            if (signatureBytes.length != 65) {
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

            // Keys.getAddress() generates the address from public key without "0x"
            String recoveredAddress = "0x" + Keys.getAddress(publicKey);

            return recoveredAddress.equalsIgnoreCase(publicAddress);
        } catch (Exception e) {
            System.err.println("Web3 signature verification failed: " + e.getMessage());
            return false;
        }
    }
}
