# Dawak — Web App Architecture

## Pharmacy Dashboard + Admin Dashboard

> One React app — role determines what the user sees after login.
> Stack: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui

---

## 1. Tech Stack

| Layer         | Choice                       | Why                                          |
| ------------- | ---------------------------- | -------------------------------------------- |
| Framework     | React 18 + Vite              | Fast dev server, modern tooling              |
| Language      | TypeScript                   | Type safety across API calls and components  |
| Styling       | Tailwind CSS + shadcn/ui     | Consistent design system, accessible         |
| Routing       | React Router v6              | Nested routes, protected routes by role      |
| Server State  | TanStack Query (React Query) | Caching, loading/error states, mutations     |
| Client State  | Zustand                      | Auth token, role, user info                  |
| HTTP          | Axios                        | Interceptors for token attach + 401 handling |
| Auth          | Supabase Auth (JS SDK)       | Login/logout/refresh — same as mobile        |
| Forms         | React Hook Form + Zod        | Validation, type-safe form schemas           |
| File Upload   | React Dropzone               | Excel drag & drop for inventory import       |
| Charts        | Recharts                     | Analytics charts for admin dashboard         |
| Notifications | Supabase Realtime            | Live pharmacy notifications in browser       |

---

## 2. Folder Structure

```
src/
├── main.tsx
├── App.tsx                          # Router + QueryClient + providers setup
│
├── core/
│   ├── api/
│   │   ├── axios.ts                 # Axios instance + request interceptor (token)
│   │   │                            # + response interceptor (401 redirect)
│   │   └── endpoints.ts             # All API endpoint strings as constants
│   ├── auth/
│   │   ├── auth.store.ts            # Zustand store: token, role, user
│   │   └── auth.types.ts            # AuthUser type
│   ├── supabase/
│   │   └── supabase.client.ts       # Supabase JS client instance
│   └── types/
│       ├── api.types.ts             # ApiResponse<T> = { data: T, meta: {...} }
│       └── common.types.ts          # Shared enums and types
│
├── layouts/
│   ├── AuthLayout.tsx               # Centered card — for login + register pages
│   ├── PharmacyLayout.tsx           # Sidebar + topbar for pharmacy pages
│   └── AdminLayout.tsx              # Sidebar + topbar for admin pages
│
├── router/
│   ├── index.tsx                    # All routes defined here
│   ├── ProtectedRoute.tsx           # Redirects to /login if not authenticated
│   └── RoleRoute.tsx                # Redirects to /unauthorized if wrong role
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterPharmacyForm.tsx   # Multi-step form: info + map picker
│   │   ├── hooks/
│   │   │   ├── useLogin.ts                # useMutation → Supabase login + /auth/role
│   │   │   └── useRegisterPharmacy.ts     # useMutation → POST /pharmacy/register
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPharmacyPage.tsx   # Public page at /register
│   │
│   ├── pharmacy/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── hooks/
│   │   │   │   └── usePharmacyStats.ts
│   │   │   └── pages/
│   │   │       └── PharmacyDashboardPage.tsx
│   │   │
│   │   ├── inventory/
│   │   │   ├── components/
│   │   │   │   ├── InventoryTable.tsx
│   │   │   │   ├── AddItemModal.tsx
│   │   │   │   ├── EditItemModal.tsx
│   │   │   │   └── NearExpiryBadge.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useInventory.ts       # useQuery → GET /pharmacy/inventory
│   │   │   │   ├── useAddInventory.ts    # useMutation → POST /pharmacy/inventory
│   │   │   │   ├── useUpdateInventory.ts # useMutation → PATCH /pharmacy/inventory/:id
│   │   │   │   └── useDeleteInventory.ts # useMutation → DELETE /pharmacy/inventory/:id
│   │   │   └── pages/
│   │   │       └── InventoryPage.tsx
│   │   │
│   │   ├── import/
│   │   │   ├── components/
│   │   │   │   ├── DropzoneUploader.tsx
│   │   │   │   └── ImportResultTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useImportFile.ts      # useMutation → POST /pharmacy/inventory/import
│   │   │   │   └── useImportStatus.ts    # useQuery → GET /pharmacy/inventory/import/:jobId
│   │   │   └── pages/
│   │   │       └── ImportPage.tsx
│   │   │
│   │   ├── reservations/
│   │   │   ├── components/
│   │   │   │   ├── ReservationTable.tsx
│   │   │   │   ├── ConfirmPickupModal.tsx
│   │   │   │   └── CancelReservationModal.tsx  # Confirm before cancel
│   │   │   ├── hooks/
│   │   │   │   ├── usePharmacyReservations.ts       # useQuery → GET /pharmacy/reservations
│   │   │   │   ├── useConfirmPickup.ts              # useMutation → POST /pharmacy/pickup
│   │   │   │   └── useCancelPharmacyReservation.ts  # useMutation → DELETE /pharmacy/reservations/:id
│   │   │   └── pages/
│   │   │       └── ReservationsPage.tsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── components/
│   │   │   │   └── NotificationsList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useNotifications.ts         # useQuery → GET /notifications/me
│   │   │   │   └── useRealtimeNotifications.ts # Supabase Realtime → INSERT on notifications (pharmacy_id)
│   │   │   └── pages/
│   │   │       └── NotificationsPage.tsx
│   │   │
│   │   └── profile/
│   │       ├── hooks/
│   │       │   └── useUpdateProfile.ts   # useMutation → PATCH /pharmacy/me
│   │       └── pages/
│   │           └── ProfilePage.tsx
│   │
│   └── admin/
│       │
│       ├── dashboard/
│       │   ├── components/
│       │   │   ├── KpiCard.tsx
│       │   │   ├── TopSearchedChart.tsx   # Recharts bar chart
│       │   │   └── TopPurchasedChart.tsx  # Recharts bar chart
│       │   ├── hooks/
│       │   │   ├── useAnalyticsOverview.ts       # GET /admin/analytics/overview
│       │   │   ├── useTopSearchedDrugs.ts        # GET /admin/analytics/drugs/searched
│       │   │   └── useTopPurchasedDrugs.ts       # GET /admin/analytics/drugs/purchased
│       │   └── pages/
│       │       └── AdminDashboardPage.tsx
│       │
│       ├── notifications/
│       │   ├── components/
│       │   │   └── AdminNotificationsDropdown.tsx  # Bell icon in topbar
│       │   └── hooks/
│       │       └── useAdminRealtimeNotifications.ts # Supabase Realtime → INSERT on
│       │                                             # pharmacy_profiles + user_profiles
│       │
│       ├── pharmacies/
│       │   ├── components/
│       │   │   ├── PharmacyTable.tsx
│       │   │   ├── PharmacyStatusBadge.tsx
│       │   │   └── ReviewPharmacyModal.tsx    # Approve / Reject with reason
│       │   ├── hooks/
│       │   │   ├── useAdminPharmacies.ts      # useQuery → GET /admin/pharmacies
│       │   │   ├── useApprovePharmacy.ts      # useMutation → POST /admin/pharmacies/:id/approve
│       │   │   └── useRejectPharmacy.ts       # useMutation → POST /admin/pharmacies/:id/reject
│       │   └── pages/
│       │       └── PharmaciesPage.tsx
│       │
│       ├── users/
│       │   ├── components/
│       │   │   ├── UsersTable.tsx
│       │   │   └── DeleteUserModal.tsx        # Confirm soft delete
│       │   ├── hooks/
│       │   │   ├── useAdminUsers.ts           # useQuery → GET /admin/users
│       │   │   └── useSoftDeleteUser.ts       # useMutation → DELETE /admin/users/:id
│       │   └── pages/
│       │       └── UsersPage.tsx
│       │
│       ├── reservations/
│       │   ├── components/
│       │   │   └── AllReservationsTable.tsx
│       │   ├── hooks/
│       │   │   └── useAllReservations.ts      # useQuery → GET /admin/reservations
│       │   └── pages/
│       │       └── AllReservationsPage.tsx
│
├── components/
│   ├── ui/                          # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── shared/
│       ├── Sidebar.tsx              # Renders different links per role
│       ├── Topbar.tsx               # User info + notifications bell + logout
│       ├── PageHeader.tsx
│       ├── DataTable.tsx            # Reusable table with pagination
│       ├── ConfirmModal.tsx         # Generic confirm dialog
│       └── EmptyState.tsx
│
└── lib/
    └── utils.ts                     # cn() helper from shadcn + other utils
```

