Add-Type -AssemblyName System.Drawing

$src = "C:\Users\Gaming\.gemini\antigravity-ide\brain\34ceb7f3-f058-4ffc-8f30-931c1a2328bd\clinicos_logo_1779710404887.png"
$dest192 = "E:\Project\Clinic System\public\icon-192x192.png"
$dest512 = "E:\Project\Clinic System\public\icon-512x512.png"

if (Test-Path $src) {
    $img = [System.Drawing.Image]::FromFile($src)

    # 192x192
    $bmp192 = New-Object System.Drawing.Bitmap(192, 192)
    $g192 = [System.Drawing.Graphics]::FromImage($bmp192)
    $g192.DrawImage($img, 0, 0, 192, 192)
    $bmp192.Save($dest192, [System.Drawing.Imaging.ImageFormat]::Png)
    $g192.Dispose()
    $bmp192.Dispose()
    Write-Output "Saved 192x192 icon"

    # 512x512
    $bmp512 = New-Object System.Drawing.Bitmap(512, 512)
    $g512 = [System.Drawing.Graphics]::FromImage($bmp512)
    $g512.DrawImage($img, 0, 0, 512, 512)
    $bmp512.Save($dest512, [System.Drawing.Imaging.ImageFormat]::Png)
    $g512.Dispose()
    $bmp512.Dispose()
    Write-Output "Saved 512x512 icon"

    $img.Dispose()
    Write-Output "SUCCESS"
} else {
    Write-Output "Source image not found"
}
