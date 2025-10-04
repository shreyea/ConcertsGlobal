# 🎉 AI Event Planner - Ready to Configure!

## ⚡ Quick Setup (3 Steps)

### Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-...`)
4. **Important**: Make sure your account has billing enabled and available credit at https://platform.openai.com/account/billing

### Step 2: Configure the Server

**Choose your platform:**

#### Windows Users:
1. Open `start-ai-server.bat` in Notepad or any text editor
2. Find the line: `set OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE`
3. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual API key
4. Save the file

#### Mac/Linux/Git Bash Users:
1. Open `start-ai-server.sh` in your text editor
2. Find the line: `export OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"`
3. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual API key
4. Save the file

### Step 3: Start Everything

Open **TWO** terminal windows:

#### Terminal 1 - Start AI Proxy Server:

**Windows (CMD):**
```cmd
start-ai-server.bat
```

**Mac/Linux/Git Bash:**
```bash
bash start-ai-server.sh
```

You should see:
```
✓ OpenAI API Key: SET
✓ Proxy Auth Token: SET
✓ Starting server on port 4001...
AI proxy & plan server listening on http://localhost:4001
```

#### Terminal 2 - Start React Dev Server:
```bash
npm run dev
```

## 🎯 Test It Out

1. Open your browser to http://localhost:5173 (or the URL shown)
2. Click on any event
3. Click the **"Plan"** button
4. On the planner page:
   - Adjust budget, transport, seating, etc.
   - Check ✅ **"Enable AI suggestions"**
   - Click **"Generate AI suggestions"**
5. Watch the magic happen! 🪄

## ✅ Everything Working?

You should see AI-powered suggestions like:
- Budget optimization tips
- Transport recommendations
- Seating upgrade/downgrade suggestions
- Group discount opportunities
- And more!

## 🐛 Something Not Working?

### "AI Service Error" or "insufficient_quota"
- Check your OpenAI billing: https://platform.openai.com/account/billing
- Make sure you have available credit
- Wait a few minutes after adding payment method
- Restart the AI proxy server

### "Connection Error" - Can't connect to proxy
- Make sure the AI proxy is running on port 4001
- Check if another process is using port 4001: `netstat -ano | findstr :4001`
- Kill the old process if needed: `taskkill /PID <PID> /F`

### "OPENAI_API_KEY not configured"
- Edit your startup script and add your API key
- Make sure there are no quotes issues or extra spaces
- Restart the server

## 📖 Full Documentation

For detailed setup, troubleshooting, and advanced configuration, see:
- [SETUP_AI.md](SETUP_AI.md) - Complete setup guide
- [AI_SETUP.md](AI_SETUP.md) - Technical architecture details

## 🔒 Security Reminder

- ✅ Your API key is stored locally in startup scripts (gitignored)
- ✅ Never commit API keys to git
- ✅ The proxy keeps your key server-side (never exposed to browser)
- ✅ Built-in rate limiting prevents abuse

## 💰 Cost Management

OpenAI API calls cost money (but are cheap!):
- gpt-4o-mini costs ~$0.15 per 1M input tokens
- Average suggestion request: ~$0.001-0.003
- Monitor usage: https://platform.openai.com/account/usage
- Set spending limits in your OpenAI account

## 🚀 What You Get

- **Smart Budget Planning**: AI analyzes your budget and suggests optimizations
- **Transport Recommendations**: Best ways to get to the venue
- **Seating Advice**: VIP worth it? Standard good enough?
- **Group Discounts**: Tips for saving money with friends
- **Local Insights**: City-specific travel and accommodation tips
- **Interactive Apply**: Click "Apply" to instantly use AI recommendations

## 📝 Example AI Suggestions

```
🎯 Budget Optimization
"Your current plan ($250) is $50 over budget. Consider standard seating 
instead of premium to save $60, or use train transport to save $30."
[Apply] ← Click to automatically adjust settings

🚗 Transport Recommendation
"For a 120km trip, train is most cost-effective ($24 vs $45 car). 
Journey time: 90 minutes. Book early for best fares."

🎫 Seating Strategy
"VIP tickets ($180) include meet & greet and early entry. Worth it 
for this artist! Budget increased by $80."
[Apply] ← Automatically adjusts budget and seating
```

## 🎨 Features

- ✅ Real-time AI suggestions
- ✅ Interactive budget planning
- ✅ Map visualization
- ✅ Transit time & cost estimates
- ✅ Save & share plans
- ✅ Server-side plan storage
- ✅ Shareable links
- ✅ Mobile responsive

---

**Ready? Edit your startup script with your OpenAI API key and launch! 🚀**
