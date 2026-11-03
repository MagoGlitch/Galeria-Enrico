$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$photosDir = Join-Path $scriptDir "photos"
$targetDir = if (Test-Path $photosDir) { $photosDir } else { $scriptDir }

Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "$targetDir\*.jpg", "$targetDir\*.png", "$targetDir\*.jpeg", "$targetDir\*.webp" | Sort-Object Name

$photoList = @()
$id = 1
$vertCount = 0
$horizCount = 0

foreach ($f in $files) {
    $kb = [math]::Round($f.Length / 1KB)
    $sizeStr = if ($kb -ge 1024) { "$([math]::Round($kb / 1024, 1)) MB" } else { "$kb KB" }
    $title = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $urlPath = if ($targetDir -eq $photosDir) { "photos/$($f.Name)" } else { $f.Name }
    
    $width = 0
    $height = 0
    try {
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        $width = $img.Width
        $height = $img.Height
        $img.Dispose()
    } catch {}
    
    $isVertical = $height -gt $width
    $orient = if ($isVertical) { "portrait" } else { "landscape" }
    if ($isVertical) { $vertCount++ } else { $horizCount++ }

    $photoList += [PSCustomObject]@{
        id = $id
        fileName = $f.Name
        url = $urlPath
        title = $title
        sizeMb = $sizeStr
        orientation = $orient
        width = $width
        height = $height
        aspectRatio = "$($width):$($height)"
    }
    $id++
}

$galleryConfig = [PSCustomObject]@{
    clientName = "Enrico"
    eventTitle = "Batizado do Enrico"
    eventType = "Batizado"
    photographerBrand = "Clique & Poesia"
    brandSubtitle = "Um clique, uma poesia!"
    photographerWhatsapp = "553897569353"
    photographerInstagram = "https://instagram.com/cliqueepoesia"
    welcomeMessage = "Um dia de bênçãos, fé e amor que agora ganham vida em cada imagem. Preparamos esta galeria exclusiva para você reviver e celebrar cada instante sagrado do batizado do Enrico. Navegue pelas memórias, selecione suas favoritas e baixe todas com facilidade."
    totalPhotos = $photoList.Count
    totalVertical = $vertCount
    totalHorizontal = $horizCount
    photos = $photoList
}

$json = $galleryConfig | ConvertTo-Json -Depth 5
$outPath = Join-Path $scriptDir "gallery-data.js"
$jsContent = "/**`n * Configuração e Lista de Fotos da Galeria - Clique & Poesia`n * Batizado do Enrico`n * Atualizado em $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')`n */`nwindow.GALLERY_DATA = $json;`n"

[System.IO.File]::WriteAllText($outPath, $jsContent, [System.Text.Encoding]::UTF8)
Write-Host "[OK] gallery-data.js atualizado! Total: $($photoList.Count) (Verticais: $vertCount, Horizontais: $horizCount)" -ForegroundColor Green