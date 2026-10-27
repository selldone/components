# Friend invitations

`SInviteFriends` owns the existing authenticated referral email check and send flow. The modern shop dashboard embeds its form directly into its existing dialog with `modern embedded`; it does not open another bottom sheet or require an Invite activator. Other callers retain the native activator and bottom sheet. Close emits to the dashboard, which keeps its existing monthly dismissal preference.

The same form retains up to six email/name rows, optional names, native email rules, referral benefits, copy/social sharing and the invitation report. Empty or invalid batches and duplicate clicks cannot submit. A pending advisory email check is cancelled on replacement, close or unmount; a changed email ignores its stale response. Checks never replace the server's authentication, shop authorization, duplicate handling or limits. The SDK exposes the existing `/invite/check` builder beside `/invite/send`.

The response count describes invitations queued for the native job, not guaranteed delivery. A complete accepted batch resets the form; zero or partial acceptance retains input with an explicit status. Backend errors keep the form recoverable. No request is made on mount, and the dashboard's outer dialog owns focus, Escape and scrolling. Copy, typography and scoped styles follow the approved Refined treatment; narrow layouts stack the existing fields.

`SInviteFriends.test.mjs` exercises the real SFC script/template with local API and UI fixtures, including inline/legacy presentation, EN/FA copy, validation, payloads, success/error recovery and cancelled checks. Do not send real invitations as part of visual QA.