---

## 3. Auth Flow

```
App Load
    ↓
Zustand checks token in localStorage
    ↓ token exists                  ↓ no token
Axios calls /auth/role               Redirect to /login
    ↓ role = 'pharmacy'   ↓ role = 'admin'   ↓ error/unknown
/pharmacy/dashboard       /admin/dashboard    Redirect to /login


Login Flow:
    ↓
1. Supabase JS SDK signInWithPassword(email, password)  →  access_token
    ↓
2. POST /auth/role  →  role = 'pharmacy' or 'admin'
    ↓
3. Zustand.setAuth({ token, role, user })
    ↓
4. localStorage.setItem('access_token', token)
    ↓
5. role = 'pharmacy'  →  /pharmacy/dashboard
   role = 'admin'     →  /admin/dashboard
   role = 'user'      →  logout + "هذا الحساب للمرضى فقط"


Pharmacy Registration Flow (public, no token needed):
    ↓
1. Pharmacy fills RegisterPharmacyForm:
   Step 1 — Basic info: pharmacy_name, phone, address, city, license_number, email, password
   Step 2 — Location: map picker (Leaflet/Google Maps) to select lat/lng
    ↓
2. POST /pharmacy/register  →  { id, pharmacy_name, status: 'pending', ... }
    ↓
3. Redirect to /login with success message:
   "تم التسجيل بنجاح. يرجى انتظار موافقة الإدارة."
    ↓
4. After admin approves → pharmacy can login normally
   (status = 'approved' required for protected pharmacy routes)
```

