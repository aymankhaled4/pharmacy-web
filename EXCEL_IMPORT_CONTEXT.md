# Excel Import Feature — Full Context for Web Implementation

> هذا الملف يشرح بالتفصيل الكامل كيف يعمل نظام رفع ملفات الـ Excel لإدارة المخزون في صيدلية Dawak.
> الهدف: مساعدة الـ AI assistant على فهم كل شيء قبل بناء الـ Frontend.

---

## 1. ما الذي يفعله هذا الـ Feature؟

الصيدلاني يرفع ملف Excel يحتوي على قائمة الأدوية المتاحة لديه، والنظام يقوم تلقائياً بـ:

1. قراءة الملف وتحليل الأعمدة
2. مطابقة كل دواء مع قاعدة البيانات باستخدام AI
3. إضافة الأدوية إلى مخزون الصيدلية (`inventory` table)

---

## 2. Backend API Endpoints

### Endpoint 1 — رفع الملف

```
POST /api/v1/pharmacy/inventory/import
Authorization: Bearer <pharmacy_jwt>
Content-Type: multipart/form-data

Body: form-data
  file: <Excel file (.xlsx or .xls only, max 10MB)>
```

**Response — ملف صغير (≤ 200 صف) — معالجة فورية:**

```json
{
  "data": {
    "matched": 3,
    "autoCreated": 2,
    "failed": 1,
    "total": 6,
    "rows": [
      {
        "drugName": "Panadol 500mg",
        "status": "matched",
        "drugId": "uuid-here"
      },
      {
        "drugName": "Brufen 400mg",
        "status": "matched",
        "drugId": "uuid-here"
      },
      {
        "drugName": "Amoxil 250mg",
        "status": "matched",
        "drugId": "uuid-here"
      },
      {
        "drugName": "Custom Drug X",
        "status": "auto_created",
        "drugId": "uuid-here"
      },
      {
        "drugName": "Custom Drug Y",
        "status": "auto_created",
        "drugId": "uuid-here"
      },
      { "drugName": "???", "status": "failed", "error": "Missing drug_name" }
    ]
  },
  "meta": { "timestamp": "2026-06-19T10:00:00.000Z" }
}
```

**Response — ملف كبير (> 200 صف) — معالجة في الخلفية (queue):**

```json
{
  "data": {
    "jobId": "bull-job-id-string",
    "queued": true,
    "rowCount": 350
  },
  "meta": { "timestamp": "2026-06-19T10:00:00.000Z" }
}
```

---

### Endpoint 2 — متابعة حالة الـ Job (للملفات الكبيرة فقط)

```
GET /api/v1/pharmacy/inventory/import/:jobId
Authorization: Bearer <pharmacy_jwt>
```

**Response — أثناء المعالجة:**

```json
{
  "data": {
    "jobId": "bull-job-id-string",
    "state": "active",
    "progress": 10,
    "result": null
  },
  "meta": { "timestamp": "..." }
}
```

**Response — بعد الانتهاء:**

```json
{
  "data": {
    "jobId": "bull-job-id-string",
    "state": "completed",
    "progress": 100,
    "result": {
      "matched": 200,
      "autoCreated": 100,
      "failed": 50,
      "total": 350,
      "rows": [ ... ]
    }
  },
  "meta": { "timestamp": "..." }
}
```

**قيم الـ `state`:** `waiting` | `active` | `completed` | `failed`

---

## 3. ماذا يقبل الـ Backend؟

| الشرط               | التفاصيل                                |
| ------------------- | --------------------------------------- |
| أنواع الملفات       | `.xlsx` و `.xls` فقط — أي نوع آخر → 400 |
| الحجم الأقصى        | 10MB — أكبر من كده → 400                |
| الحد بين sync/async | 200 صف — أكثر من كده يروح لـ queue      |
| أعمدة الملف         | لا يهم اسمها — AI يعمل mapping تلقائي   |
| لغة أعمدة الملف     | عربي أو إنجليزي أو مختلط — AI يفهم الكل |

---

## 4. الأعمدة المتوقعة في ملف الـ Excel

الملف لازم يحتوي على الأعمدة التالية (بأي اسم، AI بيعمل mapping):

