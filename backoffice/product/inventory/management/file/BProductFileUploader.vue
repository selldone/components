<template>
  <section class="b-product-file-uploader text-start">
    <header class="b-product-file-uploader__header">
      <div>
        <v-icon size="19" aria-hidden="true">cloud_upload</v-icon>
        <h2>{{ $t("product_file.modern.upload_title") }}</h2>
      </div>
      <v-btn
        v-if="completedCount"
        class="sd-modern-button sd-modern-button--small b-product-file-uploader__clear"
        variant="text"
        @click="queue.clearCompleted()"
        >{{ $t("product_file.modern.uploader.clear_completed") }}</v-btn
      >
    </header>
    <div
      class="b-product-file-uploader__drop"
      :class="{
        'b-product-file-uploader__drop--over': dragDepth > 0,
        'b-product-file-uploader__drop--disabled': disabled,
      }"
      @dragenter.prevent="enterDrop"
      @dragleave.prevent="dragDepth = Math.max(0, dragDepth - 1)"
      @dragover.prevent
      @drop.prevent="dropFiles"
    >
      <div>
        <strong>{{ $t("product_file.modern.drop_title") }}</strong>
        <p>{{ $t("product_file.modern.drop_hint") }}</p>
      </div>
      <v-btn
        class="sd-modern-button sd-modern-button--primary"
        color="primary"
        variant="elevated"
        prepend-icon="add"
        :disabled="disabled"
        @click="selectFiles"
        >{{ $t("product_file.modern.select_files") }}</v-btn
      >
      <input
        ref="picker"
        type="file"
        multiple
        hidden
        :disabled="disabled"
        @change="pickedFiles"
      />
    </div>
    <p class="b-product-file-uploader__limit">
      {{
        $t("product_file.modern.upload_limit", {
          size: formatBytes(maxFileBytes),
          count: fileCountLimit,
        })
      }}
    </p>
    <p
      class="b-product-file-uploader__announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </p>
    <div ref="contentFrame" class="b-product-file-uploader__content-frame">
      <div ref="contentBody" class="b-product-file-uploader__content-body">
        <template v-if="rows.length">
          <div class="b-product-file-uploader__queue-heading">
            <span>{{
              $t(
                activeCount
                  ? "product_file.modern.uploader.active_summary"
                  : "product_file.modern.uploader.total_files",
                { count: activeCount || rows.length },
              )
            }}</span>
            <span v-if="completedCount">{{
              $t("product_file.modern.uploader.completed_title")
            }}</span>
          </div>
          <transition-group
            tag="ul"
            name="product-upload-row"
            class="b-product-file-uploader__queue"
            :class="{
              'b-product-file-uploader__queue--paged': completedPageCount > 1,
            }"
            :aria-label="$t('product_file.modern.uploader.queue_title')"
          >
            <li
              v-for="record in rows"
              :key="record.id"
              class="b-product-file-uploader__boundary"
            >
              <div
                class="b-product-file-uploader__record"
                :class="{
                  'b-product-file-uploader__record--done':
                    record.status === 'done',
                }"
              >
                <img
                  :src="fileIcon(record.name)"
                  class="b-product-file-uploader__icon"
                  width="28"
                  height="32"
                  alt=""
                />
                <div class="b-product-file-uploader__identity">
                  <v-tooltip
                    :model-value="nameTooltip === record.id"
                    :text="record.name"
                    :open-on-focus="true"
                    :open-on-click="false"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    @update:model-value="setNameTooltip(record.id, $event)"
                    ><template #activator="{ props }"
                      ><button
                        v-bind="props"
                        type="button"
                        class="b-product-file-uploader__filename"
                        :aria-label="record.name"
                        @click="setNameTooltip(record.id, true)"
                        @keydown.esc.stop="setNameTooltip(record.id, false)"
                      >
                        <bdi>{{ record.name }}</bdi>
                      </button></template
                    ></v-tooltip
                  >
                </div>
                <div class="b-product-file-uploader__meta">
                  <span class="b-product-file-uploader__status"
                    ><v-icon
                      v-if="record.status === 'done'"
                      class="b-product-file-uploader__confirmed"
                      size="14"
                      color="success"
                      aria-hidden="true"
                      >check_circle</v-icon
                    >{{
                      $t(`product_file.modern.uploader.status.${record.status}`)
                    }}</span
                  >
                  <bdi>{{
                    $t("product_file.modern.uploader.bytes_sent", {
                      sent: formatBytes(record.sent),
                      total: formatBytes(record.size),
                    })
                  }}</bdi>
                  <span v-if="record.speed > 0"
                    ><span>{{ $t("product_file.modern.uploader.speed") }}</span>
                    <bdi>{{ formatBytes(record.speed) }}/s</bdi></span
                  >
                  <span v-if="record.status === 'uploading'"
                    ><span>{{ $t("product_file.modern.remaining_time") }}</span>
                    <bdi>{{
                      Number.isFinite(record.eta) && record.speed > 0
                        ? formatTime(record.eta)
                        : "—"
                    }}</bdi></span
                  >
                </div>
                <svg
                  v-if="record.trace.samples.length"
                  class="b-product-file-uploader__trace sd-modern-chart-colors"
                  viewBox="0 0 96 28"
                  role="img"
                  :aria-label="
                    $t('product_file.modern.uploader.history', {
                      name: record.name,
                    })
                  "
                >
                  <title>
                    {{
                      $t("product_file.modern.uploader.history", {
                        name: record.name,
                      })
                    }}
                    · {{ formatBytes(record.trace.peak) }}/s
                  </title>
                  <polyline
                    v-if="record.trace.samples.length > 1"
                    :points="record.trace.points"
                  />
                  <circle v-else cx="2" :cy="record.trace.lastY" r="1.5" />
                </svg>
                <div class="b-product-file-uploader__actions">
                  <v-tooltip
                    v-if="record.graph.series.length"
                    :text="
                      $t('product_file.modern.uploader.history', {
                        name: record.name,
                      })
                    "
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    ><template #activator="{ props }"
                      ><v-btn
                        v-bind="props"
                        class="sd-modern-icon-button"
                        icon
                        variant="text"
                        :aria-label="
                          $t('product_file.modern.uploader.history', {
                            name: record.name,
                          })
                        "
                        :aria-expanded="expanded.includes(record.id)"
                        :aria-controls="`file-upload-history-${uid}-${record.id}`"
                        @click="toggleHistory(record.id)"
                        ><v-icon>show_chart</v-icon></v-btn
                      ></template
                    ></v-tooltip
                  >
                  <v-tooltip
                    v-if="
                      ['queued', 'authorizing', 'uploading'].includes(
                        record.status,
                      )
                    "
                    :text="$t('product_file.modern.uploader.cancel')"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    ><template #activator="{ props }"
                      ><v-btn
                        v-bind="props"
                        class="sd-modern-icon-button"
                        icon
                        variant="text"
                        :aria-label="$t('product_file.modern.uploader.cancel')"
                        @click="queue.cancel(record.id)"
                        ><v-icon>close</v-icon></v-btn
                      ></template
                    ></v-tooltip
                  >
                  <v-btn
                    v-if="['error', 'cancelled'].includes(record.status)"
                    class="sd-modern-button sd-modern-button--small b-product-file-uploader__retry"
                    variant="text"
                    prepend-icon="refresh"
                    :disabled="disabled"
                    :aria-label="$t('product_file.modern.uploader.retry')"
                    @click="retry(record)"
                    >{{ $t("product_file.modern.uploader.retry") }}</v-btn
                  >
                  <v-tooltip
                    v-if="['error', 'cancelled'].includes(record.status)"
                    :text="$t('product_file.modern.uploader.retry')"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    ><template #activator="{ props }"
                      ><v-btn
                        v-bind="props"
                        class="sd-modern-icon-button b-product-file-uploader__retry-icon"
                        icon
                        variant="text"
                        :disabled="disabled"
                        :aria-label="$t('product_file.modern.uploader.retry')"
                        @click="retry(record)"
                        ><v-icon>refresh</v-icon></v-btn
                      ></template
                    ></v-tooltip
                  >
                  <v-tooltip
                    v-if="record.canDismiss"
                    :text="$t('product_file.modern.uploader.queue_remove')"
                    location="top"
                    content-class="sd-modern-tooltip text-start"
                    ><template #activator="{ props }"
                      ><v-btn
                        v-bind="props"
                        class="sd-modern-icon-button"
                        icon
                        variant="text"
                        :aria-label="
                          $t('product_file.modern.uploader.queue_remove')
                        "
                        @click="dismiss(record)"
                        ><v-icon>close</v-icon></v-btn
                      ></template
                    ></v-tooltip
                  >
                </div>
                <div
                  v-if="
                    record.errorKey ||
                    (record.fileId &&
                      !record.canRetry &&
                      ['error', 'cancelled'].includes(record.status))
                  "
                  class="b-product-file-uploader__feedback"
                >
                  <p
                    v-if="record.errorKey"
                    class="b-product-file-uploader__error"
                    :role="record.status === 'error' ? 'alert' : 'status'"
                  >
                    <v-icon
                      size="14"
                      :color="record.status === 'error' ? 'error' : undefined"
                      aria-hidden="true"
                      >{{
                        record.status === "error"
                          ? "error_outline"
                          : "info_outline"
                      }}</v-icon
                    ><span>{{
                      $t(
                        `product_file.modern.uploader.errors.${record.errorKey}`,
                      )
                    }}</span>
                  </p>
                  <p
                    v-if="typeof record.id === 'string'"
                    class="b-product-file-uploader__recovery"
                  >
                    {{ $t("product_file.modern.uploader.reselect_hint") }}
                  </p>
                  <v-btn
                    v-if="
                      record.errorKey === 'pending_reservation' && record.fileId
                    "
                    class="sd-modern-button sd-modern-button--small sd-modern-button--inline"
                    variant="text"
                    prepend-icon="delete_outline"
                    :disabled="disabled"
                    @click="
                      $emit('remove-pending', {
                        id: record.id,
                        fileId: record.fileId,
                        name: record.name,
                      })
                    "
                    >{{
                      $t("product_file.modern.uploader.remove_incomplete")
                    }}</v-btn
                  >
                  <p
                    v-else-if="
                      record.fileId &&
                      !record.canRetry &&
                      ['error', 'cancelled'].includes(record.status)
                    "
                    class="b-product-file-uploader__recovery"
                  >
                    {{ $t("product_file.modern.uploader.recovery") }}
                  </p>
                </div>
                <div
                  v-if="
                    ['uploading', 'confirming', 'done'].includes(record.status)
                  "
                  class="b-product-file-uploader__progress"
                  :class="{
                    'b-product-file-uploader__progress--active':
                      record.status === 'uploading',
                    'b-product-file-uploader__progress--unknown':
                      record.progress == null,
                  }"
                  role="progressbar"
                  :aria-label="record.name"
                  :aria-valuemin="0"
                  :aria-valuemax="100"
                  :aria-valuenow="
                    record.progress == null
                      ? undefined
                      : Math.round(record.progress)
                  "
                >
                  <span
                    :style="{
                      width: `${record.progress == null ? 100 : Math.min(100, Math.max(0, record.progress))}%`,
                    }"
                  />
                </div>
                <div
                  v-if="
                    expanded.includes(record.id) && record.graph.series.length
                  "
                  :id="`file-upload-history-${uid}-${record.id}`"
                  class="b-product-file-uploader__history"
                  role="region"
                  :aria-label="
                    $t('product_file.modern.uploader.history', {
                      name: record.name,
                    })
                  "
                >
                  <p>
                    {{ $t("product_file.modern.uploader.history_caption") }}
                  </p>
                  <div class="b-product-file-uploader__history-chart">
                    <div class="b-product-file-uploader__history-y-axis">
                      <bdi>{{ formatRate(record.graph.peak) }}</bdi>
                      <bdi>0</bdi>
                    </div>
                    <svg
                      class="b-product-file-uploader__history-plot"
                      viewBox="38 16 234 84"
                      preserveAspectRatio="none"
                      role="img"
                      :aria-label="
                        $t('product_file.modern.uploader.history', {
                          name: record.name,
                        })
                      "
                    >
                      <title>
                        {{
                          $t("product_file.modern.uploader.history", {
                            name: record.name,
                          })
                        }}
                        · {{ formatRate(record.graph.peak) }} MB/s
                      </title>
                      <g class="b-product-file-uploader__history-grid">
                        <line x1="38" y1="16" x2="272" y2="16" />
                        <line x1="38" y1="58" x2="272" y2="58" />
                        <line x1="38" y1="100" x2="272" y2="100" />
                      </g>
                      <template
                        v-for="series in record.graph.series"
                        :key="series.number"
                      >
                        <polyline
                          v-if="series.samples.length > 1"
                          class="b-product-file-uploader__history-series"
                          :points="series.points"
                          :stroke="series.color"
                        >
                          <title>
                            {{
                              $t("product_file.modern.uploader.attempt", {
                                count: series.number,
                              })
                            }}
                          </title>
                        </polyline>
                        <line
                          v-else
                          class="b-product-file-uploader__history-series"
                          x1="38"
                          x2="38.01"
                          :y1="series.lastY"
                          :y2="series.lastY"
                          :stroke="series.color"
                        />
                      </template>
                    </svg>
                    <div class="b-product-file-uploader__history-x-axis">
                      <bdi>1</bdi>
                      <span dir="auto">{{
                        $t("product_file.modern.uploader.history_samples")
                      }}</span>
                      <bdi>{{ record.graph.count }}</bdi>
                    </div>
                  </div>
                  <div class="b-product-file-uploader__history-legend">
                    <span
                      v-for="series in record.graph.series"
                      :key="series.number"
                      ><i
                        :style="{ background: series.color }"
                        class="b-product-file-uploader__history-color"
                        aria-hidden="true"
                      />{{
                        $t("product_file.modern.uploader.attempt", {
                          count: series.number,
                        })
                      }}</span
                    >
                  </div>
                </div>
              </div>
            </li>
          </transition-group>
          <footer
            v-if="completedCount"
            class="sd-modern-table-footer b-product-file-uploader__footer"
          >
            <span>{{
              $t("product_file.modern.uploader.completed_range", completedRange)
            }}</span>
            <v-pagination
              v-model="completedPage"
              :length="completedPageCount"
              :total-visible="4"
              class="sd-modern-pagination"
            />
          </footer>
          <p v-if="activeCount" class="b-product-file-uploader__note">
            {{ $t("product_file.modern.uploader.keep_page_open") }}
          </p>
        </template>
        <figure
          v-else
          class="sd-modern-illustration b-product-file-uploader__empty"
        >
          <div class="b-product-file-uploader__empty-stage" aria-hidden="true">
            <svg viewBox="0 0 160 68" width="160" height="68" focusable="false">
              <path
                class="b-product-file-uploader__empty-route"
                d="M 47 35 C 64 35 62 35 78 35"
              />
              <svg
                class="sd-modern-illustration__icon b-product-file-uploader__empty-file"
                x="22"
                y="20"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                focusable="false"
              >
                <path
                  d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"
                />
                <path d="M14 3v5h5M8 13h8M8 17h5" />
              </svg>
              <svg
                class="sd-modern-illustration__icon b-product-file-uploader__empty-tray"
                x="83"
                y="15"
                width="42"
                height="42"
                viewBox="0 0 24 24"
                focusable="false"
              >
                <path
                  d="M4 9h16l2 9v2H2v-2ZM2 17h6l2 3h4l2-3h6M12 4v8m-3-3 3 3 3-3"
                />
              </svg>
            </svg>
          </div>
          <figcaption>
            <strong>{{
              $t("product_file.modern.uploader.queue_empty")
            }}</strong>
            <p>{{ $t("product_file.modern.uploader.queue_empty_hint") }}</p>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import numeral from "numeral";
