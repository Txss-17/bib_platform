

# LINKSY User Site Architecture - Implementation Plan

## Overview

This plan transforms the current seller dashboard into a complete LINKSY user platform with 10 integrated modules, a comprehensive database schema, and an auto-generated storefront system for end customers.

---

## Phase 1: Database Schema Foundation

### New Tables to Create

**1. boutiques** - Seller's online stores
- id, user_id, name, slug, category, description, status (published/draft), logo_url, theme_settings, created_at, updated_at
- RLS: Users can only manage their own boutiques

**2. supplier_products** - LINKSY-validated products catalog
- id, name, description, image_url, moq, market, base_price, max_margin_percent, rotation_indicator (green/yellow/orange/red), category, performance_history, is_active, created_at

**3. products** - Seller's boutique products (from supplier catalog)
- id, boutique_id, supplier_product_id, public_price, applied_margin, status (active/paused), cumulative_sales, created_at, updated_at
- RLS: Users can only manage products in their boutiques

**4. orders** - Simplified order tracking
- id, order_number (LKS26-XXXXXX format), product_id, boutique_id, customer_name, customer_email, market, amount, logistics_status, created_at
- RLS: Users can view orders for their boutiques

**5. payments** - Revenue and payout tracking
- id, user_id, boutique_id, amount, status (pending/completed), payout_date, period_start, period_end, created_at

**6. moq_reservations** - MOQ booking system
- id, user_id, supplier_product_id, quantity, status, reserved_at, expires_at

---

## Phase 2: Navigation Restructure

### Updated Sidebar Navigation (as per specification)

```text
Main Navigation:
1. Dashboard (home icon)
2. Ventes (sales chart icon)
3. Commandes (shopping cart icon)
4. Produits (package icon)
5. Produits fournisseurs (truck/warehouse icon)
6. Paiements (credit card icon)
7. SEO & Analytics (search/chart icon)
8. Boutiques (store icon)

Bottom Navigation:
- Parametres (settings)
- Aide & Support
```

### Routes Structure

```text
/dashboard - Main dashboard with KPIs
/dashboard/ventes - Sales analytics
/dashboard/commandes - Order management
/dashboard/produits - My products
/dashboard/produits-fournisseurs - Supplier products catalog
/dashboard/paiements - Payment history
/dashboard/seo-analytics - SEO & Analytics
/dashboard/boutiques - Boutique management
/dashboard/boutiques/create - Create boutique wizard
/dashboard/parametres - Settings
```

---

## Phase 3: Module Implementation

### Module 1: Dashboard (Home)

**KPI Cards (simplified, 5-second comprehension):**
- Commandes (total orders count + trend)
- Produits actifs (active products count)
- Revenus (total revenue in EUR)
- Boutiques actives (active boutiques count)

**Primary CTA:**
- "Creer ma boutique" button if no boutiques exist
- "Gerer mes boutiques" button if boutiques exist

**Layout:** Clean grid with 4 stat cards, prominent CTA, quick actions

---

### Module 2: Ventes (Sales)

**Key Indicators:**
- Chiffre d'affaires (total revenue)
- Nombre de ventes (sales count)
- Panier moyen (average basket)
- Taux de conversion (conversion rate)

**Charts:**
- Monthly evolution (line/area chart)
- Top performing products (bar chart)
- Low rotation products (warning list)

---

### Module 3: Commandes (Orders)

**Simplified View Table:**
- Order number (LKS26-XXXXXX format)
- Product name
- Logistics status (badge)
- Customer name
- Market
- Date

**Key Message:** "La logistique est transparente - vous vendez, LINKSY opere."

---

### Module 4: Produits (My Products)

**Product List with:**
- Status toggle (active/paused)
- Public price
- Applied margin (%)
- Cumulative sales
- Logical stock (via MOQ)

**Actions:**
- Edit price (within allowed margin cap)
- Pause/Resume
- Delete
- Duplicate

---

### Module 5: Produits Fournisseurs (Supplier Products)

**This is the LINKSY differentiator - the curated product catalog**

**Per Product Display:**
- Image
- Name
- Short description
- Available MOQ
- Market
- Final price (logistics included)
- Authorized margin cap (%)
- Rotation indicator (color-coded)

