# ⚡ Quick Start - Get a Shareable Link NOW!

Choose your method below based on how quickly you need a link:

## 🚀 Fastest: Tunnel Mode (2 minutes)

Get an **instant shareable link** for quick testing:

```bash
npm run tunnel
```

That's it! You'll get a URL like `https://xxxx.ngrok.io` that you can share immediately.

**Note:** The link only works while the server is running.

---

## 🌐 Best: Vercel Deploy (10 minutes)

Get a **permanent URL** that stays online 24/7:

### First time setup:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Set up environment (one-time)
cp .env.example .env
# Edit .env and add your Supabase credentials

# 3. Deploy!
npm run deploy
```

You'll get a permanent URL like: `https://oliva-refrigeration-service-app.vercel.app`

### Future deployments:

```bash
npm run deploy
```

---

## 📱 Bonus: Mobile Testing

Test on your phone with Expo Go:

1. **Install Expo Go** on your phone
2. Run: `npm start`
3. Scan the QR code with your camera (iOS) or Expo Go (Android)

---

## 🆘 Troubleshooting

**"Command not found"?**
```bash
npm install
npm run tunnel
```

**"Port already in use"?**
```bash
killall node
npm run tunnel
```

**Need help?**
- See `DEPLOYMENT_GUIDE.md` for detailed instructions
- See `README.md` for full documentation

---

## 🎯 What to do after getting your link:

1. ✅ Share the URL with your team
2. ✅ Test on different devices
3. ✅ Set up Supabase backend (see `SUPABASE_SETUP.md`)
4. ✅ Add your custom domain (optional)

---

**Pro tip:** Use `npm run tunnel` for quick demos, and `npm run deploy` for permanent sharing!
