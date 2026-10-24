Add-Type -AssemblyName System.Drawing
$src = "C:\Users\DELL\AppData\Roaming\Qoder\SharedClientCache\cache\images\4df10b30\c3ijv973-24d929d3.png"
$img = [System.Drawing.Image]::FromFile($src)
function Make-Bmp([int]$size) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.Clear([System.Drawing.Color]::White)
  $g.DrawImage($img, 0, 0, $size, $size)
  $g.Dispose()
  return $bmp
}
$root = "c:\Users\DELL\Desktop\Hack\public"
$b512 = Make-Bmp 512
$b512.Save("$root\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$b192 = Make-Bmp 192
$b192.Save("$root\logo-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$b512.Dispose(); $b192.Dispose(); $img.Dispose()
Get-ChildItem $root | ForEach-Object { $_.Name + " " + $_.Length }
