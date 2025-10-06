# 🚀 Quick Deployment Guide - Get a Shareable Link

This guide will help you quickly get a shareable URL to test the Oliva Refrigeration Service App.

## Fastest Method: Using Tunnel Mode (5 minutes)

This is the **quickest way** to get a shareable link for testing:

### Steps:

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the web server with tunnel**:
   ```bash
   npm run start-web
   ```

3. **Get your shareable link**:
   - The terminal will display a URL like: `https://xxxx.ngrok.io`
   - Share this URL with anyone to test the app
   - The link works as long as the server is running

### Pros:
- ✅ Instant setup (no account needed)
- ✅ No deployment configuration
- ✅ Great for quick demos

### Cons:
- ❌ Link only works while server is running
- ❌ New URL each time you restart
- ❌ May have ngrok bandwidth limits

---

## Best for Production: Vercel Deployment (15 minutes)

For a **permanent shareable URL** that stays up 24/7:

### Prerequisites:
- GitHub account (free)
- Vercel account (free) - sign up at https://vercel.com
- Supabase account (free) - for the backend database

### Steps:

1. **Set up Supabase** (if not done):
   - Go to https://supabase.com and create a project
   - Run the SQL from `SUPABASE_SETUP.md` in the SQL Editor
   - Copy your project URL and anon key from Settings → API

2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to a new project? **Yes**
   - What's your project name? **oliva-refrigeration-service-app**
   - Which directory is your code? **./**
   - Want to override settings? **No**

5. **Add environment variables**:
   ```bash
   vercel env add EXPO_PUBLIC_SUPABASE_URL
   # Paste your Supabase URL when prompted
   
   vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
   # Paste your Supabase anon key when prompted
   ```

6. **Deploy to production**:
   ```bash
   vercel --prod
   ```

7. **Get your shareable link**:
   - Vercel will output a URL like: `https://oliva-refrigeration-service-app.vercel.app`
   - This URL is permanent and available 24/7
   - You can also find it in your Vercel dashboard

### Pros:
- ✅ Permanent URL (stays up forever)
- ✅ Fast global CDN
- ✅ Automatic HTTPS
- ✅ Free for personal projects
- ✅ Auto-deploys on git push (if connected to GitHub)

### Cons:
- ❌ Requires account setup
- ❌ Initial setup takes longer

---

## Alternative: Netlify Deployment

Similar to Vercel, but with Netlify:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   npm run export:web
   netlify deploy --dir=dist --prod
   ```

4. **Set environment variables** in Netlify dashboard:
   - Go to Site Settings → Environment Variables
   - Add `EXPO_PUBLIC_SUPABASE_URL`
   - Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## Mobile App Testing (Expo Go)

To test on physical mobile devices:

1. **Install Expo Go** on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Scan the QR code** with:
   - iOS: Camera app
   - Android: Expo Go app

4. **Share the link**:
   - The URL shown (e.g., `exp://xxx.xxx.xxx.xxx:8081`) can be opened in Expo Go
   - Or share the QR code image

---

## Troubleshooting

### Port already in use:
```bash
# Kill the process using the port
killall node
# Or specify a different port
npx expo start --port 8082 --tunnel
```

### Tunnel not working:
```bash
# Install/update ngrok
npm install -g @expo/ngrok
# Try again
npm run start-web
```

### Build errors:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Environment variables not working:
- Make sure `.env` file is in the root directory
- Restart the development server after adding variables
- For Vercel/Netlify, set them in the dashboard

---

## Next Steps

After deploying:
1. Test the app thoroughly
2. Set up authentication in Supabase
3. Invite team members to test
4. Configure custom domain (optional)
5. Set up monitoring and analytics

For production mobile apps, use **EAS Build**:
```bash
npm install -g eas-cli
eas build --platform all
```

---

## Need Help?

- Check the main README.md for detailed documentation
- Review SUPABASE_SETUP.md for backend configuration
- Visit https://docs.expo.dev for Expo documentation
- Visit https://vercel.com/docs for Vercel documentation
