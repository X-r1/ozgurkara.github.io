# models/ klasöründeki her .glb için bir .glb.js kopyası üretir.
# Site, index.html çift tıklanarak (file://) açıldığında modelleri bu kopyalardan okur.
# Bir modeli Blender'dan yeniden dışa aktardıktan sonra modelleri-hazirla.bat'a çift tıkla.
Get-ChildItem -Path (Join-Path $PSScriptRoot 'models') -Filter '*.glb' | ForEach-Object {
    $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($_.FullName))
    $key = 'models/' + $_.Name
    $js = "(window.__GLB = window.__GLB || {})['$key'] = '$b64';"
    [IO.File]::WriteAllText($_.FullName + '.js', $js, [Text.Encoding]::ASCII)
    Write-Host ("{0} -> {0}.js" -f $_.Name)
}
