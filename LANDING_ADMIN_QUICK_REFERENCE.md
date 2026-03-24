# Landing Page Admin Panel - Quick Reference

## 🎨 Editable Sections

### 1. Hero Section
**Location:** Admin Dashboard → Edit Landing → Hero Section

**Editable Fields:**
- Heading (Main title)
- Tagline (Subtitle)
- CTA Button Text
- CTA Button Link (#section-id or /path)
- Hero Image (Upload via Cloudinary)
- Stats (3 fields: value + label pairs)

**File:** `HeroEditor.tsx`
**Backend:** PATCH `/api/admin/landing` → `hero` field

**Display Component:** `Hero.tsx`

---

### 2. Quiz Categories
**Location:** Admin Dashboard → Edit Landing → Quiz Categories

**Editable Fields:**
- Category Name
- Description (optional)
- Category Bullets/Topics (up to 10)

**Features:**
- Drag-and-drop to reorder
- Add new categories
- Edit existing categories
- Delete categories
- Undo/Reset functionality

**File:** `CategoryEditor.tsx`
**Backend:** PATCH `/api/admin/landing` → `categories` field

**Display Component:** `QuizCategories.tsx`

---

### 3. Why Choose FinoQz (Features Section)
**Location:** Admin Dashboard → Edit Landing → Why Choose Section

**Editable Fields:**
- Title
- Description
- Feature Bullets (up to 10 per feature)

**Features:**
- Add/remove features
- Edit titles and descriptions
- Manage bullet points
- Undo/Reset functionality

**File:** `WhyChooseEditor.tsx`
**Backend:** PATCH `/api/admin/landing` → `reasons` field

**Display Component:** `Features.tsx`

---

### 4. Demo Quiz
**Location:** Admin Dashboard → Edit Landing → Demo Quiz Editor

**Features:**

#### Step 1: Create/Select Category
- Create new category
- Select existing category

#### Step 2: Choose Mode
- **Manual Mode:** Add questions one by one
  - Question text
  - 4 Options
  - Correct answer selection
  
- **AI Mode:** Generate questions via AI
  - Prompt (instructions)
  - Number of questions
  - Auto-generate questions

**File:** `DemoQuizEditor.tsx` + sub-components
**Backend:** POST/GET/DELETE `/api/admin/demo-quiz/*` endpoints

**Display Component:** `TryQuiz.tsx`

---

### 5. Reviews (Managed Separately)
**Location:** Admin Dashboard → Reviews Management

**Features:**
- Approve/Reject reviews
- Pin featured reviews
- Delete reviews

**Note:** Review content is managed separately from landing.json

**Backend:** `/api/reviews/admin/*` endpoints

**Display Component:** `Reviews.tsx`

---

### 6. Community Insights (Planned)
**Status:** Coming Soon
**Note:** Currently uses hardcoded data from `communityPosts.ts`

---

## 🔐 Access Control

### Required Role: **Admin**

To edit landing content, user must:
1. Be logged in with valid JWT token (adminToken cookie)
2. Have `role === 'admin'`
3. Present valid JWT secret

### API Authentication
```bash
# All admin editing endpoints require:
Cookie: adminToken=<valid_jwt_token>

# Headers (automatic with apiAdmin client):
Content-Type: application/json
```

---

## 📱 Admin Panel Navigation

```
Admin Dashboard
├── Edit Landing
│   ├── Hero Section
│   ├── Quiz Categories
│   ├── Why Choose Section
│   └── Demo Quiz Editor
├── Reviews Management
└── Other Admin Features
```

---

## 🔄 Data Flow Example: Editing Hero Section

```
1. Admin clicks HeroEditor in admin panel
   ↓
2. HeroEditor.tsx useEffect() runs:
   apiAdmin.get('api/admin/landing')
   ↓
3. Backend receives request:
   GET /api/admin/landing (public, no auth needed)
   ↓
4. landingController.getLanding() returns landing.json
   ↓
5. HeroEditor populates form with current data
   ↓
6. Admin modifies fields
   ↓
7. Admin clicks "Save Changes"
   ↓
8. HeroEditor.handleSave() runs:
   apiAdmin.patch('api/admin/landing', { hero: {...} })
   ↓
9. Backend receives request:
   PATCH /api/admin/landing with hero data
   [Authentication check: verifyToken + requireAdmin]
   ↓
10. landingController.saveLanding() runs:
    - Validate hero data
    - Merge with existing data
    - Write to landing.json
    ↓
11. Response sent with success message
    ↓
12. Admin sees success notification
    ↓
13. Landing page components automatically load new data
    on next request to GET /api/admin/landing
```

---

## 🧪 Testing Each Feature

### Hero Section Test
1. Login as admin
2. Go to Hero Section editor
3. Change heading + save
4. Check landing page (refresh if needed)
5. ✅ Change should appear

### Categories Test  
1. Add new category
2. Edit existing bullet
3. Drag to reorder
4. Save
5. ✅ Changes appear in QuizCategories component

### Demo Quiz Test
1. Create test category
2. Add 2-3 questions manually
3. Save
4. Go to "Try a Demo Quiz" section
5. Select category
6. ✅ Your questions should appear

### AI Generation Test
1. Create test category (if doesn't exist)
2. Go to AI Mode
3. Enter prompt: "Generate MCQs on taxation basics"
4. Set count to 3
5. Click Generate
6. ✅ Questions should be generated
7. Review and save

---

## 🚨 Troubleshooting Admin Editing

### Problem: "You are not authorized" error
**Solutions:**
1. Verify you're logged in as admin user
2. Check JWT token hasn't expired (login again)
3. Verify adminToken cookie exists in browser
4. Check admin user has `role: 'admin'` in database

### Problem: Changes don't appear on landing page
**Solutions:**
1. Hard refresh landing page (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify save was successful (green message shown)
4. Check landing.json has correct data:
   ```bash
   cat backend/data/landing.json
   ```
5. Verify backend file permissions (must be writable)

### Problem: "Failed to save changes"
**Solutions:**
1. Check all required fields are filled
2. Check network tab for response code
3. 401 = Not logged in
4. 403 = Not admin user
5. 500 = Server error (check backend logs)

### Problem: Images not uploading
**Solutions:**
1. Verify Cloudinary credentials in .env
2. Check image file size (should be < 10MB)
3. Check NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET set
4. Check browser console for upload errors

---

## 📊 Data Update Frequency

### Real-time Updates
- Landing page components check for updates on:
  - Page load
  - Component mount (useEffect)
  - Manual refresh

### Caching
- Landing.json served fresh on each request (no caching)
- Frontend can implement client-side caching if needed

---

## 🔄 Rollback Procedure

If you need to revert changes:

1. **Restore from backup:**
   ```bash
   cp backend/data/landing.json.backup backend/data/landing.json
   ```

2. **Or manually edit landing.json:**
   - Edit `backend/data/landing.json` directly
   - Ensure valid JSON format
   - Restart backend

3. **Verify changes:**
   - Refresh landing page
   - Changes should revert immediately

---

## 📝 Best Practices

1. **Before Major Changes**
   - Backup landing.json
   - Note current content

2. **When Editing Content**
   - Keep descriptions concise
   - Use clear, engaging language
   - Test each section after editing
   - Preview on mobile if possible

3. **Image Management**
   - Use Cloudinary for hosting (don't use local files)
   - Compress images before upload (< 1MB recommended)
   - Use descriptive filenames

4. **Data Validation**
   - Don't leave fields empty
   - Keep stats value/label pairs meaningful
   - Limit bullet points to key information

---

## 🆘 Support

If you encounter issues not listed here:

1. Check browser console (F12) for errors
2. Check backend logs for error messages
3. Verify .env variables are set correctly
4. Ensure JWT_SECRET is configured
5. Check landing.json file exists and has read/write permissions

---

**Admin Panel Version:** 1.0
**Last Updated:** March 19, 2026
**Status:** ✅ Production Ready