| الحقل الحقيقي                | أمثلة لأسماء أعمدة مقبولة                       |
| ---------------------------- | ----------------------------------------------- |
| `drug_name` (مطلوب)          | "Drug Name"، "اسم الدواء"، "Medicine"، "الدواء" |
| `quantity` (مطلوب)           | "Qty"، "Quantity"، "الكمية"، "العدد"            |
| `selling_price` (مطلوب)      | "Price"، "السعر"، "Selling Price"، "سعر البيع"  |
| `expiry_date` (اختياري)      | "Expiry"، "تاريخ الانتهاء"، "Exp Date"          |
| `batch_number` (اختياري)     | "Batch"، "Lot"، "رقم الدفعة"                    |
| `discount_percent` (اختياري) | "Discount"، "الخصم"، "%"                        |

**ملاحظات:**

- لو `quantity` = 0 أو `selling_price` = 0 أو ناقصين → الصف يفشل
- لو `drug_name` ناقص → الصف يفشل
- باقي الحقول لو ناقصة → `null` أو `0` للـ discount

---

## 5. ماذا يحدث بعد الرفع؟

### للصف اللي status = `matched`:

- الدواء موجود في قاعدة البيانات
- تم إضافة صف جديد في جدول `inventory` مرتبط بالدواء الموجود

### للصف اللي status = `auto_created`:

- الدواء مش موجود في قاعدة البيانات
- الـ AI أنشأ سجل دواء جديد تلقائياً في جدول `drugs`
- تم إضافة صف جديد في جدول `inventory` مرتبط بالدواء الجديد

### للصف اللي status = `failed`:

- في مشكلة في البيانات (drug_name ناقص، quantity = 0، خطأ من DB، إلخ)
- الصف اتخطى وعملية الصفوف التانية كملت طبيعي

---

## 6. الـ Database Tables المتأثرة

### جدول `inventory` — البيانات المضافة بعد الرفع

```
pharmacy_id     → id الصيدلية الحالية (من الـ JWT)
drug_id         → من نتيجة الـ matching
quantity        → من الملف
selling_price   → من الملف
discount_percent → من الملف (أو 0 لو مش موجود)
batch_number    → من الملف (أو null)
expiry_date     → من الملف (أو null)
status          → دايماً 'active'
```

### جدول `drugs` — يُضاف إليه فقط لو `auto_created`

```
brand_name, generic_name, active_ingredient, category,
strength, dosage_form, manufacturer
(كلها بتتولد بواسطة AI)
```

---

## 7. حالات الـ Error من الـ API

```
400 Bad Request  → ملف مش xlsx/xls، أو حجم > 10MB، أو مفيش ملف في الـ request
401 Unauthorized → مفيش token أو token منتهي
403 Forbidden    → مش pharmacy role، أو الصيدلية pending/rejected
404 Not Found    → jobId مش موجود
500 Server Error → خطأ داخلي
```

---

## 8. Flow الـ UI المطلوب

### الخطوة 1 — صفحة Upload

```
┌─────────────────────────────────────────────┐
│          رفع ملف المخزون                     │
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │                                     │  │
│   │   اسحب ملف Excel هنا               │  │
│   │   أو اضغط لاختيار ملف              │  │
│   │                                     │  │
│   │   (.xlsx, .xls — حتى 10MB)         │  │
│   └─────────────────────────────────────┘  │
│                                             │
│              [رفع الملف]                   │
└─────────────────────────────────────────────┘
```

### الخطوة 2a — ملف صغير (≤ 200 صف) — نتيجة فورية

```
┌────────────────────────────────────────────────┐
│  تم معالجة الملف بنجاح ✓                       │
│                                                │
│  ┌──────┬──────────┬────────┐                 │
│  │  ✅ 3  │  ⭐ 2    │  ❌ 1  │                │
│  │matched│auto_crt  │ failed │                 │
│  └──────┴──────────┴────────┘                 │
│                                                │
│  جدول التفاصيل:                               │
│  ┌──────────────┬────────────┬──────────────┐ │
│  │ اسم الدواء  │  الحالة    │   تفاصيل     │ │
│  ├──────────────┼────────────┼──────────────┤ │
│  │ Panadol 500  │ ✅ تطابق  │              │ │
│  │ Brufen 400   │ ✅ تطابق  │              │ │
│  │ Custom Drug  │ ⭐ أنشئ   │              │ │
│  │ ???          │ ❌ فشل    │ missing name │ │
│  └──────────────┴────────────┴──────────────┘ │
└────────────────────────────────────────────────┘
```

