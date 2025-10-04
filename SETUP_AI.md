# AI Event Planner Setup Guide

This guide will help you set up the OpenAI-powered event planning feature.

## Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key with available quota
   - Go to: https://platform.openai.com/api-keys
   - Create a new API key
   - Make sure your account has billing enabled and credit available
   - Check your usage: https://platform.openai.com/account/billing

2. **Node.js**: Make sure Node.js is installed (v16 or higher)

## Quick Start

### Option 1: Using Startup Scripts (Recommended)

#### On Windows:
1. Open `start-ai-server.bat` in a text editor
2. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key
3. Save the file
4. Double-click `start-ai-server.bat` to start the server

#### On Mac/Linux/Git Bash:
1. Open `start-ai-server.sh` in a text editor
2. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual OpenAI API key
3. Save the file
4. Run: `bash start-ai-server.sh`

### Option 2: Manual Setup

#### Windows (CMD):
```cmd
set OPENAI_API_KEY=sk-your-actual-key-here
set PROXY_AUTH_TOKEN=9de1e9dc29a354662b5e51d27e07881b54d10bef8cad0f93534fe5ac07b61060
node server/ai-proxy.js
```

#### Mac/Linux/Git Bash:
```bash
export OPENAI_API_KEY="sk-your-actual-key-here"
export PROXY_AUTH_TOKEN="9de1e9dc29a354662b5e51d27e07881b54d10bef8cad0f93534fe5ac07b61060"
node server/ai-proxy.js
```

#### Using npm script:
```bash
# Set environment variables first, then:
npm run start:ai
```

## Verifying the Setup

### 1. Check Server is Running
After starting the server, you should see:
```
OpenAI API Key: SET
Proxy Auth Token: SET
AI proxy & plan server listening on http://localhost:4001
```

### 2. Test the Server

#### Test plan saving (no OpenAI needed):
```bash
curl -X POST http://localhost:4001/plans \
  -H "Content-Type: application/json" \
  -H "x-proxy-auth: 9de1e9dc29a354662b5e51d27e07881b54d10bef8cad0f93534fe5ac07b61060" \
  -d '{"event":{"name":"Test Event"},"budget":100}'
```

Expected response:
```json
{
  "success": true,
  "id": "...",
  "plan": {...}
}
```

#### Test AI suggestions:
```bash
curl -X POST http://localhost:4001/ai/suggest \
  -H "Content-Type: application/json" \
  -H "x-proxy-auth: 9de1e9dc29a354662b5e51d27e07881b54d10bef8cad0f93534fe5ac07b61060" \
  -d '{"event":{"name":"Concert","city":"NYC","date":"2025-12-01"},"budget":200,"transport":"car","seatingPref":"standard","numPeople":2}'
```

Expected response:
```json
{
  "suggestions": [
    {
      "title": "...",
      "detail": "...",
      "recommendation": "...",
      "suggestedChanges": {...}
    }
  ]
}
```

### 3. Test in the Web App

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to the dev URL (usually http://localhost:5173)

3. Navigate to any event and click "Plan"

4. On the planner page:
   - Check "Enable AI suggestions"
   - Click "Generate AI suggestions"
   - You should see AI-powered recommendations

## Troubleshooting

### Error: "insufficient_quota"
**Problem**: Your OpenAI account doesn't have available credit.

**Solutions**:
1. Go to https://platform.openai.com/account/billing
2. Add a payment method
3. Add credits to your account
4. Wait a few minutes for the changes to take effect
5. Restart the AI proxy server

### Error: "OPENAI_API_KEY not configured"
**Problem**: The API key wasn't set when starting the server.

**Solution**: Make sure you set the environment variable BEFORE running `node server/ai-proxy.js`

### Error: "Missing or invalid proxy auth"
**Problem**: The frontend's auth token doesn't match the server's.

**Solution**: 
1. Check `.env.local` has `VITE_PROXY_AUTH_TOKEN=9de1e9dc29a354662b5e51d27e07881b54d10bef8cad0f93534fe5ac07b61060`
2. Make sure the server was started with `PROXY_AUTH_TOKEN=9de1e9dc29a354662b5e51d27e07881b54d10bef8cad0f93534fe5ac07b61060`
3. Restart both the dev server (npm run dev) and AI proxy

### Error: "Connection Error" in UI
**Problem**: The AI proxy server isn't running.

**Solution**: Start the AI proxy server using one of the methods above

### Port 4001 Already in Use
**Problem**: Another process is using port 4001.

**Solution**:
```bash
# Find the process
netstat -ano | findstr :4001

# Kill it (replace PID with the actual process ID)
taskkill /PID <PID> /F

# Or use a different port:
set PORT=4002
node server/ai-proxy.js
# Then update .env.local: VITE_AI_PROXY_URL=http://localhost:4002
```

## Security Notes

- **Never commit your OpenAI API key to git**
- The startup scripts are in `.gitignore` after you edit them with your key
- `.env.local` is already in `.gitignore`
- The proxy auth token is for preventing abuse; consider rotating it periodically
- For production, implement proper JWT-based authentication

## Cost Management

OpenAI API calls cost money. To manage costs:

1. **Monitor usage**: https://platform.openai.com/account/usage
2. **Set spending limits**: In your OpenAI billing settings
3. **Use rate limiting**: The proxy has built-in rate limiting (30 requests/min per IP)
4. **Choose cheaper models**: Currently using `gpt-4o-mini` which is cost-effective

## Architecture

```
User Browser
    ↓ (HTTPS)
React App (localhost:5173)
    ↓ (HTTP + x-proxy-auth header)
AI Proxy (localhost:4001)
    ↓ (HTTPS + Bearer token)
OpenAI API
```

The proxy keeps your OpenAI API key secure on the server side and adds rate limiting and authentication.

## Next Steps

Once everything is working:

1. **Improve AI prompts**: Edit `server/ai-proxy.js` to customize the AI's behavior
2. **Add more features**: Transit APIs, hotel booking, ticket price tracking
3. **Deploy to production**: Use environment variables on your hosting platform
4. **Implement real auth**: Replace static tokens with JWT/OAuth

---

For more help, check the main [AI_SETUP.md](AI_SETUP.md) or open an issue.
