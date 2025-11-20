# Fix Announcements Upload Issue

## Problem
The announcement section is still not working even after running the storage bucket SQL.

## Solution
Run this simplified SQL script that explicitly fixes the `news-images` bucket policies.

---

## 🚀 Quick Fix

### Step 1: Run the Fix Script

1. Go to **Supabase Dashboard** → **SQL Editor** → **New query**
2. Copy and paste the contents of `supabase/migrations/005_fix_news_images_policies.sql`
3. Click **"Run"**
4. ✅ Wait for success message

---

## 🔍 What This Script Does

1. **Ensures the bucket exists** with correct settings
2. **Drops any conflicting policies** for `news-images`
3. **Creates explicit, simple policies**:
   - ✅ Public read access (anyone can view)
   - ✅ Authenticated users can upload (any logged-in user)
   - ✅ Authenticated users can update
   - ✅ Authenticated users can delete

---

## ✅ Verify It Worked

1. Go to **Storage** → **news-images** bucket
2. Click on **Policies** tab
3. You should see 4 policies:
   - "Public read access for news-images"
   - "Authenticated users can upload to news-images"
   - "Authenticated users can update in news-images"
   - "Users can delete in news-images"

4. **Test the upload**:
   - Go to Admin Dashboard → Announcements tab
   - Try adding a new announcement with an image
   - Should work now! ✅

---

## 🐛 If Still Not Working

### Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Try uploading an announcement
4. Look for any error messages
5. Share the error message if you see one

### Common Issues:

**Issue 1: "Bucket not found"**
- Solution: Make sure the bucket was created. Check Storage → Buckets

**Issue 2: "Permission denied"**
- Solution: Make sure you're logged in as an admin
- Check your profile has `role = 'admin'` and `is_verified = true`

**Issue 3: "File too large"**
- Solution: Make sure image is under 5MB

**Issue 4: "Invalid file type"**
- Solution: Only JPEG, JPG, PNG, GIF, WebP are allowed

---

## 📝 Alternative: Manual Policy Creation

If the script doesn't work, you can manually create the policies:

1. Go to **Storage** → **news-images** → **Policies**
2. Click **"New Policy"**
3. Create these policies one by one:

**Policy 1: Public Read**
- Policy name: `Public read access for news-images`
- Allowed operation: `SELECT`
- Policy definition:
  ```sql
  bucket_id = 'news-images'
  ```

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated users can upload to news-images`
- Allowed operation: `INSERT`
- Policy definition:
  ```sql
  bucket_id = 'news-images' AND auth.role() = 'authenticated'
  ```

**Policy 3: Authenticated Update**
- Policy name: `Authenticated users can update in news-images`
- Allowed operation: `UPDATE`
- Policy definition:
  ```sql
  bucket_id = 'news-images' AND auth.role() = 'authenticated'
  ```

**Policy 4: Authenticated Delete**
- Policy name: `Users can delete in news-images`
- Allowed operation: `DELETE`
- Policy definition:
  ```sql
  bucket_id = 'news-images' AND auth.role() = 'authenticated'
  ```

---

## ✅ Success!

Once the policies are set up correctly, you should be able to:
- ✅ Upload images when creating announcements
- ✅ See uploaded images in the announcement
- ✅ Delete announcements with images

**Try it now!** 🎉