### الخطوة 2b — ملف كبير (> 200 صف) — polling

```
┌─────────────────────────────────────────────┐
│  جاري معالجة الملف...                        │
│                                             │
│  [████████░░░░░░░░░░░] 10%                  │
│                                             │
│  350 صف في قائمة الانتظار                  │
└─────────────────────────────────────────────┘
   ↑ الصفحة بتعمل poll كل 3 ثواني على:
   GET /pharmacy/inventory/import/:jobId
   لحد ما state = 'completed'
   وبعدين بتعرض نفس جدول النتائج
```

---

## 9. الـ Hooks المطلوبة في الـ Frontend

### `useImportFile.ts`

```typescript
// useMutation — POST /pharmacy/inventory/import
// Input: FormData مع ملف الـ Excel
// Output: ImportResult (لو sync) أو { jobId, queued, rowCount } (لو async)

const { mutate, isPending, data, isError, error } = useMutation({
  mutationFn: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/pharmacy/inventory/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
});
```

### `useImportStatus.ts`

```typescript
// useQuery — GET /pharmacy/inventory/import/:jobId
// بيشتغل بس لو في jobId (يعني الملف > 200 صف)
// بيعمل polling كل 3 ثواني لحد ما state = 'completed' أو 'failed'

const { data } = useQuery({
  queryKey: ['import-status', jobId],
  queryFn: () => api.get(`/pharmacy/inventory/import/${jobId}`),
  enabled: !!jobId,
  refetchInterval: (query) => {
    const state = query.state.data?.state;
    if (state === 'completed' || state === 'failed') return false;
    return 3000; // poll كل 3 ثواني
  },
});
```

---

## 10. أنواع الـ TypeScript المطلوبة

```typescript
// نتيجة كل صف
interface RowResult {
  drugName: string;
  status: 'matched' | 'auto_created' | 'failed';
  drugId?: string;
  error?: string;
}

// النتيجة الكاملة للاستيراد
interface ImportResult {
  matched: number;
  autoCreated: number;
  failed: number;
  total: number;
  rows: RowResult[];
}

// الرد لما الملف يتحول لـ queue
interface QueuedImport {
  jobId: string;
  queued: true;
  rowCount: number;
}

// حالة الـ Job
interface ImportJobStatus {
  jobId: string;
  state: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  result: ImportResult | null;
}
```

---

## 11. ملاحظات مهمة للـ Frontend Developer

1. **الـ API بيرجع `response.data.data`** — لأن الـ Axios interceptor بيعمل unwrap لـ `{ data, meta }` تلقائياً. يعني الـ hook بياخد الـ `ImportResult` مباشرة.

2. **الـ Content-Type للرفع** — لازم يكون `multipart/form-data` وليس `application/json`. الـ Axios بيتعامل معها تلقائياً لو بعتلها `FormData`.

3. **فرق بين sync و async** — لازم الـ UI يتحقق من وجود `jobId` في الـ response. لو موجود → polling mode، لو مش موجود → النتيجة فورية.

4. **الـ polling refetchInterval** — لازم يوقف لما الـ `state` يبقى `completed` أو `failed` عشان متعملش requests لا نهاية لها.

5. **لو الملف > 200 صف وعمل refresh** — الـ `jobId` بيتضيع من الـ state. الحل: حفظ الـ `jobId` في `sessionStorage` أو `localStorage` مؤقتاً.

6. **الـ progress** — الـ Backend بيبعت 10% في البداية و 100% في النهاية بس. مفيش تحديث تدريجي. الـ UI ممكن يعرض progress bar بس مش هتكون دقيقة — أو progress spinner بسيط.

7. **بعد الانتهاء** — `queryClient.invalidateQueries({ queryKey: ['inventory'] })` عشان جدول المخزون يتحدث تلقائياً.
