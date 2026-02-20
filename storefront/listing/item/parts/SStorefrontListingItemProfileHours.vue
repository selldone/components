<template>
  <v-card
    v-if="hasAnyData"
    class="sld-prof-hours"
    rounded="xl"
    variant="flat"
  >
    <v-card-text class="pa-4 pa-sm-6">
      <div class="sld-prof-hours__head">
        <div class="d-flex align-center min-w-0">
          <v-icon class="me-2">schedule</v-icon>
          <div class="sld-prof-hours__title">Opening hours</div>
        </div>

        <v-spacer />

        <v-chip
          size="x-small"
          label
          :variant="isOpenNow ? 'flat' : 'tonal'"
          :class="isOpenNow ? 'sld-prof-hours__chip--open' : 'sld-prof-hours__chip--closed'"
        >
          <v-icon start size="16">{{ isOpenNow ? "check_circle" : "do_not_disturb_on" }}</v-icon>
          {{ isOpenNow ? "Open now" : "Closed now" }}
        </v-chip>
      </div>

      <div class="sld-prof-hours__sub">
        <div class="sld-prof-hours__today">
          <span class="sld-prof-hours__today-label">Today</span>
          <span class="sld-prof-hours__today-value">
            {{ todayText }}
          </span>
        </div>

        <div v-if="nextChangeText" class="sld-prof-hours__next">
          {{ nextChangeText }}
        </div>
      </div>

      <v-divider class="my-4" />

      <div class="sld-prof-hours__grid">
        <div
          v-for="d in week"
          :key="d.key"
          :class="['sld-prof-hours__row', { '-today': d.index === todayIndex }]"
        >
          <div class="sld-prof-hours__day">
            {{ d.label }}
          </div>

          <div class="sld-prof-hours__hours">
            <span v-if="d.closed" class="sld-prof-hours__closed">Closed</span>

            <template v-else>
              <span
                v-for="(r, i) in d.ranges"
                :key="`${d.key}_${i}`"
                class="sld-prof-hours__range"
              >
                {{ formatRange(r) }}
                <span v-if="i < d.ranges.length - 1" class="sld-prof-hours__sep">·</span>
              </span>
            </template>
          </div>
        </div>
      </div>

      <v-alert
        v-if="hasRawButUnparsed"
        type="info"
        variant="tonal"
        class="mt-4"
      >
        We couldn't fully parse the opening hours format. Please review the saved data structure.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
type Range = { startMin: number; endMin: number; overnight?: boolean };

