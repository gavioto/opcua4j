/* SecurityAlgorithms class.
    Purpose: Query the set of security algorithms used by an OPC UA security policy.
    Revision History: 
        Apr-15-2010 RTD: Initial version.
*/

/* TODO:
        the CTT could have the built-in strings for the following algorithms:
        - symmetric signature
        - symmetric encryption
        - asymmetric key wrap
        - key derivation
*/      

function SecurityAlgorithms()
{
    this.SymmetricSignatureAlgorithm = "";
    this.SymmetricEncryptionAlgorithm = "";
    this.AsymmetricSignatureAlgorithm = "";
    this.AsymmetricKeyWrapAlgorithm= "";
    this.AsymmetricEncryptionAlgorithm = "";
    this.KeyDerivationAlgorithm = "";
}

SecurityAlgorithms.getAlgorithms = function( securityPolicy )
{
    var algorithms = new SecurityAlgorithms();
    
    switch ( securityPolicy )
    {
        case SecurityPolicy.Basic128Rsa15:
            algorithms.SymmetricSignatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
            algorithms.SymmetricEncryptionAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes128-cbc";
            algorithms.AsymmetricSignatureAlgorithm = SignatureAlgorithm.signatureAlgorithmToString( SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1 );
            algorithms.AsymmetricKeyWrapAlgorithm = "http://www.w3.org/2001/04/xmlenc#rsa-1_5";
            algorithms.AsymmetricEncryptionAlgorithm = EncryptionAlgorithm.encryptionAlgorithmToString( EncryptionAlgorithm.AlgorithmUri_Encryption_Rsa15 );
            algorithms.KeyDerivationAlgorithm = "http://docs.oasis-open.org/ws-sx/ws-secureconversation/200512/dk/p_sha1";
            break;
            
        case SecurityPolicy.Basic256:
            algorithms.SymmetricSignatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
            algorithms.SymmetricEncryptionAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
            algorithms.AsymmetricSignatureAlgorithm = SignatureAlgorithm.signatureAlgorithmToString( SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1 );
            algorithms.AsymmetricKeyWrapAlgorithm = "http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p";
            algorithms.AsymmetricEncryptionAlgorithm = EncryptionAlgorithm.encryptionAlgorithmToString( EncryptionAlgorithm.AlgorithmUri_Encryption_RsaOaep );
            algorithms.KeyDerivationAlgorithm = "http://docs.oasis-open.org/ws-sx/ws-secureconversation/200512/dk/p_sha1";
            break;            
    }
    
    return algorithms;
}

// Test code.
/*var policy = SecurityPolicy.Basic128Rsa15;
print( "Policy: " + SecurityPolicy.policyToString( policy ) );

var alg = SecurityAlgorithms.getAlgorithms( policy );

print( "Symmetric signature algorithm: " + alg.SymmetricSignatureAlgorithm );
print( "Symmetric encryption algorithm: " + alg.SymmetricEncryptionAlgorithm );
print( "Asymmetric signature algorithm: " + alg.AsymmetricSignatureAlgorithm );
print( "Asymmetric key wrap algorithm: " + alg.AsymmetricKeyWrapAlgorithm );
print( "Asymmetric encryption algorithm: " + alg.AsymmetricEncryptionAlgorithm );
print( "Key derivation algorithm: " + alg.KeyDerivationAlgorithm ); */
