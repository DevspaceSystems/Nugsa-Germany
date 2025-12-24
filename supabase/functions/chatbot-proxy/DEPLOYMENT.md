# Deploying the Chatbot Edge Function

## Prerequisites
- Supabase project created
- Supabase CLI installed (or use Supabase Dashboard)

## Option 1: Deploy via Supabase CLI (Recommended)

### 1. Install Supabase CLI (if not installed)
```powershell
# Using npm
npm install -g supabase

# Or using scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Login to Supabase
```powershell
supabase login
```

### 3. Link your project
```powershell
supabase link --project-ref YOUR_PROJECT_REF
```

To find your project ref:
- Go to Supabase Dashboard
- Settings → General → Reference ID

### 4. Set the GEMINI_API_KEY secret
```powershell
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Deploy the Edge Function
```powershell
cd "d:\Projects Folder\Dev Projects\NUGSA-Germany Platform\NUGSA-Germany Platform"
supabase functions deploy chatbot-proxy
```

---

## Option 2: Deploy via Supabase Dashboard

### 1. Go to Edge Functions
- Open your Supabase project dashboard
- Navigate to **Edge Functions** in the left sidebar
- Click **Create a new function**

### 2. Create the function
- Name: `chatbot-proxy`
- Copy the entire content from `supabase/functions/chatbot-proxy/index.ts`
- Paste it into the editor
- Click **Deploy**

### 3. Set Environment Variables
- In the Edge Functions page, click on `chatbot-proxy`
- Go to **Secrets** tab
- Add a new secret:
  - Key: `GEMINI_API_KEY`
  - Value: Your Google Gemini API key
- Save

---

## Verify Deployment

### Test the Edge Function
```powershell
node scripts\test-edge-function.js
```

Expected output:
- ✓ Streaming response detected
- Bot responds with relevant information

---

## Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Get API Key**
3. Create a new API key or use an existing one
4. Copy the key and use it in the deployment steps above

---

## Troubleshooting

### Error: "GEMINI_API_KEY is not set"
- Make sure you've set the secret in Supabase (see steps above)
- Redeploy the function after setting the secret

### Error: "404 NOT_FOUND"
- The Edge Function is not deployed
- Follow the deployment steps above

### Error: "model not found"
- Your API key might not have access to `gemini-1.5-flash`
- Try using `gemini-1.5-flash-latest` or `gemini-pro` instead
- Update line 68 in `index.ts` with the correct model name

### Error: "CORS"
- The CORS headers are already configured in the Edge Function
- Make sure you're calling from the correct domain
- Check that the Supabase URL in `.env` is correct