import { FileHelper } from "@selldone/core-js/utils";
import {
  createProductFileUploadQueue,
  PRODUCT_FILE_UPLOAD_COUNT_LIMIT,
} from "./ProductFileUploadQueue";
import { PALETTE } from "../../../../../ui/chart/donut-leader/donutSlices";

const ACTIVE = ["queued", "authorizing", "uploading", "confirming"];
let instances = 0;

export default {
  name: "BProductFileUploader",
  emits: ["change", "remove-pending"],
  props: {
    authorize: { type: Function, required: true },
    confirm: { type: Function, required: true },
    recover: { type: Function, required: true },
    maxFileBytes: { type: Number, required: true },
    availableBytes: { type: Number, required: true },
    existingFiles: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
  },
  data: () => ({
    queue: null,
    rejections: [],
    rejectionSequence: 0,
    dragDepth: 0,
    disposed: false,
    uid: ++instances,
    expanded: [],
    announcement: "",
    statusById: {},
    nameTooltip: null,
    retrySelection: null,
    completedPage: 1,
    contentHeight: null,
    heightAnimation: null,
  }),
  computed: {
    fileCountLimit() {
      return PRODUCT_FILE_UPLOAD_COUNT_LIMIT;
    },
    records() {
      return this.queue?.records || [];
    },
    activeCount() {
      return this.records.filter((record) => ACTIVE.includes(record.status))
        .length;
    },
    completedCount() {
      return this.records.filter((record) => record.status === "done").length;
    },
    completedPageCount() {
      return Math.max(1, Math.ceil(this.completedCount / 3));
    },
    completedRange() {
      return {
        start: (this.completedPage - 1) * 3 + 1,
        end: Math.min(this.completedPage * 3, this.completedCount),
        total: this.completedCount,
      };
    },
    rows() {
      const done = this.records
        .filter((record) => record.status === "done")
        .sort((a, b) => b.completedOrder - a.completedOrder)
        .slice((this.completedPage - 1) * 3, this.completedPage * 3);
      return [
        ...this.records.filter((record) => record.status !== "done"),
        ...this.rejections,
        ...done,
      ].map((record) => {
        const graph = this.historyGraph(record);
        const current = (record.history || []).filter(
          (value) => Number.isFinite(value) && value >= 0,
        );
        const samples = current.length
          ? current
          : graph.series.at(-1)?.samples || [];
        const peak = Math.max(...samples, 0);
        const y = (value) => 26 - (peak ? value / peak : 0) * 24;
        return {
          ...record,
          graph,
          trace: {
            samples,
            peak,
            lastY: y(samples.at(-1) || 0),
            points: samples
              .map(
                (value, index) =>
                  `${2 + (index / Math.max(samples.length - 1, 1)) * 92},${y(value)}`,
              )
              .join(" "),
          },
        };
      });
    },
  },
  watch: {
    completedPageCount(count) {
      this.completedPage = Math.min(this.completedPage, count);
    },
  },
  created() {
    this.queue = createProductFileUploadQueue({
      authorize: (file, signal) => this.authorize(file, signal),
      confirm: (fileItem, signal) => this.confirm(fileItem, signal),
      recover: (file, fileId, signal) => this.recover(file, fileId, signal),
      isFileAvailable: (fileId) =>
        this.existingFiles.some((file) => Number(file.id) === fileId),
      onChange: (records) => {
        if (this.disposed) return;
        for (const record of records) {
          if (this.statusById[record.id] !== record.status)
            this.announcement = `${record.name}: ${this.$t(`product_file.modern.uploader.status.${record.status}`)}`;
        }
        this.statusById = Object.fromEntries(
          records.map((record) => [record.id, record.status]),
        );
        this.$emit(
          "change",
          records.map(
            ({
              id,
              fileId,
              name,
              size,
              sent,
              progress,
              speed,
              eta,
              status,
              errorKey,
            }) => ({
              id,
              fileId,
              name,
              size,
              sent,
              progress,
              speed,
              eta,
              status,
              errorKey,
            }),
          ),
        );
      },
    });
  },
  beforeUpdate() {
    this.contentHeight =
      this.$refs.contentFrame?.getBoundingClientRect?.().height ?? null;
  },
  updated() {
    this.animateContentHeight();
  },
  beforeUnmount() {
    this.disposed = true;
    this.heightAnimation?.cancel();
    this.queue?.dispose();
    this.$emit("change", []);
  },
  methods: {
    addFiles(files) {
      if (this.disabled || this.disposed) return;
      const { rejected } = this.queue.add(Array.from(files), {
        maxFileBytes: this.maxFileBytes,
        availableBytes: this.availableBytes,
        existingFiles: this.existingFiles,
      });
      this.rejections.push(
        ...rejected.map((record) => ({
          ...record,
          id: `rejected-${++this.rejectionSequence}`,
          status: "error",
          sent: 0,
          progress: null,
          speed: null,
          eta: null,
          history: [],
          canRetry: false,
          canDismiss: true,
        })),
      );
    },
    pickedFiles(event) {
      const files = event.target.files || [];
      if (files.length && this.retrySelection != null) {
        this.dismiss({ id: this.retrySelection });
        this.retrySelection = null;
      }
      this.addFiles(files);
      event.target.value = "";
    },
    selectFiles() {
      this.retrySelection = null;
      this.$refs.picker.click();
    },
    retry(record) {
      if (this.disabled || this.disposed) return;
      if (typeof record.id !== "string") return this.retryRecord(record.id);
      this.retrySelection = record.id;
      this.$refs.picker.click();
    },
    retryRecord(id) {
      if (this.disabled || this.disposed) return false;
      return this.queue.retry(id);
    },
    animateContentHeight() {
      const frame = this.$refs.contentFrame;
      const body = this.$refs.contentBody;
      if (!frame?.animate || !body || this.contentHeight == null) return;
      const from = this.contentHeight;
      this.heightAnimation?.cancel();
      this.heightAnimation = null;
      frame.style.overflow = "";
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
        return;
      const to = body.getBoundingClientRect().height;
      if (Math.abs(to - from) < 1) return;
      frame.style.overflow = "hidden";
      this.heightAnimation = frame.animate(
        [{ height: `${from}px` }, { height: `${to}px` }],
        { duration: 220, easing: "ease-out" },
      );
      this.heightAnimation.onfinish = () => {
        frame.style.overflow = "";
      };
    },
    enterDrop(event) {
      if (
        !this.disabled &&
        Array.from(event.dataTransfer?.types || []).includes("Files")
      )
        this.dragDepth++;
    },
    dropFiles(event) {
      this.dragDepth = 0;
      this.addFiles(event.dataTransfer?.files || []);
    },
    dismiss(record) {
      if (typeof record.id === "string")
        this.rejections = this.rejections.filter(
          (item) => item.id !== record.id,
        );
      else this.queue.dismiss(record.id);
    },
    toggleHistory(id) {
      this.expanded = this.expanded.includes(id)
        ? this.expanded.filter((value) => value !== id)
        : [...this.expanded, id];
    },
    setNameTooltip(id, open) {
      if (open) this.nameTooltip = id;
      else if (this.nameTooltip === id) this.nameTooltip = null;
    },
    historyGraph(record) {
      const attempts = record.attempts?.length
        ? record.attempts
        : [{ number: 1, history: record.history || [] }];
      const series = attempts
        .slice(-5)
        .map((attempt, index) => ({
          number: attempt.number,
          color: PALETTE[index],
          samples: attempt.history.filter(
            (value) => Number.isFinite(value) && value >= 0,
          ),
        }))
        .filter((attempt) => attempt.samples.length);
      const peak = Math.max(0, ...series.flatMap((attempt) => attempt.samples));
      const count = Math.max(
        1,
        ...series.map((attempt) => attempt.samples.length),
      );
      return {
        peak,
        count,
        series: series.map((attempt) => ({
          ...attempt,
          lastY: 100 - (peak ? attempt.samples[0] / peak : 0) * 84,
          points: attempt.samples
            .map(
              (value, index) =>
                `${38 + (index / Math.max(count - 1, 1)) * 234},${100 - (peak ? value / peak : 0) * 84}`,
            )
            .join(" "),
        })),
      };
    },
    formatRate(value) {
      const rate = value / 1000000;
      return rate > 0 && rate < 0.01 ? "<0.01" : numeral(rate).format("0.[00]");
    },
    fileIcon(name) {
      return FileHelper.GetFileExtensionImage(name);
    },
    formatBytes(value) {
      return numeral(Number.isFinite(value) ? value : 0).format("0.[0] b");
    },
    formatTime(seconds) {
      const total = Math.max(0, Math.ceil(seconds));
      return [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60]
        .map((value) => String(value).padStart(2, "0"))
        .join(":");
    },
  },
};
</script>