---

## 4. Routing Structure

```tsx
<Routes>
  {/* Public */}
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPharmacyPage />} />
  </Route>

  {/* Pharmacy — requires role = 'pharmacy' */}
  <Route element={<ProtectedRoute />}>
    <Route element={<RoleRoute allowedRole="pharmacy" />}>
      <Route element={<PharmacyLayout />}>
        <Route path="/pharmacy/dashboard" element={<PharmacyDashboardPage />} />
        <Route path="/pharmacy/inventory" element={<InventoryPage />} />
        <Route path="/pharmacy/import" element={<ImportPage />} />
        <Route path="/pharmacy/reservations" element={<ReservationsPage />} />
        <Route path="/pharmacy/notifications" element={<NotificationsPage />} />
        <Route path="/pharmacy/profile" element={<ProfilePage />} />
      </Route>
    </Route>
  </Route>

  {/* Admin — requires role = 'admin' */}
  <Route element={<ProtectedRoute />}>
    <Route element={<RoleRoute allowedRole="admin" />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/pharmacies" element={<PharmaciesPage />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/reservations" element={<AllReservationsPage />} />
      </Route>
    </Route>
  </Route>

  {/* Fallback */}
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="/unauthorized" element={<UnauthorizedPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

---

## 5. State Management

### Zustand — Auth Store (client state only)

```typescript
interface AuthStore {
  token: string | null;
  role: 'pharmacy' | 'admin' | null;
  user: { id: string; email: string } | null;
  setAuth: (token: string, role: string, user: object) => void;
  clearAuth: () => void;
}
```

يتحفظ في `localStorage` ويتقرأ عند الـ App load.

### TanStack Query — كل الـ server state

كل API call بيبقى `useQuery` أو `useMutation`. مفيش loading/error state manual.

```typescript
// مثال: inventory list
const { data, isLoading, error } = useQuery({
  queryKey: ['inventory', filters],
  queryFn: () => api.get('/pharmacy/inventory', { params: filters }),
});

