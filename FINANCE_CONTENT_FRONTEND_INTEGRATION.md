# Finance Content - Frontend to Backend Integration Guide

## 🚀 Quick Start Integration

### Current State
- ✅ Backend: Fully implemented and production-ready
- ⚠️ Frontend Admin: Using dummy/local data
- ✅ Frontend User: Already properly integrated

---

## 🔗 Integration Steps for Admin Dashboard

### Step 1: Import API Client

```typescript
import apiAdmin from '@/lib/apiAdmin';
```

### Step 2: Update State Initialization

**Before (Dummy Data):**
```typescript
const [contents, setContents] = useState([
  { id: 1, title: '...', /* dummy data */ }
]);
```

**After (From Backend):**
```typescript
useEffect(() => {
  const fetchContent = async () => {
    try {
      const res = await apiAdmin.get('/api/finance-content/admin/all', {
        params: { page: 1, limit: 20 }
      });
      setContents(res.data.content);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };
  fetchContent();
}, []);
```

### Step 3: Update Create Handler

**Before:**
```typescript
const handleSaveContent = (data: ContentFormData) => {
  const newContent = {
    ...data,
    id: contents.length + 1,
    views: 0,
    likes: 0,
    uploadDate: new Date().toISOString().split('T')[0],
  };
  setContents([newContent, ...contents]);
};
```

**After:**
```typescript
const handleSaveContent = async (data: ContentFormData) => {
  try {
    const res = await apiAdmin.post('/api/finance-content/admin/create', {
      title: data.title,
      category: data.category,
      type: data.type,
      content: data.content,
      thumbnail: data.thumbnail,
      videoLink: data.videoLink,
      toolLink: data.toolLink,
      tags: data.tags,
      isFeatured: data.isFeatured,
      excerpt: data.content?.substring(0, 300)
    });
    
    // Refresh list
    const updatedRes = await apiAdmin.get('/api/finance-content/admin/all');
    setContents(updatedRes.data.content);
  } catch (error) {
    console.error('Failed to create content:', error);
  }
};
```

### Step 4: Update Edit Handler

**After:**
```typescript
const handleEdit = (id: number) => {
  const contentToEdit = contents.find(item => item.id === id);
  if (contentToEdit) {
    setEditingContent(contentToEdit);
    setShowAddModal(true);
  }
};

// When saving edit:
if (editingContent) {
  const res = await apiAdmin.put(
    `/api/finance-content/admin/${editingContent._id}`,
    { /* updated data */ }
  );
  // Refresh list
}
```

### Step 5: Update Delete Handler

**Before:**
```typescript
const handleDelete = (id: number) => {
  setContents(contents.filter(item => item.id !== id));
};
```

**After:**
```typescript
const handleDelete = async (id: number) => {
  try {
    await apiAdmin.delete(`/api/finance-content/admin/${id}`);
    setContents(contents.filter(item => item.id !== id));
  } catch (error) {
    console.error('Failed to delete content:', error);
  }
};
```

### Step 6: Update Visibility Toggle

**Add New Handler:**
```typescript
const handleToggleVisibility = async (id: number) => {
  try {
    const res = await apiAdmin.patch(
      `/api/finance-content/admin/${id}/visibility`
    );
    
    // Update local state
    setContents(contents.map(item =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    ));
  } catch (error) {
    console.error('Failed to toggle visibility:', error);
  }
};
```

**Connect to ContentCard:**
```typescript
<button
  onClick={() => handleToggleVisibility(content.id)}
  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg"
>
  {content.isVisible ? <Eye /> : <EyeOff />}
</button>
```

### Step 7: Update Featured Toggle

**Add New Handler:**
```typescript
const handleToggleFeatured = async (id: number) => {
  try {
    const res = await apiAdmin.patch(
      `/api/finance-content/admin/${id}/featured`
    );
    
    // Update local state
    setContents(contents.map(item =>
      item.id === id ? { ...item, isFeatured: !item.isFeatured } : item
    ));
  } catch (error) {
    console.error('Failed to toggle featured:', error);
  }
};
```

---

## 🔄 Data Field Mapping

### Frontend Expects → Backend Provides