<style scoped lang="scss">
.b-product-file-uploader {
  container: product-file-uploader / inline-size;
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  &__content-frame {
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
    min-height: 0;
    padding: 0;
    margin: 0;
    border: 0;
  }
  &__content-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  &__empty {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    min-height: 140px;
    margin: 0;
    padding: 16px 8px;
    text-align: center;
  }
  &__empty-stage {
    pointer-events: none;
    color: var(--sd-modern-muted);
    opacity: 0.55;
  }
  &__empty-stage > svg {
    display: block;
    width: 160px;
    max-width: 100%;
    height: 68px;
  }
  &__empty-route {
    fill: none;
    stroke: currentColor;
    stroke-width: 1;
    stroke-dasharray: 2 5;
    stroke-linecap: round;
  }
  &__empty-file {
    animation: file-queue-ready 2.4s ease-out both;
    transform-origin: center;
  }
  &__empty-tray {
    color: rgb(var(--sd-modern-illustration-accent-rgb));
  }
  &__empty strong {
    display: block;
    font-size: 13px;
    line-height: 21px;
    font-weight: 500;
  }
  &__empty p {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__header,
  &__header > div {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  &__header {
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    line-height: 24px;
  }
  &__drop {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    min-height: 88px;
    margin-block-start: 16px;
    padding: 16px;
    border: 1px dashed var(--sd-modern-border);
    border-radius: 14px;
    background: var(--sd-modern-inset);
  }
  &__drop--over {
    border-color: rgb(var(--v-theme-primary));
  }
  &__drop--disabled {
    opacity: 0.65;
  }
  &__drop > div {
    min-width: 0;
  }
  &__drop strong {
    font-size: 13px;
    font-weight: 500;
    line-height: 21px;
  }
  &__drop p {
    margin: 3px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__drop .v-btn {
    flex-shrink: 0;
  }
  &__limit {
    margin: 8px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__announcement {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  &__queue-heading {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-block: 16px 6px;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__queue {
    position: relative;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  &__queue--paged {
    min-height: 216px;
  }
  &__boundary {
    padding: 0;
    margin: 0;
    border: 0;
    display: flow-root;
  }
  &__boundary:last-child &__record {
    border: 0;
  }
  &__record {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) 76px auto;
    grid-template-areas: "icon identity trace actions" "icon meta trace actions";
    align-items: center;
    column-gap: 10px;
    row-gap: 3px;
    min-height: 72px;
    padding: 10px 0;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__icon {
    grid-area: icon;
    object-fit: contain;
  }
  &__identity {
    grid-area: identity;
    min-width: 0;
  }
  &__filename {
    display: block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 13px;
    line-height: 21px;
    font-weight: 500;
    text-align: start;
    cursor: help;
  }
  &__filename:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  &__meta {
    grid-area: meta;
    display: flex;
    align-items: center;
    gap: 2px 10px;
    flex-wrap: wrap;
    font-size: 11px;
    line-height: 18px;
    color: var(--sd-modern-muted);
  }
  &__meta > span,
  &__meta > bdi {
    min-width: 0;
  }
  &__status {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    color: rgb(var(--v-theme-on-surface));
  }
  &__trace {
    grid-area: trace;
    width: 76px;
    height: 28px;
    overflow: visible;
    color: rgb(var(--v-theme-primary));
  }
  &__trace polyline {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  &__trace circle {
    fill: currentColor;
  }
  &__record--done &__trace {
    color: rgb(var(--v-theme-success));
  }
  &__actions {
    grid-area: actions;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: flex-end;
  }
  &__retry-icon.v-btn {
    display: none;
  }
  &__footer {
    margin-block-start: 8px;
    font-size: 11px;
    line-height: 18px;
  }
  &__progress {
    grid-column: 1 / -1;
    height: 3px;
    overflow: hidden;
    border-radius: 2px;
    background: var(--sd-modern-border);
  }
  &__progress > span {
    display: block;
    position: relative;
    height: 100%;
    overflow: hidden;
    background: rgb(var(--v-theme-primary));
  }
  &__progress--active > span::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(var(--v-theme-on-primary), 0.25),
      transparent
    );
    animation: file-transfer 1.6s linear infinite;
  }
  &__progress--unknown > span {
    opacity: 0.35;
  }
  &__record--done &__progress > span {
    background: rgb(var(--v-theme-success));
  }
  &__feedback {
    grid-column: 1 / -1;
    min-width: 0;
  }
  &__error {
    display: flex;
    gap: 5px;
    align-items: flex-start;
    margin: 4px 0 0;
    color: rgb(var(--v-theme-on-surface));
    font-size: 12px;
    line-height: 19px;
  }
  &__error .v-icon {
    margin-block-start: 2px;
    flex-shrink: 0;
  }
  &__recovery {
    margin: 4px 0 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__note {
    margin: 9px 0 0;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__history {
    grid-column: 1 / -1;
    min-width: 0;
    padding-block: 10px 4px;
  }
  &__history > p {
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 19px;
  }
  &__history-chart {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: 8px;
    row-gap: 4px;
    direction: ltr;
    margin-block: 5px;
  }
  &__history-plot {
    display: block;
    width: 100%;
    height: 64px;
    overflow: visible;
    direction: ltr;
  }
  &__history-y-axis {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 16px;
  }
  &__history-x-axis {
    grid-column: 2;
    display: flex;
    gap: 6px;
    justify-content: space-between;
    align-items: baseline;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
  }
  &__history-grid line {
    stroke: var(--sd-modern-border);
    stroke-dasharray: 3 4;
    vector-effect: non-scaling-stroke;
  }
  &__history-series {
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  polyline.b-product-file-uploader__history-series {
    fill: none;
  }
  &__history-legend {
    display: flex;
    gap: 6px 14px;
    flex-wrap: wrap;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__history-legend > span {
    display: inline-flex;
    gap: 5px;
    align-items: center;
  }
  &__history-color {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}
.product-upload-row-enter-active,
.product-upload-row-leave-active,
.product-upload-row-move {
  transition:
    opacity 220ms ease-out,
    transform 220ms ease-out;
}
.product-upload-row-leave-active {
  position: absolute;
  width: 100%;
}
.product-upload-row-enter-from,
.product-upload-row-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
.smart-invert .b-product-file-uploader__trace :is(polyline, circle),
.smart-invert .b-product-file-uploader__progress > span,
.smart-invert .b-product-file-uploader__history-series,
.smart-invert .b-product-file-uploader__history-color,
.smart-invert .b-product-file-uploader__confirmed,
.smart-invert .b-product-file-uploader__error :deep(.v-icon.text-error) {
  filter: invert(1);
}
@keyframes file-transfer {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}
@keyframes file-queue-ready {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 600px) {
  .b-product-file-uploader {
    &__drop {
      flex-wrap: wrap;
      gap: 12px;
    }
    &__icon {
      width: 24px;
      height: 28px;
    }
    &__trace {
      width: 96px;
      max-width: 100%;
    }
    &__meta {
      font-size: 12px;
      line-height: 19px;
    }
  }
}
@container product-file-uploader (max-width: 600px) {
  .b-product-file-uploader {
    &__icon {
      width: 24px;
      height: 28px;
    }
    &__record {
      grid-template-columns: 24px minmax(0, 1fr) auto;
      grid-template-areas: "icon identity actions" "meta meta meta";
      column-gap: 6px;
    }
    &__record--done {
      grid-template-areas: "icon identity actions" "icon meta actions";
      row-gap: 1px;
    }
    &__meta {
      font-size: 12px;
      line-height: 19px;
    }
    &__trace,
    &__retry.v-btn {
      display: none;
    }
    &__retry-icon.v-btn {
      display: inline-flex;
    }
    &__actions {
      flex-wrap: nowrap;
      gap: 4px;
    }
  }
}
@media (max-width: 440px) {
  .b-product-file-uploader {
    &__header {
      flex-wrap: nowrap;
      gap: 8px;
    }
    &__header > div {
      min-width: 0;
      gap: 7px;
    }
    &__clear.v-btn {
      flex-shrink: 0;
      min-width: 0;
      padding-inline: 8px;
      font-size: 11px;
      line-height: 18px;
    }
    &__trace {
      display: none;
    }
    // Keep the native previous/current/next controls together in narrow cards.
    &__footer :deep(.v-pagination__item:not(.v-pagination__item--is-active)) {
      display: none;
    }
    &__footer :deep(.v-pagination__list) {
      flex-wrap: nowrap;
    }
  }
}
@media (prefers-reduced-motion: reduce) {
  .b-product-file-uploader__progress--active > span::after {
    animation: none;
  }
  .b-product-file-uploader__empty-file {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .product-upload-row-enter-active,
  .product-upload-row-leave-active,
  .product-upload-row-move {
    transition: none;
  }
}
</style>
