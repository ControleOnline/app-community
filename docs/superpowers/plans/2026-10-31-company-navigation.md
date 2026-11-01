# Company navigation implementation plan

> Execute inline using superpowers:executing-plans. No commits or remote tasks.

**Goal:** Move company selection into the sidebar on mobile and desktop and center the branded home link in the content header.
**Architecture:** A local ManagerCompanySelector reuses the people store, company selectability guard, CompanyIdentityAvatar and ManagerBrand. Keep installed npm packages unchanged. ManagerShell owns placement and responsive layout.
**Tech Stack:** React Native / Expo web; existing Jest tests.
**Spec:** Approved design in this chat: one clickable logo/name/chevron block, wrapping company names, separate close button, centered home logo between menu and account controls. Applies to mobile and desktop. Existing desktop breadcrumb and ADMIN switch remain available. Compact sidebar retains an accessible icon selector.

## Constraints
Local checkout only. No tasks, branches, commits, pushes or publication. Preserve unrelated changes and environment files.

## Review focus
Long names wrap; compact sidebar can still select; selection respects disabled companies; modal closes independently of drawer; centered link remains usable with ADMIN controls.

## Implementation
- [x] Add behavior tests for sidebar placement and selection, run to observe failures.
- [x] Implement local selector and optional ManagerBrand subtitle, then move selector into sidebar.
- [x] Center home link in symmetric header columns, retain breadcrumb below on desktop and switcher below for ADMIN.
- [x] Run focused tests and inspect browser at mobile/desktop sizes if local app is reachable.
- [x] Review final diff and record validation. No commits.

## Validation
25 focused tests passed (selector, shell, brand and identity). Diff whitespace check passed. Read-only final review found no actionable issue. Browser localhost exposed a different PDV context, without the user's MANAGER session, so visual confirmation in that session remains pending. No npm packages, environment files or API source were changed.