```typescript
{
  id: string,              // → Backend _id
  title: string,           // → title ✅
  category: string,        // → category ✅
  type: 'article'|'video'|'pdf'|'tool',  // → type ✅
  thumbnail: string,       // → thumbnail ✅
  videoLink?: string,      // → videoLink ✅
  content?: string,        // → content ✅
  toolLink?: string,       // → toolLink ✅
  visibility: string,      // → isVisible ✅
  tags: string[],          // → tags ✅
  isFeatured: boolean,     // → isFeatured ✅
  views: number,           // → views ✅
  likes: number,           // → likes ✅
  uploadDate: string,      // → createdAt ✅
  isVisible: boolean       // → isVisible ✅
}
```

---

## 📝 AddContentModal Updates

### Import and Setup
```typescript
import apiAdmin from '@/lib/apiAdmin';

// In component:
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState('');
```

### Update Submit Handler
```typescript
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  setError('');
  
  try {
    const payload = {
      title: formData.title,
      category: formData.category,
      type: formData.type,
      content: formData.content,
      thumbnail: formData.thumbnail,
      videoLink: formData.videoLink,
      toolLink: formData.toolLink,
      tags: formData.tags.split(',').map(t => t.trim()),
      isFeatured: formData.isFeatured,
      excerpt: formData.content?.substring(0, 300)
    };
    
    if (editData) {
      // Update
      await apiAdmin.put(`/api/finance-content/admin/${editData._id}`, payload);
    } else {
      // Create
      await apiAdmin.post('/api/finance-content/admin/create', payload);
    }
    
    onSubmit(payload);
    onClose();
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to save content');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🧪 Testing Checklist

- [ ] Fetch and display all content on page load
- [ ] Create new article content
- [ ] Create new video content
- [ ] Create new PDF content
- [ ] Create new tool content
- [ ] Edit existing content
- [ ] Delete content
- [ ] Toggle visibility
- [ ] Toggle featured status
- [ ] Error handling works
- [ ] Loading states show
- [ ] Success messages appear
- [ ] Search/filter still works
- [ ] Pagination works with real data

---

## 🔧 Handling Edge Cases

### No Content Exists
```typescript
if (contents.length === 0) {
  return <EmptyState />;
}
```

### Loading State
```typescript
const [loading, setLoading] = useState(false);

return (
  <div>
    {loading && <LoadingSpinner />}
    {!loading && contents.map(...)}
  </div>
);
```

### Error Handling
```typescript
try {
  // API call
} catch (error) {
  const message = error.response?.data?.message || 'Something went wrong';
  setError(message);
  // Show error to user
}
```

---

## 🚀 Common Integration Mistakes

❌ **Wrong:** Using relative paths
```typescript
apiAdmin.get('finance-content/admin/all') // Missing /api/
```

✅ **Right:** Using full API paths
```typescript
apiAdmin.get('/api/finance-content/admin/all')
```

---

❌ **Wrong:** Not handling loading states
```typescript
const [contents, setContents] = useState(null);
// Will crash when rendering
```

✅ **Right:** Initialize with empty array
```typescript
const [contents, setContents] = useState([]);
```

---

❌ **Wrong:** Forgot to add .data when accessing response
```typescript
const contents = res; // Wrong
```

✅ **Right:** Access data property
```typescript
const contents = res.data.content;
```

---

## 📚 API Response Format

### Successful Create
```json
{
  "message": "Content created successfully",
  "content": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Article Title",
    "slug": "article-title",
    "type": "article",
    "isPublished": false,
    "isVisible": true,
    "isFeatured": false,
    "views": 0,
    "likes": 0,
    "createdAt": "2024-11-20T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "message": "Content is required for articles"
}
```

---

## 🎯 Integration Completion Criteria

- ✅ All CRUD operations work
- ✅ Data persists to database
- ✅ Error handling shows user feedback
- ✅ Loading states prevent UI freeze
- ✅ Toggles update immediately
- ✅ Search/filter work with real data
- ✅ Admin can manage all content types
- ✅ No console errors
- ✅ Responsive on mobile

---

**Frontend Integration Status:** Ready to implement
**Backend Status:** ✅ Production ready
**Estimated Integration Time:** 2-3 hours
**Complexity Level:** Medium
