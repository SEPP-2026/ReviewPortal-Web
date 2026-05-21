# API & Client Validation Contract Alignment Specification

This technical specification details the **5 critical functional validation contract mismatches** and **1 asset security directive block** identified during our static comparative audit between the **ReviewPortal-Web** client and the **ReviewPortal-API** backend. 

Implementing the resolutions in this document will eliminate silent submit failures, avoid unhelpful `400 Bad Request` exceptions, align text minimum lengths, and resolve broken browser images.

---

## 🗺️ Traceability & Validation Matrix

The following matrix maps the backend ASP.NET Core **FluentValidation** rules directly to the corresponding Next.js **React components** and inputs:

| Endpoint Under Test | C# Validator Class | Enforced Rules (Backend) | Frontend Component File | Current Client-Side Behavior | Resolution Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`PUT /api/admin/moderation/reviews/{id}`** | `ModerateReviewRequestValidator` | `RejectionReason` is strictly required (`HasText`) when `Approved == false` | [`ModerationQueue.tsx`](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/admin/ModerationQueue.tsx) | Marked as `(optional)`; submits `undefined` if empty. | Change placeholder to `(required)`, disable submit button if empty. |
| **`POST /api/auth/register`** | `RegisterRequestValidator` | Password $\ge 8$ characters, $\ge 1$ uppercase letter, $\ge 1$ number | [`register/page.tsx`](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/app/register/page.tsx) | Standard `required` input; zero strength validation. | Validate password strength client-side; display field errors. |
| **`POST /api/auth/change-password`** | `ChangePasswordRequestValidator` | Password $\ge 8$ characters, $\ge 1$ uppercase, $\ge 1$ number, `New != Current` | [`ChangePasswordForm.tsx`](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/account/ChangePasswordForm.tsx) | Checks only `minLength={8}`; no pattern complexity check. | Add regex pattern matching and inequality checks. |
| **`POST /api/auth/reset-password`** | `ResetPasswordRequestValidator` | Password $\ge 8$ characters, $\ge 1$ uppercase, $\ge 1$ number | [`reset-password/page.tsx`](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/app/reset-password/page.tsx) | Checks only `minLength={8}`; no pattern complexity check. | Add regex pattern matching client-side. |
| **`POST /api/tools/{toolId}/reviews`** | `CreateReviewRequestValidator` | Review text $\ge 20$ characters, $\le 2000$ characters | [`ReviewSubmitForm.tsx`](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/equipment/ReviewSubmitForm.tsx) | Enforces `.length < 10` characters. | Increase validation threshold to `< 20` characters. |
| **`POST /api/reviews/{reviewId}/comments`** | `CreateCommentRequestValidator` | Comment text $\ge 10$ characters, $\le 1000$ characters | [`ReviewItem.tsx`](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/equipment/ReviewItem.tsx) | Enforces `.length < 3` characters. | Increase validation threshold to `< 10` characters. |
| **`PUT /api/admin/categories/{id}`** | `UpdateCategoryRequestValidator` | Explicitly accepts description and imageUrl nullable bindings | [`AdminCategoriesManager.tsx`](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/admin/AdminCategoriesManager.tsx) | Sends `undefined` for empty fields, omitting keys. | Send `null` instead of `undefined` to clear attributes cleanly in ASP.NET. |

---

## 🛠️ Step-by-Step Implementation Guide

Follow these exact code modifications to align frontend form inputs with API validator constraints.

### Section 1: Moderation Form Rejection Rules

#### 📝 [MODIFY] [ModerationQueue.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/admin/ModerationQueue.tsx)
Update the rejection text input placeholder and disable the **Confirm reject** button if no reason has been supplied.

```diff
@@ -428,10 +428,10 @@
             <textarea
               value={rejectionReason}
               onChange={(event) => setRejectionReason(event.target.value)}
               rows={4}
-              placeholder="Reason for rejection (optional)"
+              placeholder="Reason for rejection (required)"
               className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
             />
 
             <div className="mt-5 flex items-center justify-end gap-3">
               <button
@@ -446,10 +446,10 @@
               <button
                 type="button"
                 onClick={handleConfirmReject}
                 disabled={
                   rejectingTarget
-                    ? isBusyOn(rejectingTarget.kind, rejectingTarget.id)
-                    : false
+                    ? isBusyOn(rejectingTarget.kind, rejectingTarget.id) || !rejectionReason.trim()
+                    : true
                 }
                 className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
               >
```

---

### Section 2: Registration & Password Management Logic

#### 📝 [MODIFY] [app/register/page.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/app/register/page.tsx)
Prevent registering with weak passwords that will trigger backend registration rejects.

```diff
@@ -19,6 +19,14 @@
     setIsSubmitting(true);
     setErrorMessage(null);
 
+    const hasUpper = /[A-Z]/.test(password);
+    const hasDigit = /[0-9]/.test(password);
+    if (password.length < 8 || !hasUpper || !hasDigit) {
+      setErrorMessage("Password must be at least 8 characters, and contain at least one uppercase letter and one number.");
+      setIsSubmitting(false);
+      return;
+    }
+
     try {
       const response = await fetch("/api/auth/register", {
```

