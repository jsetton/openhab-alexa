#requires -version 3
<#
    .SYNOPSIS
        PowerShell script for ask-cli's Nodejs-npm code building flow.
    .DESCRIPTION
        This is the PowerShell version of the build script, for building the AWS Lambda deployable skill code that is written in JS language. This script is only run by the ask-cli whenever a 'package.json' file is found alongside the skill code. The dependencies are installed using 'npm', and are packaged using 'zip'.
    .EXAMPLE
        build.ps1 archive.zip
        This example showcases how to run the build script, to create an AWS Lambda deployable package called 'archive.zip'.
    .EXAMPLE
        build.ps1 archive.zip $true
        This example showcases how to run the previous example, with additional debug information.
#>
#----------------[ Parameters ]----------------------------------------------------
param(
    [Parameter(Mandatory = $false,
               ValueFromPipelineByPropertyName = $true,
               HelpMessage = "Name for the AWS Lambda deployable archive")]
        [ValidateNotNullOrEmpty()]
        [string]
        $script:OutFile = "upload.zip",

        # Provide additional debug information during script run
        [Parameter(Mandatory = $false,
                   ValueFromPipelineByPropertyName = $true,
                   HelpMessage = "Enable verbose output")]
        [bool]
        $script:Verbose = $false
)

#----------------[ Declarations ]----------------------------------------------------
$ErrorActionPreference = "Stop"

#----------------[ Functions ]----------------------------------------------------
function Show-Log() {
    <#
        .SYNOPSIS
            Function to log information/error messages to output
        .EXAMPLE
            Show-Log "Test"
                This will log the message as an Information, only if the script is run in Verbose mode
            Show-Log "Test" "Error"
                This will log the message as an Error and STOP the script execution
    #>
    [CmdletBinding()]
    param(
        [Parameter()]
        [ValidateNotNullOrEmpty()]
        [string]
        $Message,

        [Parameter()]
        [ValidateNotNullOrEmpty()]
        [ValidateSet('Info','Error')]
        [string]
        $Severity = 'Info'
    )

    begin {}
    process {
        if ($Severity -eq 'Info') {
            if ($Verbose) {
                Write-Host $Message
            }
        } else {
            Write-Error $Message
        }
    }
    end {}
}

function Install-Dependencies() {
    <#
        .SYNOPSIS
            Function to install dependencies in package.json from npm.
    #>
    [CmdletBinding()]
    [OutputType([bool])]
    param()

    begin {
        Show-Log "Installing skill dependencies based on package.json."
    }
    process {
        $DepCmd = "npm install --production"
        if (-not $Verbose) {
            $DepCmd += " --quiet"
        }
        Invoke-Expression -Command $DepCmd
        return $?
    }
    end {}
}

function Compress-Dependencies() {
    <#
        .SYNOPSIS
            Function to compress source code and dependencies for lambda deployment.
    #>
    [CmdletBinding()]
    [OutputType([bool])]
    param()

    begin {
        Show-Log "Zipping source files and dependencies to $OutFile."
    }
    process {
        Compress-Archive -Path ./* -DestinationPath "$OutFile"
        return $?
    }
    end {}

}

function Update-Skill-Catalog () {
    <#
        .SYNOPSIS
            Function to update skill catalog.
    #>
    begin {
        Show-Log "Updating skill catalog."
    }
    process {
        Invoke-Expression "node ..\..\tools\updateSkillCatalog.js" 2>&1 | Out-Null
        return $?
    }
    end {}
}

function Update-Skill-Manifest () {
    <#
        .SYNOPSIS
            Function to update skill manifest.
    #>
    begin {
        Show-Log "Updating skill manifest."
    }
    process {
        Invoke-Expression "node ..\..\tools\updateSkillManifest.js" 2>&1 | Out-Null
        return $?
    }
    end {}
}


#----------------[ Main Execution ]----------------------------------------------------

Show-Log "###########################"
Show-Log "####### Build Code ########"
Show-Log "###########################"

if (Test-Path .env) {
    Get-Content -Path ".env" `
        | Select-String -Pattern "^[^#]\w+" `
        | ForEach-Object {$_ -replace "`"", ""} `
        | ConvertFrom-String -Delimiter "=" -PropertyNames key, value `
        | ForEach-Object {[Environment]::SetEnvironmentVariable($_.key, $_.value)}
}

if (-Not (Install-Dependencies)) {
    Show-Log "Failed to install the dependencies in the project" "Error"
    exit 1
}

if (-Not (Update-Skill-Catalog)) {
    Show-Log "Failed to update skill catalog." "Error"
    exit 1
}

if (-Not (Update-Skill-Manifest)) {
    Show-Log "Failed to update skill manifest." "Error"
    exit 1
}

if (-Not (Compress-Dependencies)) {
    Show-Log "Failed to zip the artifacts to $OutFile." "Error"
    exit 1
}

Show-Log "###########################"
Show-Log "Codebase built successfully"
Show-Log "###########################"

exit 0
