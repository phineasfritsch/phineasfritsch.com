#requires -Version 5.1
# verify/read-prod.ps1 -- O05
#
# ONE read-only way to look at production, in one command, and it must be
# BORING to use. Boring means no flags to remember, no login step, no "first
# set up the tunnel". A way of inspecting production that is interesting to run
# is a way of inspecting production that nobody runs -- and then nobody knows.
#
# Read-only is enforced here rather than merely intended: this script issues a
# GET and nothing else. Do not add a method parameter. A repair loop will
# eventually run every script in this directory, and the one thing it must
# never be able to do by accident is write to production.
#
# It never prints a credential. If production needs one, read it from the
# environment into a header and do not echo the header back. There is no code
# path here that prints a token, and there must not be one.
#
# Exit: 0 read it, 1 production answered badly, 2 could not read (O13),
#       3 refused / nothing configured.

$ErrorActionPreference = 'Stop'

$ProdUrl = 'https://phineasfritsch.com/version.json'

if ([string]::IsNullOrWhiteSpace($ProdUrl)) {
    Write-Output 'READPROD none -- no production endpoint declared yet'
    Write-Output 'set $ProdUrl at the top of verify/read-prod.ps1, or record in QUEUE.md that there is no production (QUEUE.md q6)'
    exit 0
}

try {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
} catch {
    # Older hosts only. Not fatal, and not worth failing a read over.
}

try {
    $response = Invoke-WebRequest -Uri $ProdUrl -Method Get -UseBasicParsing -TimeoutSec 20
} catch {
    Write-Output 'READPROD could-not-run'
    Write-Output ('GET failed: ' + $_.Exception.Message)
    Write-Output 'a read that did not happen counts as a failure, never as a pass (O13)'
    exit 2
}

$status = [int]$response.StatusCode
$body = [string]$response.Content

Write-Output ('READPROD status={0} bytes={1} url={2}' -f $status, $body.Length, $ProdUrl)

# O25 -- head it. A production response is not a thing to paste whole into a
# context window.
foreach ($line in (($body -split "`n") | Select-Object -First 20)) { Write-Output $line }

if ($status -ge 400) { exit 1 }
exit 0