#### 📝 [MODIFY] [ChangePasswordForm.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/account/ChangePasswordForm.tsx)
Ensure complex validation logic is tested prior to triggering password change API requests.

```diff
@@ -20,6 +20,18 @@
       setErrorMessage("New passwords do not match.");
       return;
     }
 
+    const hasUpper = /[A-Z]/.test(newPassword);
+    const hasDigit = /[0-9]/.test(newPassword);
+    if (newPassword.length < 8 || !hasUpper || !hasDigit) {
+      setErrorMessage("New password must be at least 8 characters, and contain at least one uppercase letter and one number.");
+      return;
+    }
+
+    if (newPassword === currentPassword) {
+      setErrorMessage("New password must be different from the current password.");
+      return;
+    }
+
     setIsSubmitting(true);
```

#### 📝 [MODIFY] [app/reset-password/page.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/app/reset-password/page.tsx)
Add client password checks on the user recovery reset screen.

```diff
@@ -31,6 +31,14 @@
       setErrorMessage("Passwords do not match.");
       return;
     }
 
+    const hasUpper = /[A-Z]/.test(newPassword);
+    const hasDigit = /[0-9]/.test(newPassword);
+    if (newPassword.length < 8 || !hasUpper || !hasDigit) {
+      setErrorMessage("New password must be at least 8 characters, and contain at least one uppercase letter and one number.");
+      return;
+    }
+
     setIsSubmitting(true);
```

---

### Section 3: Review & Comment Input Length Expansion

#### 📝 [MODIFY] [ReviewSubmitForm.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/equipment/ReviewSubmitForm.tsx)
Align customer-facing review submissions to match backend's **20-character minimum**.

```diff
@@ -70,7 +70,7 @@
     event.preventDefault();
     setErrorMessage(null);
 
-    if (form.reviewText.trim().length < 10) {
-      setErrorMessage("Review text must be at least 10 characters.");
+    if (form.reviewText.trim().length < 20) {
+      setErrorMessage("Review text must be at least 20 characters.");
       return;
     }
```

#### 📝 [MODIFY] [ReviewItem.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/equipment/ReviewItem.tsx)
Align commenter review replies to match backend's **10-character minimum**.

```diff
@@ -50,7 +50,7 @@
     setCommentError(null);
     setSuccessMessage(null);
 
-    if (commentText.trim().length < 3 || commenterName.trim().length < 2) {
-      setCommentError("Please provide your name and a comment.");
+    if (commentText.trim().length < 10 || commenterName.trim().length < 2) {
+      setCommentError("Comment text must be at least 10 characters and your name at least 2 characters.");
       return;
     }
```

---

### Section 4: Category Data Persistence Alignment

#### 📝 [MODIFY] [AdminCategoriesManager.tsx](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/components/admin/AdminCategoriesManager.tsx)
Replace `|| undefined` keys with `|| null` so they stringify as active null references in C# records.

```diff
@@ -88,4 +88,4 @@
       const payload = {
         name: formState.name.trim(),
-        description: formState.description.trim() || undefined,
-        imageUrl: formState.imageUrl.trim() || undefined,
+        description: formState.description.trim() || null,
+        imageUrl: formState.imageUrl.trim() || null,
       };
```

---

### Section 5: Dynamic Media & security Policies (CSP)

#### 📝 [MODIFY] [next.config.ts](file:///c:/Users/user/source/repos/SEPPModule/ReviewPortal-Web/next.config.ts)
Add Dicebear dynamic avatars and standard CDN references to the Content Security Policy header.

```diff
@@ -8,7 +8,7 @@
   "default-src 'self'",
   "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
   "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
-  "img-src 'self' data: blob: https://*.blob.core.windows.net https://images.unsplash.com",
+  "img-src 'self' data: blob: https://*.blob.core.windows.net https://images.unsplash.com https://api.dicebear.com https://*.azureedge.net",
   "font-src 'self' data: https://fonts.gstatic.com",
   "connect-src 'self' https:",
   "frame-ancestors 'none'",
```

---

## 🧪 Rigorous Verification Plan

To verify that these alignment fixes are successfully integrated, execute the following manual tests on each route:

### Test Case 1: Empty Moderation Rejection Verification
1. Log in as an administrator.
2. Navigate to the `/admin/moderation` queue.
3. Locate a pending review and click **Reject**.
4. Confirm the text field placeholder reads `Reason for rejection (required)`.
5. Confirm that the **Confirm reject** CTA button remains **disabled** until at least 1 character is typed.
6. Type a reason and submit; verify the item is successfully rejected.

### Test Case 2: Weak Registration Password Verification
1. Navigate to `/register`.
2. Input a valid name and email address.
3. Input a weak password (e.g. `12345` or `password`).
4. Press **Create account**.
5. Verify the client-side validation error message banner is displayed immediately without sending an HTTP call to the server.
6. Enter `SecurePass1!` and confirm the form submits cleanly.

### Test Case 3: Review Text Boundary Validation
1. Navigate to an equipment item detail page `/equipment/1`.
2. Scroll to the reviews section and type a short review (e.g., `"Decent tool"` - 11 characters).
3. Try to submit.
4. Verify the client-side message banner displays: `"Review text must be at least 20 characters."` and blocks API call execution.
