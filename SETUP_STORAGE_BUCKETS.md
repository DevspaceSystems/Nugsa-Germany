# Setup Storage Buckets for File Uploads

## Problem
You're getting "Failed to add announcement" or similar errors when trying to upload files in the admin dashboard. This is because Supabase storage buckets haven't been created yet.

## Solution
Run the storage bucket migration script to create all required buckets and set up proper access policies.

---

## 🚀 Quick Setup (One Step)

### Step 1: Run Storage Bucket Migration

1. Go to **Supabase Dashboard** → **SQL Editor** → **New query**
2. Open `supabase/migrations/004_create_storage_buckets.sql`
3. Copy ALL contents and paste into SQL Editor
4. Click **"Run"**
5. ✅ Wait for success message

**That's it!** All storage buckets are now created and ready to use.

---

## 📦 What Gets Created

### Storage Buckets (7 total)

1. ✅ **`news-images`** - For announcement images (public, 5MB limit)
2. ✅ **`board-images`** - For board member photos (public, 5MB limit)
3. ✅ **`constitution-docs`** - For constitution PDFs (public, 10MB limit)
4. ✅ **`hero-images`** - For hero section images (public, 5MB limit)
5. ✅ **`profile-pictures`** - For user profile pictures (public, 5MB limit)
6. ✅ **`documents`** - For passport/documents (private, 10MB limit)
7. ✅ **`message-images`** - For message attachments (public, 5MB limit)

### Access Policies

- ✅ **Public read access** for all public buckets
- ✅ **Authenticated users can upload** to all buckets
- ✅ **Users can manage their own files** (in user-specific folders)
- ✅ **Admins have full access** to all buckets

---

## ✅ Verify Setup

1. Go to **Supabase Dashboard** → **Storage**
2. You should see 7 buckets listed:
   - `news-images`
   - `board-images`
   - `constitution-docs`
   - `hero-images`
   - `profile-pictures`
   - `documents`
   - `message-images`

3. Test uploading:
   - Try adding an announcement with an image
   - Try adding a board member with a photo
   - Try uploading a constitution document

---

## 🎯 Usage Examples

### Upload Announcement Image
The admin dashboard uploads to `news-images` bucket when you add an announcement with images.

### Upload Board Member Photo
The admin dashboard uploads to `board-member-images` bucket when you add/edit a board member.

### Upload Constitution Document
The admin dashboard uploads to `constitution-docs` bucket when you add a constitution PDF.

### Upload Hero Image
The hero slideshow manager uploads to `hero-images` bucket.

### Upload Profile Picture
The profile page uploads to `profile-pictures` bucket.

### Upload Document (Passport)
The profile page uploads to `documents` bucket (private).

### Upload Message Image
The messages page uploads to `message-images` bucket.

---

## 🐛 Troubleshooting

### Issue: Still getting "Failed to upload" errors

**Solution 1**: Check bucket exists
- Go to **Storage** in Supabase Dashboard
- Verify all 7 buckets are listed

**Solution 2**: Check policies
- Go to **Storage** → Click on a bucket → **Policies** tab
- Should see policies for SELECT, INSERT, UPDATE, DELETE

**Solution 3**: Check file size
- Make sure your file is under the limit:
  - Images: 5MB
  - PDFs: 10MB

**Solution 4**: Check file type
- Images: JPEG, JPG, PNG, GIF, WebP
- Documents: PDF only for constitution-docs

**Solution 5**: Check authentication
- Make sure you're logged in
- Make sure your user has a profile in the `profiles` table

### Issue: Can't see uploaded files

**Solution**: 
- Check if the bucket is public or private
- Public buckets: Anyone can view files
- Private buckets: Only the file owner can view

### Issue: "Access Denied" error

**Solution**:
1. Check your profile has `role = 'admin'` and `is_verified = true`
2. Make sure you're logged in
3. Try logging out and logging back in

---

## 📝 Notes

- **Public buckets**: Files are accessible to anyone via public URL
- **Private buckets**: Files are only accessible to the uploader or admins
- **File limits**: Set to prevent abuse (5MB for images, 10MB for PDFs)
- **Admin access**: Admins can manage all files regardless of ownership
- **User folders**: User-uploaded files are stored in `{user_id}/` folders

---

## ✅ Success Checklist

- [ ] Migration script runs successfully
- [ ] All 7 buckets appear in Storage tab
- [ ] Can upload announcement with image
- [ ] Can upload board member photo
- [ ] Can upload constitution document
- [ ] Can upload hero image
- [ ] Can upload profile picture
- [ ] Can upload message images

---

## 🔗 Next Steps

After setting up storage buckets:
1. Try adding an announcement with an image
2. Try adding a board member with a photo
3. Try uploading a constitution document
4. Test all upload features in the admin dashboard

**Everything should work now!** 🎉

