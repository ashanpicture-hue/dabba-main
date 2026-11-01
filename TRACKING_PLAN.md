# Dabba Tracking Plan

## Overview
- **Tools:** GA4 (Google Analytics 4), Vercel Analytics
- **Consent:** Cookie banner gates all analytics — nothing fires until user accepts
- **Last updated:** 2 November 2026

## Consent Model
- `localStorage` key: `dabba-consent-v1`
- Single choice: `analytics` (boolean)
- GA4 and Vercel Analytics both wait for `choice.analytics === true`
- Declining means no data is sent to any analytics provider

## Events

| Event Name | Description | Properties | Trigger |
|------------|-------------|------------|---------|
| `page_view` | Page loaded | `page_location`, `page_path`, `page_title` | Every route change |
| `cta_clicked` | CTA button clicked | `button_text`, `location` | CTA click |
| `form_submitted` | Form submitted | `form_type`, `form_location` | Form submit |
| `signup_completed` | Baker signs up | `method`, `source` | Signup success |
| `shop_created` | Baker creates shop | `slug`, `city` | Shop setup complete |
| `order_placed` | Customer places order | `slug`, `fulfilment`, `deposit_pct` | Order confirmation |
| `custom_request_sent` | Customer sends custom cake request | `slug`, `occasion` | Request submitted |
| `order_tracked` | Customer views order status | `code` | Order status page load |
| `payment_proof_uploaded` | Customer uploads payment screenshot | `slug` | Proof upload |
| `menu_item_added` | Item added to cart | `item_id`, `item_name`, `price` | Add to cart |
| `date_selected` | Customer picks delivery/pickup date | `slug`, `date` | Date picker selection |

## Custom Dimensions

| Name | Scope | Parameter |
|------|-------|-----------|
| `user_type` | User | `baker`, `customer`, `visitor` |
| `plan_type` | User | `starter`, `baker`, `bakery` |
| `city` | User | `karachi`, `lahore`, etc. |

## Conversions

| Conversion | Event | Counting |
|------------|-------|----------|
| Baker signup | `signup_completed` | Once per session |
| Shop created | `shop_created` | Once per session |
| Order placed | `order_placed` | Every time |
| Custom request | `custom_request_sent` | Every time |

## Privacy
- No PII in analytics properties (no names, phone numbers, addresses)
- IP anonymization enabled in GA4
- Data retention: 14 months (GA4 default)
- User can decline via cookie banner; no data sent
- User can change choice via "Keep my current choice" button in banner

## Implementation Notes
- GA4 measurement ID: `G-XXXXXXXXXX` (replace in `src/main.jsx`)
- Page views sent manually on route changes (SPA)
- All events gated behind `choice.analytics`
- Vercel Analytics also gated behind same consent