type DayRow = {
  key: string;
  index: number; // 0..6 (Mon..Sun)
  label: string;
  ranges: Range[];
  closed: boolean;
};

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default {
  name: "SStorefrontListingItemProfileHours",

  props: {
    /**
     * `opening_hours` can be:
     * - array of day objects
     * - object keyed by mon/tue/... or 0..6
     * - other loose formats (best effort)
     */
    openingHours: { type: [Array, Object], default: null },
  },

  computed: {
    raw(): any {
      return (this as any).openingHours;
    },

    normalized(): DayRow[] {
      const v: any = this.raw;
      const out: DayRow[] = DAY_KEYS.map((k, i) => ({
        key: k,
        index: i,
        label: DAY_LABELS[i],
        ranges: [],
        closed: true,
      }));

      if (!v) return out;

      // Case A: array
      if (Array.isArray(v)) {
        this.applyArrayFormat(out, v);
        return out;
      }

      // Case B: object map
      if (v && typeof v === "object") {
        this.applyObjectFormat(out, v);
        return out;
      }

      return out;
    },

    hasAnyData(): boolean {
      return this.normalized.some((d) => !d.closed);
    },

    hasRawButUnparsed(): boolean {
      // has raw input but ended up empty
      return !!this.raw && !this.hasAnyData;
    },

    week(): DayRow[] {
      return this.normalized;
    },

    todayIndex(): number {
      // JS: 0=Sun..6=Sat => convert to Mon..Sun index
      const js = new Date().getDay(); // 0..6
      return js === 0 ? 6 : js - 1;
    },

    nowMin(): number {
      const n = new Date();
      return n.getHours() * 60 + n.getMinutes();
    },

    isOpenNow(): boolean {
      const today = this.week[this.todayIndex];
      if (!today || today.closed) return false;

      return today.ranges.some((r) => {
        if (!r.overnight) return this.nowMin >= r.startMin && this.nowMin < r.endMin;
        // Overnight: start..24h OR 0..end
        return this.nowMin >= r.startMin || this.nowMin < r.endMin;
      });
    },

    todayText(): string {
      const today = this.week[this.todayIndex];
      if (!today || today.closed) return "Closed";
      return today.ranges.map((r) => this.formatRange(r)).join(" · ");
    },

    nextChangeText(): string {
      // Minimal + helpful:
      // If open: show "Closes at HH:MM"
      // If closed: show "Opens at HH:MM" (today, else next open day)
      const today = this.week[this.todayIndex];

      if (this.isOpenNow && today && !today.closed) {
        const closing = this.findNextClose(today, this.nowMin);
        return closing ? `Closes at ${this.formatTime(closing)}` : "";
      }

      const next = this.findNextOpen(this.todayIndex, this.nowMin);
      if (!next) return "";
      const dayLabel = next.dayOffset === 0 ? "today" : (next.dayOffset === 1 ? "tomorrow" : this.week[next.dayIndex].label);
      return `Opens ${dayLabel} at ${this.formatTime(next.minute)}`;
    },
  },

  methods: {
    // ─────────────────────────────────────────────────────────────
    // Parsing helpers
    // ─────────────────────────────────────────────────────────────

    applyArrayFormat(out: DayRow[], arr: any[]) {
      // accepted item shapes (best-effort):
      // 1) { day: 0..6 or "mon", ranges:[{start:"09:00",end:"17:00"}] }
      // 2) { weekday:"mon", open:"09:00", close:"17:00" }
      // 3) { day_index: ..., periods:[{open:"09:00",close:"17:00"}] }
      arr.forEach((row) => {
        const idx = this.parseDayIndex(row?.day ?? row?.weekday ?? row?.day_index ?? row?.index);
        if (idx === null) return;

        const ranges: Range[] = [];

        const r1 = row?.ranges;
        const r2 = row?.periods;

        if (Array.isArray(r1)) {
          r1.forEach((x: any) => {
            const rr = this.parseRange(x?.start ?? x?.open, x?.end ?? x?.close);
            if (rr) ranges.push(rr);
          });
        } else if (Array.isArray(r2)) {
          r2.forEach((x: any) => {
            const rr = this.parseRange(x?.start ?? x?.open, x?.end ?? x?.close);
            if (rr) ranges.push(rr);
          });
        } else {
          const rr = this.parseRange(row?.start ?? row?.open, row?.end ?? row?.close);
          if (rr) ranges.push(rr);
        }

        this.setDayRanges(out, idx, ranges);
      });
    },

    applyObjectFormat(out: DayRow[], obj: any) {
      // accepted shapes:
      // 1) { mon:[{start,end}], tue:[...], ... }
      // 2) { 0:[{...}], 1:[{...}] } or { "0": ... } (Mon..Sun)
      // 3) { mon:{open,close} } ...
      // 4) { days:{mon:...} }
      const src = obj?.days && typeof obj.days === "object" ? obj.days : obj;

      Object.keys(src || {}).forEach((k) => {
        const idx = this.parseDayIndex(k);
        if (idx === null) return;

        const v = src[k];
        const ranges: Range[] = [];

        if (Array.isArray(v)) {
          v.forEach((x: any) => {
            const rr = this.parseRange(x?.start ?? x?.open, x?.end ?? x?.close);
            if (rr) ranges.push(rr);
          });
        } else if (v && typeof v === "object") {
          // {open,close} or {ranges:[...]}
          if (Array.isArray(v.ranges)) {
            v.ranges.forEach((x: any) => {
              const rr = this.parseRange(x?.start ?? x?.open, x?.end ?? x?.close);
              if (rr) ranges.push(rr);
            });
          } else {
            const rr = this.parseRange(v?.start ?? v?.open, v?.end ?? v?.close);
            if (rr) ranges.push(rr);
          }
        }

        this.setDayRanges(out, idx, ranges);
      });
    },

    parseDayIndex(day: any): number | null {
      if (day === null || day === undefined) return null;

      // numeric (assume Mon..Sun 0..6)
      const n = parseInt(String(day), 10);
      if (Number.isFinite(n) && n >= 0 && n <= 6) return n;

      const s = String(day).trim().toLowerCase();
      const key = s.slice(0, 3);
      const i = DAY_KEYS.indexOf(key);
      return i >= 0 ? i : null;
    },

    parseRange(start: any, end: any): Range | null {
      const a = this.parseTimeToMin(start);
      const b = this.parseTimeToMin(end);

      if (a === null || b === null) return null;

      // Allow overnight (end smaller than start)
      if (b === a) return null;

      if (b < a) return { startMin: a, endMin: b, overnight: true };

      return { startMin: a, endMin: b, overnight: false };
    },

    parseTimeToMin(v: any): number | null {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      if (!s) return null;

      // supports "HH:mm" or "H:mm"
      const m = s.match(/^(\d{1,2})\s*:\s*(\d{2})$/);
      if (!m) return null;

      const hh = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);

      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
      if (hh < 0 || hh > 23) return null;
      if (mm < 0 || mm > 59) return null;

      return hh * 60 + mm;
    },

    setDayRanges(out: DayRow[], idx: number, ranges: Range[]) {
      const day = out[idx];
      if (!day) return;

      const cleaned = (ranges || [])
        .filter(Boolean)
        .map((r) => ({ ...r }))
        .sort((a, b) => a.startMin - b.startMin);

      day.ranges = cleaned;
      day.closed = cleaned.length === 0;
    },

    // ─────────────────────────────────────────────────────────────
    // Rendering helpers
    // ─────────────────────────────────────────────────────────────

    formatTime(min: number): string {
      const h = Math.floor(min / 60);
      const m = min % 60;

      // Minimal + readable (24h)
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      return `${hh}:${mm}`;
    },

    formatRange(r: Range): string {
      const a = this.formatTime(r.startMin);
      const b = this.formatTime(r.endMin);

      if (r.overnight) {
        return `${a} – ${b} (+1)`;
      }
      return `${a} – ${b}`;
    },

    findNextClose(today: DayRow, nowMin: number): number | null {
      // returns closing minute for the current open range
      for (const r of today.ranges) {
        if (!r.overnight) {
          if (nowMin >= r.startMin && nowMin < r.endMin) return r.endMin;
        } else {
          // open if >= start OR < end
          if (nowMin >= r.startMin || nowMin < r.endMin) return r.endMin;
        }
      }
      return null;
    },

    findNextOpen(todayIdx: number, nowMin: number): { dayIndex: number; dayOffset: number; minute: number } | null {
      // 1) try today
      const today = this.week[todayIdx];
      if (today && !today.closed) {
        for (const r of today.ranges) {
          // If closed now, next open is a.startMin when now < startMin
          if (!r.overnight) {
            if (nowMin < r.startMin) return { dayIndex: todayIdx, dayOffset: 0, minute: r.startMin };
          } else {
            // overnight: if now < endMin => it's actually open now (handled earlier),
            // else if now < startMin => opens at startMin today
            if (nowMin < r.startMin) return { dayIndex: todayIdx, dayOffset: 0, minute: r.startMin };
          }
        }
      }

      // 2) find next day with ranges
      for (let off = 1; off <= 7; off++) {
        const idx = (todayIdx + off) % 7;
        const d = this.week[idx];
        if (d && !d.closed && d.ranges.length) {
          return { dayIndex: idx, dayOffset: off, minute: d.ranges[0].startMin };
        }
      }
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
/* Local SCSS variables (unique scope) */
$sld-hours-title: 16px;
$sld-hours-day: 13px;
$sld-hours-text: 13px;

.sld-prof-hours {
  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);

  &__head {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  &__title {
    font-weight: 900;
    font-size: $sld-hours-title;
    line-height: 1.2;
  }

  &__chip--open {
    background: #000 !important;
    color: #fff !important;
  }

  &__chip--closed {
    color: rgba(0, 0, 0, 0.7) !important;
  }

  &__sub {
    margin-top: 10px;
  }

  &__today {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  &__today-label {
    font-weight: 900;
    color: rgba(0, 0, 0, 0.7);
  }

  &__today-value {
    font-weight: 900;
    color: rgba(0, 0, 0, 0.88);
  }

  &__next {
    margin-top: 6px;
    font-size: $sld-hours-text;
    color: rgba(0, 0, 0, 0.6);
  }

  &__grid {
    display: grid;
    gap: 10px;
  }

  &__row {
    display: grid;
    grid-template-columns: 60px 1fr;
    gap: 10px;
    align-items: baseline;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.015);
    border: 1px solid rgba(20, 20, 20, 0.06);

    &.-today {
      border-color: rgba(0, 0, 0, 0.18);
      background: rgba(0, 0, 0, 0.03);
    }
  }

  &__day {
    font-size: $sld-hours-day;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.72);
  }

  &__hours {
    font-size: $sld-hours-text;
    color: rgba(0, 0, 0, 0.7);
    min-width: 0;
  }

  &__closed {
    font-weight: 700;
    color: rgba(0, 0, 0, 0.5);
  }

  &__range {
    font-weight: 800;
    color: rgba(0, 0, 0, 0.72);
  }

  &__sep {
    margin: 0 8px;
    opacity: 0.35;
  }
}
</style>
