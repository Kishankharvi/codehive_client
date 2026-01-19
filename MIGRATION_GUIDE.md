# CodeHive Frontend Migration - Remaining Tasks

## ✅ Completed
- [x] Vite project created
- [x] Tailwind CSS 4 installed
- [x] Dependencies installed
- [x] Vite config created
- [x] Base CSS with Tailwind
- [x] Login page (Tailwind)
- [x] Register page (Tailwind)
- [x] App.jsx (Tailwind)
- [x] Services updated (Vite env vars)
- [x] AuthContext updated

## 🚧 Remaining Files to Convert

### High Priority
1. **Dashboard.jsx** - Convert CSS classes to Tailwind
2. **ProjectView.jsx** - Convert CSS classes to Tailwind
3. **CodeEditor.jsx** - Convert CSS classes to Tailwind
4. **FileExplorer.jsx** - Convert CSS classes to Tailwind

### Instructions for Manual Conversion

Since these files are large, here's the conversion pattern:

#### CSS Class Mapping

**Old CSS** → **Tailwind Classes**

```
.dashboard → min-h-screen bg-bg-primary
.dashboard-header → bg-bg-secondary border-b border-border p-6 sticky top-0 z-100
.header-content → max-w-7xl mx-auto flex justify-between items-center
.logo → flex items-center gap-2
.logo-icon → text-2xl text-primary
.btn → px-4 py-2 rounded-lg font-medium text-sm transition-all
.btn-primary → bg-gradient-to-r from-primary to-primary-dark text-white shadow-md hover:-translate-y-0.5
.btn-secondary → bg-bg-tertiary text-text-primary hover:bg-bg-hover
.card → bg-bg-secondary border border-border rounded-xl p-6 shadow-md
.input → w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
.modal-overlay → fixed inset-0 bg-black/70 flex items-center justify-center z-1000 p-6
.modal → bg-bg-secondary border border-border rounded-xl p-8 w-full max-w-lg shadow-xl
```

## 🎯 Quick Conversion Steps

1. Open each file from `client-old/src/`
2. Remove CSS imports
3. Replace className strings with Tailwind equivalents
4. Test in browser
5. Adjust as needed

## 🚀 To Complete Migration

```bash
# 1. Copy remaining files as templates
cp ../client-old/src/pages/Dashboard.jsx pages/
cp ../client-old/src/pages/ProjectView.jsx pages/
cp ../client-old/src/components/CodeEditor.jsx components/
cp ../client-old/src/components/FileExplorer.jsx components/

# 2. Remove CSS imports from each file
# 3. Convert classes using the mapping above
# 4. Test the app

# 5. Start dev server
npm run dev
```

## 📝 Notes

- Use `import.meta.env.VITE_*` instead of `process.env.REACT_APP_*`
- Tailwind config uses `@theme` directive (v4 syntax)
- Custom colors defined in index.css `@theme` block
- All animations preserved in index.css

## ✨ Benefits Achieved

- ⚡ Vite HMR (instant updates)
- 🎨 Tailwind CSS 4 (latest)
- 📦 Smaller bundle
- 🚀 Faster builds
- 🔧 Better DX
