# 🚀 REDEPLOY INSTRUCTIONS

## Current Status
- ✅ Local code updated to use `gemini-1.5-flash-002` (stable model)
- ❌ Supabase still running old code with deprecated `gemini-1.5-flash`
- 🔄 **Action Required**: Redeploy the Edge Function

---

## Quick Redeploy Steps

### Method 1: Supabase Dashboard (Recommended - No CLI needed)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your NUGSA project

2. **Navigate to Edge Functions**
   - Click "Edge Functions" in left sidebar
   - Click on `chatbot-proxy`

3. **Update the Code**
   - Click "Edit" or go to the code editor
   - **Delete all existing code**
   - Copy the ENTIRE content from: `supabase/functions/chatbot-proxy/index.ts`
   - Paste into the Supabase editor
   - **Verify line 68 shows**: `model: "gemini-1.5-flash-002"`

4. **Deploy**
   - Click "Deploy" button
   - Wait for deployment to complete (usually 10-30 seconds)

5. **Test**
   ```powershell
   node scripts\test-edge-function.js
   ```

---

### Method 2: Supabase CLI

If you have the CLI installed:

```powershell
cd "d:\Projects Folder\Dev Projects\NUGSA-Germany Platform\NUGSA-Germany Platform"
supabase functions deploy chatbot-proxy
```

Then test:
```powershell
node scripts\test-edge-function.js
```

---

## What Changed

**Old (Deprecated)**:
```typescript
model: "gemini-1.5-flash"  // ❌ No longer supported
```

**New (Stable)**:
```typescript
model: "gemini-1.5-flash-002"  // ✅ Stable September 2024 release
```

---

## Expected Test Output After Redeployment

```
🔍 Testing Supabase Edge Function...

Configuration:
  Supabase URL: ✓ Found
  Anon Key: ✓ Found

📡 Sending request to: https://...

Response Status: 200 OK
Content-Type: text/event-stream

✓ Streaming response detected

📨 Streaming response:

NUGSA stands for National Union of Ghanaian Student Associations in Germany...

✅ Edge Function test completed successfully!
```

---

## Troubleshooting

**If you still see the old model error:**
- The deployment didn't complete successfully
- Try redeploying again
- Check Supabase Dashboard → Edge Functions → Logs for errors

**If you see "API key invalid":**
- Verify `GEMINI_API_KEY` is set in Supabase Secrets
- Get a new key from: https://makersuite.google.com/app/apikey

---

## After Successful Deployment

Once the test passes, your chatbot will work! Test it in your app:
1. Open your app: `npm run dev`
2. Click the chatbot widget
3. Ask: "What is NUGSA?"
4. You should get a response! 🎉
