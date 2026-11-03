# Modify Club — starter website

## Included
- Responsive Black + Purple membership landing page
- Membership request form preview
- Initial Supabase SQL schema

## Important
This is a front-end starter, not a live payment service. The form does not save data, process payments, send reminders or manage WhatsApp groups yet.

## Publish with GitHub Pages
1. Create a GitHub repository named `modify-club`.
2. Upload `index.html`, `styles.css`, `app.js` and the `supabase` folder.
3. Open repository Settings → Pages.
4. Choose Deploy from a branch, select `main` and `/ (root)`, then Save.

## Backend still required
Create a Supabase project, review/run `supabase/schema.sql`, configure authentication, and implement trusted server-side admin approval and scheduled reminders. Keep secret keys out of browser code and public GitHub files.

JazzCash/Easypaisa merchant API access and bank verification require suitable onboarding or manual admin verification. After approval, the member dashboard can reveal a WhatsApp invite link; the member must tap Join. A link does not silently add someone to a group. Automatic group management depends on official WhatsApp API support and account eligibility.