// مثال: confirm pickup
const { mutate, isPending } = useMutation({
  mutationFn: (shortCode: string) =>
    api.post('/pharmacy/pickup', { short_code: shortCode }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pharmacy-reservations'] });
    toast.success('تم تأكيد الاستلام');
  },
});
```

---

## 6. Axios Setup

```typescript
// core/api/axios.ts

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response.data.data, // unwrap { data, meta } automatically
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data?.error);
  },
);
```

---

## 7. API Endpoints Reference

Base URL: `VITE_API_URL/api/v1`
All requests: `Authorization: Bearer <token>`

### Auth

```
POST   /auth/role                              → get role after Supabase login
```

### Pharmacy

```
GET    /pharmacy/me                            → pharmacy profile
PATCH  /pharmacy/me                            → update profile

GET    /pharmacy/inventory                     → inventory list (filters: status, expiry)
POST   /pharmacy/inventory                     → add item
PATCH  /pharmacy/inventory/:id                 → update item
DELETE /pharmacy/inventory/:id                 → remove item
GET    /pharmacy/inventory/near-expiry         → items expiring in 30 days
PATCH  /pharmacy/inventory/:id/discount        → update discount only

POST   /pharmacy/inventory/import              → upload Excel file
GET    /pharmacy/inventory/import/:jobId       → check import job status

GET    /pharmacy/reservations                  → incoming reservations
DELETE /pharmacy/reservations/:id              → cancel pending reservation (restores inventory)
POST   /pharmacy/pickup                        → confirm pickup by short code

GET    /notifications/me                       → notifications list
PATCH  /notifications/:id/read                 → mark as read
PATCH  /notifications/read-all                 → mark all read
```

### Admin

```
GET    /admin/pharmacies                       → list (filter: status)
POST   /admin/pharmacies/:id/approve           → approve pharmacy
POST   /admin/pharmacies/:id/reject            → reject with reason

GET    /admin/users                            → list users
DELETE /admin/users/:id                        → soft delete user

GET    /admin/reservations                     → all reservations

