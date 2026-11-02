# Service configuration

The modern product workspace labels the SERVICE `#outputs` step **Service configuration**. Virtual products retain their existing Outputs form. `BProductServiceManage` opts into the modern presentation through `modern`; legacy callers retain their original presentation.

## Native models

| Model | Settings |
| --- | --- |
| On-demand | Weekly preferred hours and per-order tasks |
| Booking | Date range, check-in/out times, blocked dates and per-order tasks |
| Appointment | Weekly preferred hours, optionally a dated request in an explicit time zone |
| Rental | Date range, pickup/return times and blocked dates |
| Service subscription | One purchased service with a recorded duration; no recurring billing |
| Usage credit | Initial units consumed by the merchant's authorized integration |
| Custom workflow | Per-order task checklist |

Complex staff calendars, capacity locking, reminders and calendar sync require the merchant's own application logic. The guide links existing service availability and authorized metadata workspaces; it does not introduce a scheduling engine or expose private metadata.

## Editing and saving

- Switching models retains each model's local draft. A legacy subscription's numeric `outputs.days` remains its duration when switching away and back; saving canonicalizes it to `outputs.subscription`.
- General-edit saves stay on the section. Guided creation retains its existing next-step flow. The child exposes `prepareSave`, `hasUnsavedChanges`, `markSaved` and `discardChanges` to the native product save boundary.
- Only a successful product save establishes a new snapshot. Busy and inherited-source states prevent edits. Service inventory/availability uses its existing separate save boundary.
- The customer preview renders the real `SProductServiceForm` with `basket: null`; trying its choices makes no cart request and creates no order.

## Calendar and request contract

`UTimeWeekPicker` keeps the existing weekday-name map and native integer hours **1–24**. Hour **24 means 00:00 on the selected civil date**, not midnight on the next day. The modern controls order/display midnight accordingly; legacy callers are unchanged.

`UServiceDateAvailability` uses ISO `YYYY-MM-DD` civil dates internally and real Gregorian or Persian month navigation through `Intl`. Its model contains **blocked** dates. Merchant range selection only stages dates; explicit **Block dates** / **Make available** applies the change. Customer mode emits selection only, disallows unavailable days and rejects a range crossing a blocked day. It preserves keyboard navigation, RTL order, theme-derived colors and touch targets.

An explicit `outputs.timezone` enables a dated appointment request: `preferences.appointment = { date, hour }`. The server validates it against the weekly schedule and blocked dates, rejects past and ambiguous/nonexistent DST hours, and snapshots its trusted time zone. Unchanged requests preserve that snapshot. Legacy configurations without a zone keep `preferences.days`. A request does not reserve staff capacity or set `reserved_at`; the merchant's existing confirmation UI remains responsible for confirmation.

Booking/rental draft ranges may be incomplete; checkout requires a valid future ordered range. Backend pricing uses its forward day count, and clearing a range restores the base multiplier. See `Backend/app/Storefront/Product/service/README.md` in the application repository for the complete backend boundary contract.

## Focused verification

From the application repository root:

```powershell
node --test '@selldone/components-vue/backoffice/product/service/manage/BProductServiceManage.test.mjs' '@selldone/components-vue/backoffice/product/add/full/BProductAddFull.test.mjs' '@selldone/components-vue/ui/date/service-availability/service-controls.test.mjs' '@selldone/components-vue/storefront/product/service/service-appointment.test.mjs'
php Backend/vendor/bin/phpunit --no-configuration --bootstrap Backend/vendor/autoload.php Backend/tests/Unit/Storefront/Product/ServiceConfigurationTest.php
```

These local source/DOM tests do not boot the database or make live requests. Browser visual verification additionally needs the user's existing HMR session at `http://localhost:9000`.
