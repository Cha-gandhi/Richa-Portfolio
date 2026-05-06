param(
    [string]$ProfileUrl = "https://www.behance.net/gandhiricha",
    [string]$ExtendedPortfolioUrl = "https://gandhir7070.wixsite.com/portfolio"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $repoRoot "data"
$projectsDir = Join-Path $repoRoot "projects"
$assetsRoot = Join-Path $repoRoot "assets"
$behanceAssetsDir = Join-Path $assetsRoot "behance"
$coversDir = Join-Path $behanceAssetsDir "covers"
$modulesDir = Join-Path $behanceAssetsDir "modules"
$rawDir = Join-Path $dataDir "raw"

$directories = @($dataDir, $projectsDir, $assetsRoot, $behanceAssetsDir, $coversDir, $modulesDir, $rawDir)
foreach ($directory in $directories) {
    if (-not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }
}

function Get-ForwardSlashPath {
    param([string]$Path)

    $relative = Resolve-Path -LiteralPath $Path | ForEach-Object {
        $_.Path.Replace($repoRoot, "").TrimStart("\")
    }

    return "./" + ($relative -replace "\\", "/")
}

function Get-Slug {
    param([string]$Value)

    $slug = $Value.ToLowerInvariant() -replace "[^a-z0-9]+", "-"
    $slug = $slug.Trim("-")

    if ([string]::IsNullOrWhiteSpace($slug)) {
        return "project"
    }

    return $slug
}

function Test-HasProperty {
    param(
        [Parameter(Mandatory = $true)]$Object,
        [Parameter(Mandatory = $true)][string]$PropertyName
    )

    if ($null -eq $Object) {
        return $false
    }

    return $null -ne $Object.PSObject.Properties[$PropertyName]
}

function Get-PropertyValue {
    param(
        [Parameter(Mandatory = $true)]$Object,
        [Parameter(Mandatory = $true)][string]$PropertyName,
        $DefaultValue = $null
    )

    if (Test-HasProperty -Object $Object -PropertyName $PropertyName) {
        return $Object.$PropertyName
    }

    return $DefaultValue
}

function Get-BehanceState {
    param(
        [string]$Url,
        [string[]]$Hints
    )

    Write-Host "Fetching $Url"
    $response = Invoke-WebRequest -UseBasicParsing $Url
    $html = $response.Content
    $scriptMatches = [regex]::Matches($html, '<script[^>]*>([\s\S]*?)</script>')

    foreach ($match in $scriptMatches) {
        $content = $match.Groups[1].Value.Trim()

        if (-not $content.StartsWith("{")) {
            continue
        }

        $matched = $false
        foreach ($hint in $Hints) {
            if ($content.Contains($hint)) {
                $matched = $true
                break
            }
        }

        if ($matched) {
            return @{
                State = ($content | ConvertFrom-Json)
                Html = $html
            }
        }
    }

    throw "Could not find Behance state payload for $Url"
}

function Select-BestImageUrl {
    param(
        [Parameter(Mandatory = $true)]$Images,
        [string[]]$PreferredTypes = @("JPG", "PNG", "WEBP", "OPT1")
    )

    if (-not $Images) {
        return $null
    }

    $best = $Images |
        Where-Object { $_.url } |
        Sort-Object -Property @{
            Expression = {
                $type = if ($_.type) { $_.type.ToString().ToUpperInvariant() } else { "" }
                $index = [array]::IndexOf($PreferredTypes, $type)
                if ($index -lt 0) { 99 } else { $index }
            }
        }, @{
            Expression = {
                if ($_.width) { [int]$_.width } else { 100000 }
            }
            Descending = $true
        } |
        Select-Object -First 1

    if ($best) {
        return $best.url
    }

    return $null
}

function Save-RemoteFile {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$DestinationPath
    )

    if (Test-Path -LiteralPath $DestinationPath) {
        return
    }

    $tempPath = $DestinationPath + ".download"

    for ($attempt = 1; $attempt -le 3; $attempt += 1) {
        try {
            if (Test-Path -LiteralPath $tempPath) {
                Remove-Item -LiteralPath $tempPath -Force
            }

            Invoke-WebRequest -UseBasicParsing $Url -OutFile $tempPath
            Move-Item -LiteralPath $tempPath -Destination $DestinationPath -Force
            return
        }
        catch {
            if (Test-Path -LiteralPath $tempPath) {
                Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
            }

            if ($attempt -eq 3) {
                throw
            }

            Start-Sleep -Milliseconds 500
        }
    }
}

function Get-FileExtensionFromUrl {
    param([string]$Url)

    $cleanUrl = ($Url -split "\?")[0]
    $extension = [System.IO.Path]::GetExtension($cleanUrl)

    if ([string]::IsNullOrWhiteSpace($extension)) {
        return ".jpg"
    }

    return $extension.ToLowerInvariant()
}

function Get-CategoryLabel {
    param([string]$Value)

    $category = ""
    if ($null -ne $Value) {
        $category = $Value.ToLowerInvariant()
    }

    if ($category -match "brand|identity|logo") {
        return "Branding"
    }

    if ($category -match "ux|ui|app|product") {
        return "UX / Product"
    }

    if ($category -match "publication|editorial|book") {
        return "Editorial"
    }

    return "Visual design"
}

function Get-ProjectSummary {
    param($Project, [int]$ImageCount)

    $toolTitles = @()
    if ((Test-HasProperty -Object $Project -PropertyName "tools") -and $Project.tools) {
        $toolTitles = @($Project.tools | ForEach-Object { $_.title } | Where-Object { $_ })
    }

    $fieldTitles = @()
    if ((Test-HasProperty -Object $Project -PropertyName "fields") -and $Project.fields) {
        $fieldTitles = @($Project.fields | ForEach-Object { $_.title } | Where-Object { $_ })
    }

    $toolText = if ($toolTitles.Count -gt 0) { ($toolTitles | Select-Object -First 3) -join ", " } else { "Behance presentation modules" }
    $fieldText = if ($fieldTitles.Count -gt 0) { ($fieldTitles | Select-Object -First 2) -join ", " } else { "visual communication design" }
    $views = "ongoing"
    $appreciations = "early"

    if ((Test-HasProperty -Object $Project -PropertyName "stats") -and $Project.stats) {
        if ((Test-HasProperty -Object $Project.stats -PropertyName "views") -and $Project.stats.views -and (Test-HasProperty -Object $Project.stats.views -PropertyName "all")) {
            $views = [string]$Project.stats.views.all
        }

        if ((Test-HasProperty -Object $Project.stats -PropertyName "appreciations") -and $Project.stats.appreciations -and (Test-HasProperty -Object $Project.stats.appreciations -PropertyName "all")) {
            $appreciations = [string]$Project.stats.appreciations.all
        }
    }

    return "A recruiter-friendly snapshot of $fieldText work, presented through $ImageCount visuals and built using $toolText. The Behance project currently shows $views views and $appreciations appreciations."
}

function Get-RecruiterBullets {
    param($Project, [int]$ImageCount)

    $published = if ($Project.publishedOn) {
        [DateTimeOffset]::FromUnixTimeSeconds([int64]$Project.publishedOn).ToString("MMMM d, yyyy")
    }
    else {
        "an unspecified date"
    }

    $toolTitles = @()
    if ((Test-HasProperty -Object $Project -PropertyName "tools") -and $Project.tools) {
        $toolTitles = @($Project.tools | ForEach-Object { $_.title } | Where-Object { $_ } | Select-Object -First 3)
    }

    $toolLine = if ($toolTitles.Count -gt 0) {
        "Tools highlighted on Behance: " + ($toolTitles -join ", ") + "."
    }
    else {
        "Behance presents the work through polished static modules and visual mockups."
    }

    return @(
        "Published on Behance on $published and archived locally for a cleaner recruiter-facing review flow."
        "Includes $ImageCount imported visual modules so hiring teams can scan the project without leaving the site."
        $toolLine
    )
}

function ConvertTo-JavaScriptLiteral {
    param($Value)

    $json = $Value | ConvertTo-Json -Depth 12 -Compress
    return "window.__BEHANCE_PORTFOLIO__ = $json;"
}

function New-CaseStudyHtml {
    param(
        [Parameter(Mandatory = $true)]$ProjectRecord,
        [Parameter(Mandatory = $true)][string]$RelativeRoot
    )

    $galleryMarkup = ""

    foreach ($image in $ProjectRecord.images) {
        $imagePath = $image.localPath
        if ($imagePath.StartsWith("./")) {
            $imagePath = $RelativeRoot + $imagePath.Substring(2)
        }

        $caption = if ([string]::IsNullOrWhiteSpace($image.caption)) {
            "Behance case-study image"
        }
        else {
            [System.Net.WebUtility]::HtmlEncode($image.caption)
        }

        $galleryMarkup += @"
        <figure class="image-card">
          <img src="$imagePath" alt="$caption" loading="lazy" />
          <figcaption>$caption</figcaption>
        </figure>
"@
    }

    if ([string]::IsNullOrWhiteSpace($galleryMarkup)) {
        $galleryMarkup = '<p class="gallery-empty">No project images were imported for this case study.</p>'
    }

    $bulletMarkup = ""
    foreach ($bullet in $ProjectRecord.recruiterBullets) {
        $bulletMarkup += "<li>$([System.Net.WebUtility]::HtmlEncode($bullet))</li>"
    }

    return @"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>$([System.Net.WebUtility]::HtmlEncode($ProjectRecord.title)) | Richa Gandhi</title>
    <meta
      name="description"
      content="$([System.Net.WebUtility]::HtmlEncode($ProjectRecord.description))"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="${RelativeRoot}case-study.css" />
  </head>
  <body>
    <main class="page">
      <a class="back-link" href="${RelativeRoot}index.html">Back to portfolio</a>

      <section class="hero">
        <div>
          <p class="eyebrow">$([System.Net.WebUtility]::HtmlEncode($ProjectRecord.displayCategory))</p>
          <h1>$([System.Net.WebUtility]::HtmlEncode($ProjectRecord.title))</h1>
          <p class="summary">$([System.Net.WebUtility]::HtmlEncode($ProjectRecord.description))</p>
          <div class="meta-grid">
            <article class="meta-card">
              <p class="meta-label">Behance views</p>
              <p class="meta-value">$($ProjectRecord.views)</p>
            </article>
            <article class="meta-card">
              <p class="meta-label">Appreciations</p>
              <p class="meta-value">$($ProjectRecord.appreciations)</p>
            </article>
            <article class="meta-card">
              <p class="meta-label">Visual modules</p>
              <p class="meta-value">$($ProjectRecord.images.Count)</p>
            </article>
            <article class="meta-card">
              <p class="meta-label">Source</p>
              <p class="meta-value"><a href="$($ProjectRecord.url)" target="_blank" rel="noreferrer">View original Behance page</a></p>
            </article>
          </div>
        </div>
        <div>
          <img class="hero-image" src="$($RelativeRoot + $ProjectRecord.coverLocalPath.Substring(2))" alt="$([System.Net.WebUtility]::HtmlEncode($ProjectRecord.title)) cover image" />
        </div>
      </section>

      <section class="overview">
        <p class="eyebrow">Overview</p>
        <h2>Why this page helps recruiters</h2>
        <p>$([System.Net.WebUtility]::HtmlEncode($ProjectRecord.recruiterSummary))</p>
      </section>

      <section class="recruiter-notes">
        <p class="eyebrow">Quick read</p>
        <h2>Highlights</h2>
        <ul>
$bulletMarkup
        </ul>
      </section>

      <section class="gallery">
        <p class="eyebrow">Imported gallery</p>
        <h2>Case-study visuals</h2>
        <div class="gallery-grid">
$galleryMarkup
        </div>
      </section>
    </main>
  </body>
</html>
"@
}

$profilePayload = Get-BehanceState -Url $ProfileUrl -Hints @('"profile":{"activeSection"', '"user":{"username"')
$profileState = $profilePayload.State
$profileUser = $null
if ((Test-HasProperty -Object $profileState -PropertyName "user") -and $profileState.user) {
    $profileUser = $profileState.user
}
if ((Test-HasProperty -Object $profileState -PropertyName "profile") -and $profileState.profile -and (Test-HasProperty -Object $profileState.profile -PropertyName "user") -and $profileState.profile.user) {
    $profileUser = $profileState.profile.user
}
$profileProjects = @($profileState.profile.activeSection.work.profileProjects)

if ($profileProjects.Count -eq 0) {
    throw "No projects found on the Behance profile."
}

$importedProjects = @()

foreach ($profileProject in $profileProjects) {
    $projectUrl = $profileProject.url
    $projectPayload = Get-BehanceState -Url $projectUrl -Hints @('"project":{"project"', '"project":{', '"modules":[')
    $projectState = $projectPayload.State
    $project = $projectState.project.project

    $slug = Get-Slug $project.slug
    $coverImages = @()
    if ((Test-HasProperty -Object $project -PropertyName "covers") -and $project.covers -and (Test-HasProperty -Object $project.covers -PropertyName "allAvailable")) {
        $coverImages = $project.covers.allAvailable
    }

    $coverUrl = Select-BestImageUrl -Images $coverImages
    $coverExtension = Get-FileExtensionFromUrl -Url $coverUrl
    $coverPath = Join-Path $coversDir ($slug + $coverExtension)

    if ($coverUrl) {
        Save-RemoteFile -Url $coverUrl -DestinationPath $coverPath
    }

    $images = @()
    $projectModules = @()
    if ((Test-HasProperty -Object $project -PropertyName "modules") -and $project.modules) {
        $projectModules = @($project.modules)
    }

    $imageModules = @($projectModules | Where-Object { $_.__typename -eq "ImageModule" -and $_.imageSizes })

    $imageIndex = 0
    foreach ($module in $imageModules) {
        $imageUrl = Select-BestImageUrl -Images $module.imageSizes.allAvailable

        if (-not $imageUrl) {
            continue
        }

        $imageIndex += 1
        $imageExtension = Get-FileExtensionFromUrl -Url $imageUrl
        $moduleDir = Join-Path $modulesDir $slug

        if (-not (Test-Path -LiteralPath $moduleDir)) {
            New-Item -ItemType Directory -Path $moduleDir | Out-Null
        }

        $modulePath = Join-Path $moduleDir ("image-" + $imageIndex.ToString("00") + $imageExtension)
        Save-RemoteFile -Url $imageUrl -DestinationPath $modulePath

        $caption = if (-not [string]::IsNullOrWhiteSpace($module.caption)) {
            $module.caption
        }
        elseif (-not [string]::IsNullOrWhiteSpace($module.altText)) {
            $module.altText
        }
        else {
            "$($project.name) visual " + $imageIndex
        }

        $images += [pscustomobject]@{
            caption = $caption
            localPath = Get-ForwardSlashPath -Path $modulePath
        }
    }

    $fieldTitles = @()
    if ((Test-HasProperty -Object $project -PropertyName "fields") -and $project.fields) {
        $fieldTitles = @($project.fields | ForEach-Object { $_.title } | Where-Object { $_ })
    }

    $primaryCategorySource = if ($fieldTitles.Count -gt 0) { $fieldTitles[0] } else { $project.name }
    $displayCategory = Get-CategoryLabel -Value $primaryCategorySource
    $projectDescription = ""
    if ((Test-HasProperty -Object $project -PropertyName "description") -and $null -ne $project.description) {
        $projectDescription = $project.description
    }

    $description = if (-not [string]::IsNullOrWhiteSpace($projectDescription)) {
        $project.description.Trim()
    }
    else {
        "A recruiter-ready adaptation of the original Behance project, preserving the key visuals and metadata in a cleaner review format."
    }

    $views = "0"
    $appreciations = "0"
    if ((Test-HasProperty -Object $project -PropertyName "stats") -and $project.stats) {
        if ((Test-HasProperty -Object $project.stats -PropertyName "views") -and $project.stats.views -and (Test-HasProperty -Object $project.stats.views -PropertyName "all")) {
            $views = [string]$project.stats.views.all
        }

        if ((Test-HasProperty -Object $project.stats -PropertyName "appreciations") -and $project.stats.appreciations -and (Test-HasProperty -Object $project.stats.appreciations -PropertyName "all")) {
            $appreciations = [string]$project.stats.appreciations.all
        }
    }
    $publishedYear = if ($project.publishedOn) {
        [DateTimeOffset]::FromUnixTimeSeconds([int64]$project.publishedOn).ToString("yyyy")
    }
    else {
        "Selected"
    }

    $projectRecord = [pscustomobject]@{
        id = [string]$project.id
        slug = $slug
        title = $project.name
        url = $project.url
        shortUrl = $project.shortUrl
        description = $description
        views = $views
        appreciations = $appreciations
        publishedYear = $publishedYear
        primaryCategory = $primaryCategorySource
        displayCategory = $displayCategory
        label = if ($displayCategory -eq "Branding") { "Identity case study" } elseif ($displayCategory -eq "UX / Product") { "Product case study" } elseif ($displayCategory -eq "Editorial") { "Editorial case study" } else { "Visual case study" }
        year = $publishedYear
        size = if ($images.Count -ge 8) { "large" } elseif ($images.Count -ge 5) { "medium" } else { "small" }
        accent = switch ($displayCategory) {
            "Branding" { "#d9aba2" }
            "UX / Product" { "#b9d6aa" }
            "Editorial" { "#d3c0ef" }
            default { "#efc697" }
        }
        coverLocalPath = Get-ForwardSlashPath -Path $coverPath
        images = $images
        recruiterSummary = Get-ProjectSummary -Project $project -ImageCount $images.Count
        recruiterBullets = Get-RecruiterBullets -Project $project -ImageCount $images.Count
    }

    $caseStudyPath = Join-Path $projectsDir ($slug + ".html")
    $projectRecord | Add-Member -NotePropertyName caseStudyPath -NotePropertyValue ("./projects/" + $slug + ".html")

    $caseStudyHtml = New-CaseStudyHtml -ProjectRecord $projectRecord -RelativeRoot "../"
    Set-Content -LiteralPath $caseStudyPath -Value $caseStudyHtml -Encoding UTF8

    $rawProjectPath = Join-Path $rawDir ($slug + ".json")
    $projectState | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $rawProjectPath -Encoding UTF8

    $importedProjects += $projectRecord
}

$profileRecord = [pscustomobject]@{
    name = Get-PropertyValue -Object $profileUser -PropertyName "displayName" -DefaultValue "Richa Gandhi"
    firstName = Get-PropertyValue -Object $profileUser -PropertyName "firstName" -DefaultValue "Richa"
    headline = if ($null -ne (Get-PropertyValue -Object $profileUser -PropertyName "occupation" -DefaultValue $null)) { (Get-PropertyValue -Object $profileUser -PropertyName "occupation" -DefaultValue "").Trim() } else { "" }
    role = if ($null -ne (Get-PropertyValue -Object $profileUser -PropertyName "company" -DefaultValue $null)) { (Get-PropertyValue -Object $profileUser -PropertyName "company" -DefaultValue "").Trim() } else { "" }
    location = Get-PropertyValue -Object $profileUser -PropertyName "location" -DefaultValue "Baroda, India"
    behance = Get-PropertyValue -Object $profileUser -PropertyName "url" -DefaultValue $ProfileUrl
    extendedPortfolio = $ExtendedPortfolioUrl
    linkedin = if ((Test-HasProperty -Object $profileUser -PropertyName "socialReferences") -and $profileUser.socialReferences) { ($profileUser.socialReferences | Where-Object { $_.socialService -eq "LinkedIn" } | Select-Object -First 1).url } else { "" }
    instagram = if ((Test-HasProperty -Object $profileUser -PropertyName "socialReferences") -and $profileUser.socialReferences) { ($profileUser.socialReferences | Where-Object { $_.socialService -eq "Instagram" } | Select-Object -First 1).url } else { "" }
    projectViews = if ((Test-HasProperty -Object $profileUser -PropertyName "stats") -and $profileUser.stats -and (Test-HasProperty -Object $profileUser.stats -PropertyName "views")) { [string]$profileUser.stats.views } else { "" }
    appreciations = if ((Test-HasProperty -Object $profileUser -PropertyName "stats") -and $profileUser.stats -and (Test-HasProperty -Object $profileUser.stats -PropertyName "appreciations")) { [string]$profileUser.stats.appreciations } else { "" }
    followers = if ((Test-HasProperty -Object $profileUser -PropertyName "stats") -and $profileUser.stats -and (Test-HasProperty -Object $profileUser.stats -PropertyName "followers")) { [string]$profileUser.stats.followers } else { "" }
}

$portfolioRecord = [pscustomobject]@{
    importedAt = (Get-Date).ToString("s")
    source = [pscustomobject]@{
        behance = $ProfileUrl
        extendedPortfolio = $ExtendedPortfolioUrl
    }
    profile = $profileRecord
    projects = $importedProjects
}

$rawProfilePath = Join-Path $rawDir "profile.json"
$profileState | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $rawProfilePath -Encoding UTF8

$jsonPath = Join-Path $dataDir "behance-portfolio.json"
$jsPath = Join-Path $dataDir "behance-portfolio.js"

$portfolioRecord | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
ConvertTo-JavaScriptLiteral -Value $portfolioRecord | Set-Content -LiteralPath $jsPath -Encoding UTF8

Write-Host "Imported $($importedProjects.Count) Behance projects."
Write-Host "Generated $jsonPath"
Write-Host "Generated $jsPath"
