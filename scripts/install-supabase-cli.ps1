# Install Supabase CLI
Write-Host "Installing Supabase CLI..." -ForegroundColor Cyan

# Check if npm is available
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "Installing via npm..." -ForegroundColor Yellow
    npm install -g supabase
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Supabase CLI installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run: supabase login" -ForegroundColor White
        Write-Host "2. Link your project: supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor White
        Write-Host "3. Set API key: supabase secrets set GEMINI_API_KEY=your_key_here" -ForegroundColor White
        Write-Host "4. Deploy function: supabase functions deploy chatbot-proxy" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "✗ Installation failed" -ForegroundColor Red
    }
} else {
    Write-Host "✗ npm not found. Please install Node.js first." -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Install via Scoop" -ForegroundColor Yellow
    Write-Host "1. Install Scoop: https://scoop.sh" -ForegroundColor White
    Write-Host "2. Run: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git" -ForegroundColor White
    Write-Host "3. Run: scoop install supabase" -ForegroundColor White
}
