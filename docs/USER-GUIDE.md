# Shelton Tool-Hire Review Portal — User Guide

A walk-through of the Review Portal for every type of user. Screenshots are taken
from the live application and grouped by role, so you can follow along with what you
actually see on screen.

> **Live app:** the portal is served from the deployed frontend; the equipment,
> reviews, and bookings shown here come from the live backend API.

---

## Who can do what (roles at a glance)

| Role | Signs in? | What they can do |
|------|-----------|------------------|
| **Guest** (public visitor) | No | Browse equipment, read approved reviews, use the pricing calculator, submit a booking enquiry, register/log in |
| **Customer** | Yes | Everything a guest can, **plus** write reviews & comments, see their own reviews and moderation status, change their password |
| **Moderator** | Yes (staff) | Approve/reject reviews & comments, post company responses, view and manage all bookings |
| **Admin** | Yes (staff) | Everything a moderator can, **plus** manage tools (incl. images), manage categories, and view the dashboard stats |

### Test accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer.test@reviewportal.local` | `Customer123!` |
| Moderator | `moderator.test@reviewportal.local` | `Moderator123!` |
| Admin | `admin.test@reviewportal.local` | `Admin123!` |

---

## 1. Guest (public visitor)

Anyone can browse the catalogue and read reviews without an account.

### 1.1 Home page

The landing page introduces Shelton Tool-Hire with quick links to equipment,
services, pricing, and reviews.

![Guest home page](screenshots/guest-home.png)

### 1.2 Equipment catalogue

Browse all available equipment with images, categories, and pricing. Use the
search and category filters to narrow down.

![Equipment catalogue](screenshots/guest-equipment.png)

### 1.3 Equipment detail

Open any item to see its full description, hourly/daily/weekly rates, photos, the
overall star rating, and approved customer reviews.

![Equipment detail page](screenshots/guest-equipment-detail.png)

### 1.4 Reviews

A portal-wide feed of approved customer reviews. You can filter by category and
sort by **Most recent** or **Most helpful**.

![Reviews page](screenshots/guest-reviews.png)

### 1.5 Pricing calculator

Estimate a rental cost by choosing an item, rental period (hourly/daily/weekly),
quantity, and duration.

![Pricing calculator](screenshots/guest-calculator.png)

### 1.6 Pricing, Services & Contact

Informational pages describing rates, the services offered, and how to get in touch.

| Pricing | Services | Contact |
|---|---|---|
| ![Pricing](screenshots/guest-pricing.png) | ![Services](screenshots/guest-services.png) | ![Contact](screenshots/guest-contact.png) |

### 1.7 Sign in / Register

To leave reviews or manage bookings, create an account or sign in. Authentication
is handled server-side; your session is stored in a secure, http-only cookie.

| Sign in | Register |
|---|---|
| ![Login](screenshots/guest-login.png) | ![Register](screenshots/guest-register.png) |

---

## 2. Customer

After signing in as a customer, the header shows your name and unlocks the account
area, reviewing, and bookings.

### 2.1 Signed-in home

![Customer home (signed in)](screenshots/customer-home.png)

### 2.2 Writing a review on an item

On any equipment detail page you can submit a review. Reviews use **five rating
dimensions** (Equipment, Customer Service, Technical Support, After-Sales, Value
for Money) which are averaged into an overall score.

> Your review is **not shown publicly straight away** — it stays *Pending* until a
> moderator approves it.

![Customer equipment detail with review options](screenshots/customer-equipment-detail.png)

### 2.3 My reviews (account area)

Track the moderation status of everything you've submitted (Pending / Approved /
Rejected) and see any company responses attached to your reviews.

![My reviews](screenshots/customer-account-reviews.png)

### 2.4 Browsing the reviews feed

The same reviews feed as guests, available while signed in.

![Customer reviews feed](screenshots/customer-reviews.png)

### 2.5 Change password

Update your password from the account area.

![Change password](screenshots/customer-change-password.png)

---

## 3. Moderator

Moderators sign in as staff and get a **Staff Console** focused on content quality
and bookings. They do **not** manage tools or categories (that's Admin-only).

### 3.1 Moderation queue

Review the queue of pending reviews and comments, then **approve** (publish) or
**reject** them.

![Moderation queue](screenshots/moderator-moderation.png)

### 3.2 Bookings

View all booking enquiries and update their status
(Pending → Confirmed / Declined / Completed).

![Bookings management](screenshots/moderator-bookings.png)

---

## 4. Admin

Admins can do everything a moderator can, **plus** run the dashboard and manage the
catalogue (tools, images, categories).

### 4.1 Dashboard

A snapshot of equipment health and activity: active/inactive tools, pending
moderation, reviews this month, top-rated and most-reviewed tools, and quick actions.

![Admin dashboard](screenshots/admin-dashboard.png)

### 4.2 Manage tools (catalogue)

Create, edit, activate/deactivate tools and manage their images. Each row shows the
tool's photo, category, pricing, status, and per-row actions.

![Manage tools](screenshots/admin-tools.png)

### 4.3 Manage categories

Create, edit, and delete equipment categories. Each category carries a name,
description, and image.

![Manage categories](screenshots/admin-categories.png)

### 4.4 Bookings (admin)

Admins share the same booking management view as moderators.

![Admin bookings](screenshots/admin-bookings.png)

### 4.5 Moderation (admin)

Admins can also work the moderation queue.

![Admin moderation](screenshots/admin-moderation.png)

---

## End-to-end flow (how the roles fit together)

1. **Admin** creates a category and a tool, and uploads its image.
2. **Guest** finds the tool, checks pricing with the calculator, and submits a booking enquiry.
3. **Customer** signs in, books the tool, and writes a 5-dimension review.
4. The customer's review is held as **Pending**.
5. **Moderator** approves the review and (optionally) posts a company response.
6. The approved review now appears publicly on the tool page and in the reviews feed.
7. **Moderator/Admin** confirms the booking and later marks it completed.

---

*Screenshots in this guide live in [`docs/screenshots/`](screenshots/). To
regenerate them, re-run the capture script (`capture-screenshots.mjs`) against the
live app while signed in with the test accounts above.*
