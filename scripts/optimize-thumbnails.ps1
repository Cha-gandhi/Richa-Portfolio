param(
  [string]$SourceDir = (Join-Path $PSScriptRoot "..\assets\behance\covers"),
  [string]$OutputDir = (Join-Path $PSScriptRoot "..\assets\behance\thumbs"),
  [int]$MaxWidth = 1200,
  [int]$MaxHeight = 900,
  [int]$Quality = 82
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" } |
  Select-Object -First 1

foreach ($sourcePath in Get-ChildItem -LiteralPath $SourceDir -File) {
  $thumbPath = Join-Path $OutputDir ($sourcePath.BaseName + ".jpg")

  $image = $null
  $bitmap = $null
  $graphics = $null

  try {
    $image = [System.Drawing.Image]::FromFile($sourcePath.FullName)

    $ratio = [Math]::Min($MaxWidth / [double]$image.Width, $MaxHeight / [double]$image.Height)
    if ($ratio -gt 1) {
      $ratio = 1
    }

    $width = [Math]::Max(1, [int][Math]::Round($image.Width * $ratio))
    $height = [Math]::Max(1, [int][Math]::Round($image.Height * $ratio))

    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::White)
    $graphics.DrawImage($image, 0, 0, $width, $height)

    $encoder = New-Object System.Drawing.Imaging.EncoderParameters 1
    $encoder.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
      [System.Drawing.Imaging.Encoder]::Quality,
      [int64]$Quality
    )

    $bitmap.Save($thumbPath, $jpegCodec, $encoder)
    Write-Host "Created $thumbPath"
  }
  finally {
    if ($graphics) { $graphics.Dispose() }
    if ($bitmap) { $bitmap.Dispose() }
    if ($image) { $image.Dispose() }
  }
}