GET    /admin/analytics/overview               → KPI summary
GET    /admin/analytics/drugs/searched         → top searched drugs
GET    /admin/analytics/drugs/purchased        → top purchased drugs
```

---

## 8. Real-time Notifications

### Pharmacy — In-app Notifications (full page)

الـ pharmacy عندها صفحة notifications كاملة. بتستخدم **Supabase Realtime** لاستقبال الإشعارات الجديدة live.

```typescript
// features/pharmacy/notifications/hooks/useRealtimeNotifications.ts
useEffect(() => {
  const channel = supabase
    .channel('pharmacy-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `pharmacy_id=eq.${pharmacyId}`,
      },
      (payload) => {
        toast(payload.new.title, { description: payload.new.message });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [pharmacyId]);
```

---

### Admin — Notifications Dropdown (topbar bell icon)

الـ admin مش عنده صفحة notifications. عنده **bell dropdown في الـ topbar** بيعرض:

- صيدليات جديدة سجلت (status = `pending`)
- يوزرز جدد اتسجلوا

بيشتغل بـ **Supabase Realtime** مباشرة على الجداول — من غير أي endpoint في الـ backend.

```typescript
// features/admin/notifications/hooks/useAdminRealtimeNotifications.ts
useEffect(() => {
  const pharmacyChannel = supabase
    .channel('admin-new-pharmacies')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'pharmacy_profiles',
      },
      (payload) => {
        addNotification({
          type: 'new_pharmacy',
          message: `صيدلية جديدة: ${payload.new.pharmacy_name}`,
          id: payload.new.id,
          createdAt: payload.new.created_at,
        });
      },
    )
    .subscribe();

  const userChannel = supabase
    .channel('admin-new-users')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_profiles',
      },
      (payload) => {
        addNotification({
          type: 'new_user',
          message: `مستخدم جديد: ${payload.new.full_name ?? 'بدون اسم'}`,
          id: payload.new.id,
          createdAt: payload.new.created_at,
        });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(pharmacyChannel);
    supabase.removeChannel(userChannel);
  };
}, []);
```

**AdminNotificationsDropdown behavior:**

- Bell icon في الـ topbar مع badge يعرض عدد الـ unread
- Dropdown يعرض الـ notifications مرتبة من الأحدث
- كل notification بيتوجه للصفحة المناسبة لما تضغط عليها (new_pharmacy → /admin/pharmacies، new_user → /admin/users)
- "Mark all as read" يصفر الـ badge
- الـ notifications بتتخزن في Zustand أو React state (مش في DB) — بتتمسح لو الـ page اتعمل refresh

---

## 9. Pages Summary

### Pharmacy Pages

**Dashboard** — stats cards (total inventory, pending reservations, near-expiry count) + quick actions.

**Inventory** — searchable table مع filters (active/inactive/expired) + Add button + Edit/Delete per row + near-expiry highlight + discount update inline.

**Import** — drag & drop zone للـ Excel + progress indicator + results table (matched/auto_created/failed per row) + بعد ما يخلص يعرض summary.

**Reservations** — table بالحجوزات الواردة مع الـ status badges + search بالـ short code + Confirm Pickup button بيفتح modal فيه input للـ short code + Cancel button لكل reservation بـ status = `pending` (مع confirm dialog قبل الإلغاء).

**Notifications** — قايمة الإشعارات مرتبة من الأحدث + Mark all as read button + badge للـ unread count في الـ sidebar.

**Profile** — pharmacy info (name, phone, address, city) + edit form.

---

### Admin Pages

**Dashboard** — KPI cards (total users، total pharmacies، total reservations، pending approvals) + bar chart لأكتر الأدوية اتبحث عنها + bar chart لأكتر الأدوية اتشرت.

**Pharmacies** — table مع filter tabs (All / Pending / Approved / Rejected) + Approve/Reject buttons + Reject modal فيه textarea للسبب + status badge.

**Users** — table مع بيانات الـ users + delete button بيفتح confirm modal قبل الـ soft delete + بيعرض الـ deleted users بلون مختلف.

**All Reservations** — read-only table بكل الحجوزات مع filters (status، date range).

---

## 10. Environment Variables

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 11. Recommended Packages

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "axios": "^1.6",
    "@tanstack/react-query": "^5",
    "zustand": "^4",
    "react-hook-form": "^7",
    "zod": "^3",
    "@hookform/resolvers": "^3",
    "recharts": "^2",
    "react-dropzone": "^14",
    "sonner": "^1",
    "@supabase/supabase-js": "^2",
    "leaflet": "^1.9",
    "react-leaflet": "^4",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "lucide-react": "^0.400"
  },
  "devDependencies": {
    "typescript": "^5",
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "@types/leaflet": "^1.9",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

> shadcn/ui components بتتضاف بـ `npx shadcn@latest add <component>` — مش package منفصل.
> react-leaflet + leaflet بيتضافوا لصفحة الـ register عشان الـ map picker (تحديد الـ location).

---

## 12. Notes

- **One app, two roles** — الـ login page واحدة. بعد الـ role check الـ router بيوجه أوتوماتيك لـ `/pharmacy/dashboard` أو `/admin/dashboard`.
- **Role = 'user'** — لو دخل بـ user account على الويب → logout فوراً + رسالة واضحة.
- **Axios unwraps `{ data, meta }` automatically** — كل hook بياخد الـ data مباشرة من غير `.data.data`.
- **TanStack Query invalidation** — بعد أي mutation (approve، confirm pickup، cancel، delete) بيعمل `invalidateQueries` للـ list المرتبطة عشان يعمل refetch أوتوماتيك.
- **Supabase Realtime (pharmacy)** — subscribe على `notifications` table بـ `pharmacy_id` filter لاستقبال الإشعارات live.
- **Supabase Realtime (admin)** — subscribe على `pharmacy_profiles` و `user_profiles` INSERT events عشان الـ bell dropdown في الـ topbar.
- **Admin notifications** — in-memory فقط (Zustand/state)، مش محتاجة DB. بتتمسح لو الصفحة اتعمل refresh.
- **Excel Import polling** — لو الملف > 200 row، الـ UI بيعمل poll على `/pharmacy/inventory/import/:jobId` كل 3 ثواني لحد ما الـ state يبقى `completed`.
- **Pharmacy registration** — صفحة public منفصلة `/register`، بعد الـ submit بتوجه لـ `/login` مع success message. الصيدلية مش تقدر تدخل غير بعد موافقة الـ admin.