**Actions:**
- Reserve MOQ
- Add to boutique
- View performance history
- Simulate margin

**Key Message Banner:** "Tous les produits proposes ici sont valides par LINKSY et prets a etre vendus."

---

### Module 6: Paiements (Payments)

**User View:**
- Cumulated revenues
- Pending revenues
- Payout history (table)
- Detail by boutique (breakdown)

**Key Message:** "Les frais logistiques sont deja integres dans vos prix. Aucun ajustement a prevoir."

---

### Module 7: SEO & Analytics

**Features:**
- Automatic SEO analysis
- AI-generated title/description suggestions
- Page performance metrics
- Google visibility score

**Integration Points:**
- Google SEO connection (future)
- AI marketing templates

---

### Module 8: Boutiques

**Boutique Cards:**
- Name
- Category
- Status (published/draft badge)
- LINKSY URL (linksy.com/boutique-slug)
- Actions: Manage / Open / Delete

**Central CTA:** "Creer ma boutique" button

---

### Module 9: Boutique Creation Wizard

**Multi-step Flow:**
1. Basic Info (name, category, description)
2. Visual Identity (logo upload, color scheme)
3. Add Products (from supplier catalog)
4. Preview & Publish

---

### Module 10: Generated Storefront (Customer-Facing)

**Auto-generated Pages:**
- Homepage (hero, featured products, categories)
- Category pages
- Product detail pages
- Cart
- Checkout
- Legal pages (policies, mentions)

**Design Rules:**
- Category-adapted theme (Home, Beauty, Tech, etc.)
- Smooth section transitions
- Best performers highlighted
- Delivery included in price (never shown separately)

---

## Technical Details

### File Structure

```text
src/
  pages/
    Dashboard.tsx (updated)
    dashboard/
      Ventes.tsx
      Commandes.tsx
      Produits.tsx
      ProduitsFournisseurs.tsx
      Paiements.tsx
      SEOAnalytics.tsx
      Boutiques.tsx
      BoutiqueCreate.tsx
      Parametres.tsx
  
  components/
    dashboard/
      DashboardSidebar.tsx (updated)
      DashboardLayout.tsx (new - shared layout)
      KPICards.tsx (simplified stats)
      
    ventes/
      SalesOverview.tsx
      TopProducts.tsx
      LowRotationAlert.tsx
      
    commandes/
      OrdersTable.tsx
      OrderStatusBadge.tsx
      
    produits/
      ProductList.tsx
      ProductActions.tsx
      PriceEditor.tsx
      
    produits-fournisseurs/
      SupplierProductCard.tsx
      MOQReservation.tsx
      MarginSimulator.tsx
      RotationIndicator.tsx
      
    paiements/
      RevenueOverview.tsx
      PayoutHistory.tsx
      BoutiqueBreakdown.tsx
      
    seo/
      SEOAnalysis.tsx
      AIsuggestions.tsx
      
    boutiques/
      BoutiqueCard.tsx
      BoutiqueWizard.tsx
      
    storefront/
      StorefrontLayout.tsx
      ProductDetailPage.tsx
      CartPage.tsx
      CheckoutPage.tsx
```

### Database Migration Summary

```text
1. Create boutiques table with RLS
2. Create supplier_products table (admin-managed)
3. Create products table linking boutiques to supplier products
4. Create orders table with LINKSY order numbering
5. Create payments table for payout tracking
6. Create moq_reservations table
7. Enable realtime for orders and notifications
```

### Key UX Principles

1. **5-second comprehension** - All KPIs immediately understandable
2. **No technical jargon** - User-friendly language throughout
3. **Transparency** - Logistics handled by LINKSY, clearly communicated
4. **Trust signals** - All products pre-validated by LINKSY
5. **Margin clarity** - Price caps and margins always visible

---

## Implementation Order

1. **Database schema** - Create all tables with RLS policies
2. **Navigation update** - Restructure sidebar with new routes
3. **Dashboard redesign** - Simplified KPIs + dynamic CTA
4. **Core modules** - Produits Fournisseurs, Produits, Commandes
5. **Revenue modules** - Ventes, Paiements
6. **Boutique system** - Management + creation wizard
7. **SEO module** - Analytics and AI suggestions
8. **Storefront generation** - Customer-facing pages

