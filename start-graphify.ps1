Set-Location "C:\Users\santl\Desktop\StackAudit"

# Don't start another Graphify server if port 8765 is already occupied
$existing = Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue

if ($existing) {
    exit
}

# Start Graphify MCP HTTP server
& "C:\Users\santl\AppData\Local\Microsoft\WindowsApps\python.exe" -m graphify.serve 
    "C:\Users\santl\Desktop\StackAudit\graphify-out\graph.json" 
    --transport http 
    --host 127.0.0.1 
    --port 8765 
    --stateless
