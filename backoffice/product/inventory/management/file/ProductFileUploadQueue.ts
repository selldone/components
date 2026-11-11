import { reactive } from "vue";

export const PRODUCT_FILE_UPLOAD_COUNT_LIMIT = 20;

export type ProductFileUploadStatus =
  | "queued"
  | "authorizing"
  | "uploading"
  | "confirming"
  | "done"
  | "error"
  | "cancelled";

export type ProductFileUploadError =
  | "too_large"
  | "capacity"
  | "file_limit"
  | "duplicate"
  | "authorize"
  | "network"
  | "transfer"
  | "timeout"
  | "expired"
  | "confirmation"
  | "unsupported"
  | "cancelled_reservation"
  | "pending_reservation"
  | "removed";

export interface ProductFileUploadRecord {
  id: number;
  name: string;
  size: number;
  sent: number;
  progress: number | null;
  speed: number | null;
  eta: number | null;
  history: number[];
  attempts: {
    number: number;
    status: ProductFileUploadStatus;
    history: number[];
  }[];
  status: ProductFileUploadStatus;
  errorKey: ProductFileUploadError | null;
  fileId?: number;
  canRetry: boolean;
  canDismiss: boolean;
  completedOrder: number | null;
}

export interface ProductFileUploadDescriptor {
  attributes: { action: string; method: string; enctype?: string };
  inputs?: Record<string, string | number> | [];
  headers?: Record<string, string> | [];
  direct_file?: boolean;
  with_credentials?: boolean;
  file_item: { id: number | string; [key: string]: unknown };
}

export type ProductFileUploadRecovery =
  | { kind: "available" }
  | { kind: "complete"; fileItem: ProductFileUploadDescriptor["file_item"] }
  | { kind: "pending"; fileItem: ProductFileUploadDescriptor["file_item"] };

interface QueueOptions {
  authorize(
    file: File,
    signal: AbortSignal,
  ): Promise<ProductFileUploadDescriptor>;
  confirm(
    fileItem: ProductFileUploadDescriptor["file_item"],
    signal: AbortSignal,
  ): Promise<boolean>;
  recover(
    file: File,
    fileId: number | undefined,
    signal: AbortSignal,
  ): Promise<ProductFileUploadRecovery>;
  isFileAvailable(fileId: number): boolean;
  onChange?(records: ProductFileUploadRecord[]): void;
  now?(): number;
}

interface QueueLimits {
  maxFileBytes: number;
  availableBytes: number;
  existingFiles: { id?: number | string; name: string }[];
}

/** Private signed descriptors and native File objects never enter reactive UI state. */
export function createProductFileUploadQueue(options: QueueOptions) {
  const records = reactive<ProductFileUploadRecord[]>([]);
  const entries = new Map<
    number,
    {
      file: File | null;
      descriptor?: ProductFileUploadDescriptor;
      fileItem?: ProductFileUploadDescriptor["file_item"];
      needsRecovery: boolean;
      authorizedAt: number;
      authorizationStarted: boolean;
      uploaded: boolean;
      busy: boolean;
      generation: number;
      controller?: AbortController;
      abortTransfer?: () => void;
    }
  >();
  const now = options.now || (() => performance.now());
  const descriptorLifetime = 110 * 60 * 1000; // The existing signing contract expires after 120 minutes.
  let nextId = 0,
    completedOrder = 0,
    active = 0,
    disposed = false;
  const changed = () => options.onChange?.(records);
  const find = (record: ProductFileUploadRecord | number) =>
    records.find(
      (item) => item.id === (typeof record === "number" ? record : record.id),
    );

  const safeFileId = (
    fileItem: ProductFileUploadDescriptor["file_item"] | undefined,
  ) => {
    const id = Number(fileItem?.id);
    return Number.isSafeInteger(id) && id > 0 ? id : undefined;
  };

  function validDescriptor(value: ProductFileUploadDescriptor) {
    return (
      value &&
      value.attributes &&
      typeof value.attributes.action === "string" &&
      !!value.attributes.action &&
      typeof value.attributes.method === "string" &&
      ["POST", "PUT"].includes(value.attributes.method?.toUpperCase()) &&
      !!safeFileId(value.file_item) &&
      (!value.inputs ||
        (typeof value.inputs === "object" &&
          (!Array.isArray(value.inputs) || !value.inputs.length))) &&
      (!value.headers ||
        (typeof value.headers === "object" &&
          (!Array.isArray(value.headers) || !value.headers.length)))
    );
  }

  function pump() {
    if (disposed) return;
    while (active < 2) {
      const record = records.find(
        (item) => item.status === "queued" && !entries.get(item.id)?.busy,
      );
      if (!record) break;
      void run(record);
    }
  }

  async function run(record: ProductFileUploadRecord) {
    const entry = entries.get(record.id)!;
    entry.busy = true;
    entry.controller = new AbortController();
    const generation = ++entry.generation;
    const current = () =>
      !disposed &&
      entry.generation === generation &&
      entries.get(record.id) === entry;
    const attempt = {
      number: (record.attempts.at(-1)?.number || 0) + 1,
      status: "queued" as ProductFileUploadStatus,
      history: entry.uploaded ? record.history.slice() : ([] as number[]),
    };
    record.attempts.push(attempt);
    if (record.attempts.length > 5) record.attempts.shift();
    if (!entry.needsRecovery) record.history = attempt.history;
    record.sent = entry.uploaded ? record.size : 0;
    record.progress = entry.uploaded ? 100 : 0;
    record.speed = null;
    record.eta = null;
    record.errorKey = null;
    record.canRetry = false;
    record.canDismiss = false;
    active++;
    try {
      if (entry.needsRecovery) {
        record.status = "authorizing";
        attempt.status = "authorizing";
        changed();
        const recovery = await options.recover(
          entry.file!,
          record.fileId,
          entry.controller.signal,
        );
        if (!current()) return;
        if (recovery?.kind === "available") {
          entry.descriptor = undefined;
          entry.fileItem = undefined;
          entry.uploaded = false;
          entry.authorizationStarted = false;
          record.fileId = undefined;
        } else if (
          recovery?.kind === "complete" ||
          recovery?.kind === "pending"
        ) {
          const fileId = safeFileId(recovery.fileItem);
          if (!fileId) throw "unsupported";
          if (recovery.kind === "pending" && record.fileId !== fileId)
            entry.uploaded = false;
          entry.fileItem = recovery.fileItem;
          record.fileId = fileId;
          if (recovery.kind === "complete") {
            if (!entry.uploaded) attempt.history = record.history.slice();
            entry.uploaded = true;
            record.sent = record.size;
            record.progress = 100;
          } else if (
            !entry.uploaded &&
            (!entry.descriptor ||
              !validDescriptor(entry.descriptor) ||
              Number(entry.descriptor.file_item.id) !== fileId ||
              now() - entry.authorizedAt >= descriptorLifetime)
          ) {
            throw "pending_reservation";
          }
        } else throw "unsupported";
        entry.needsRecovery = false;
        if (
          (record.status as ProductFileUploadStatus) === "cancelled" &&
          !entry.uploaded
        )
          return;
      }
      if (!entry.descriptor && !entry.uploaded) {
        record.status = "authorizing";
        attempt.status = "authorizing";
        changed();
        entry.authorizationStarted = true;
        entry.authorizedAt = now();
        const descriptor = await options.authorize(
          entry.file!,
          entry.controller.signal,
        );
        if (!current()) return;
        entry.descriptor = descriptor;
        const fileId = safeFileId(descriptor?.file_item);
        if (fileId) {
          record.fileId = fileId;
          entry.fileItem = descriptor.file_item;
        }
        if (!validDescriptor(descriptor)) throw "unsupported";
        // A cancelled signing request may already reserve a row; retain its eventual descriptor, but send no bytes.
        if ((record.status as ProductFileUploadStatus) === "cancelled") {
          record.canRetry = true;
          return;
        }
      }
      if (!entry.uploaded) {
        if (now() - entry.authorizedAt >= descriptorLifetime) throw "expired";
        attempt.history = [];
        record.history = attempt.history;
        record.status = "uploading";
        attempt.status = "uploading";
        changed();
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const descriptor = entry.descriptor!;
          let sameOriginCredentialed = false;
          let settled = false,
            measuredAt = now(),
            measuredBytes = 0,
            latestBytes = 0;
          let observedProgress = false,
            lastProgressAt = now(),
            graphInterval = 1000;
          let graphBytes = 0,
            graphElapsed = 0;
          const durations: number[] = [];
          let timer: ReturnType<typeof setInterval> | undefined;
          const measure = (force = false) => {
            const elapsed = now() - measuredAt;
            if (!observedProgress || elapsed <= 0 || (!force && elapsed < 1000))
              return;
            const delta = Math.max(0, latestBytes - measuredBytes);
            record.speed = (delta * 1000) / elapsed;
            record.eta =
              record.speed > 0
                ? Math.max(0, record.size - latestBytes) / record.speed
                : null;
            graphBytes += delta;
            graphElapsed += elapsed;
            if (graphElapsed >= graphInterval || force) {
              // Preserve the complete attempt with weighted adjacent bins instead of dropping its beginning.
              if (record.history.length >= 120) {
                const samples: number[] = [],
                  weights: number[] = [];
                for (let index = 0; index < record.history.length; index += 2) {
                  const duration = durations[index] + durations[index + 1];
                  samples.push(
                    (record.history[index] * durations[index] +
                      record.history[index + 1] * durations[index + 1]) /
                      duration,
                  );
                  weights.push(duration);
                }
                record.history.splice(0, record.history.length, ...samples);
                durations.splice(0, durations.length, ...weights);
                graphInterval *= 2;
              }
              record.history.push((graphBytes * 1000) / graphElapsed);
              durations.push(graphElapsed);
              graphBytes = 0;
              graphElapsed = 0;
            }
            measuredAt = now();
            measuredBytes = latestBytes;
          };
          const finish = (error?: ProductFileUploadError | "cancelled") => {
            if (settled) return;
            if (current()) measure(true);
            settled = true;
            if (timer) clearInterval(timer);
            entry.abortTransfer = undefined;
            error ? reject(error) : resolve();
          };
          entry.abortTransfer = () => {
            finish("cancelled");
            xhr.abort();
          };
          xhr.upload.onprogress = (event) => {
            if (!current() || record.status !== "uploading" || settled) return;
            const computable = event.lengthComputable && event.total > 0;
            if (computable || descriptor.direct_file) {
              latestBytes = Math.min(
                record.size,
                Math.max(
                  0,
                  computable
                    ? (event.loaded / event.total) * record.size
                    : event.loaded,
                ),
              );
              record.sent = Math.floor(latestBytes);
              observedProgress = true;
              lastProgressAt = now();
            }
            record.progress =
              event.lengthComputable && event.total > 0
                ? Math.min(100, Math.max(0, (event.loaded / event.total) * 100))
                : null;
            measure();
            changed();
          };
          timer = setInterval(() => {
            if (
              !current() ||
              settled ||
              !observedProgress ||
              now() - lastProgressAt < 3000
            )
              return;
            measure(record.speed !== 0);
            changed();
          }, 1000);
          xhr.onerror = () => finish("network");
          xhr.ontimeout = () => finish("timeout");
          xhr.onabort = () => finish("cancelled");
          xhr.onload = () => {
            if (!current() || settled) return;
            if (xhr.status < 200 || xhr.status >= 300) {
              finish("transfer");
              return;
            }
            if (sameOriginCredentialed) {
              const text = xhr.responseText || "";
              if (text.length > 64 * 1024) {
                finish("transfer");
                return;
              }
              if (text.trim()) {
                try {
                  const response = JSON.parse(text);
                  if (response?.error === true || response?.success === false) {
                    finish("transfer");
                    return;
                  }
                } catch {
                  finish("transfer");
                  return;
                }
              }
            }
            if (current() && record.status === "uploading" && !settled) {
              entry.uploaded = true;
              record.sent = record.size;
              record.progress = 100;
              record.status = "confirming";
              attempt.status = "confirming";
              changed();
            }
            finish();
          };
          try {
            xhr.open(
              descriptor.attributes.method.toUpperCase(),
              descriptor.attributes.action,
              true,
            );
            xhr.withCredentials = !!descriptor.with_credentials;
            for (const [key, value] of Object.entries(descriptor.headers || {}))
              xhr.setRequestHeader(key, value);
            if (
              descriptor.with_credentials &&
              typeof location !== "undefined"
            ) {
              const action = new URL(
                descriptor.attributes.action,
                location.href,
              );
              sameOriginCredentialed = action.origin === location.origin;
              const hasCsrf = Object.keys(descriptor.headers || {}).some(
                (key) =>
                  ["x-csrf-token", "x-xsrf-token"].includes(key.toLowerCase()),
              );
              if (
                sameOriginCredentialed &&
                !hasCsrf &&
                typeof document !== "undefined"
              ) {
                const token = document
                  .querySelector('meta[name="csrf-token"]')
                  ?.getAttribute("content");
                if (token) xhr.setRequestHeader("X-CSRF-TOKEN", token);
              }
            }
            if (descriptor.direct_file) xhr.send(entry.file);
            else {
              const form = new FormData();
              for (const [key, value] of Object.entries(
                descriptor.inputs || {},
              ))
                form.append(key, String(value));
              form.append("file", entry.file!, record.name);
              xhr.send(form);
            }
          } catch {
            finish("unsupported");
          }
        });
        if (
          !current() ||
          (record.status as ProductFileUploadStatus) === "cancelled"
        )
          return;
        entry.uploaded = true;
        record.sent = record.size;
        record.progress = 100;
      }
      record.status = "confirming";
      attempt.status = "confirming";
      record.history = attempt.history;
      record.speed = null;
      record.eta = null;
      changed();
      const confirmed = await options.confirm(
        entry.fileItem!,
        entry.controller.signal,
      );
      if (!current()) return;
      if (!confirmed)
        throw options.isFileAvailable(record.fileId!)
          ? "confirmation"
          : "removed";
      record.status = "done";
      record.completedOrder = ++completedOrder;
      entry.file = null;
      entry.descriptor = undefined;
      entry.fileItem = undefined;
    } catch (error) {
      if (!current()) return;
      if (record.status === "cancelled") return;
      const known = [
        "network",
        "transfer",
        "timeout",
        "expired",
        "confirmation",
        "unsupported",
        "pending_reservation",
        "removed",
      ];
      record.errorKey = (
        known.includes(error as string)
          ? error
          : entry.uploaded
            ? "confirmation"
            : entry.descriptor
              ? "network"
              : "authorize"
      ) as ProductFileUploadError;
      record.status = "error";
      record.speed = null;
      record.eta = null;
      record.canRetry = !!entry.file;
    } finally {
      entry.busy = false;
      entry.controller = undefined;
      entry.abortTransfer = undefined;
      active--;
      if (current()) {
        attempt.status = record.status;
        if (["done", "error", "cancelled"].includes(record.status)) {
          record.speed = null;
          record.eta = null;
        }
        record.canDismiss =
          record.status === "error" || record.status === "cancelled";
        if (record.canDismiss) record.canRetry = !!entry.file;
        changed();
      }
      pump();
    }
  }

  function add(files: Iterable<File>, limits: QueueLimits) {
    const added: ProductFileUploadRecord[] = [],
      rejected: {
        name: string;
        size: number;
        errorKey: ProductFileUploadError;
      }[] = [];
    if (disposed) return { added, rejected };
    const unmatched = records.filter(
      (record) =>
        ["queued", "authorizing"].includes(record.status) &&
        !limits.existingFiles.some(
          (file) =>
            Number(file.id) === record.fileId || file.name === record.name,
        ),
    );
    let count = limits.existingFiles.length + unmatched.length;
    let available =
      limits.availableBytes -
      unmatched.reduce((sum, record) => sum + record.size, 0);
    for (const file of files) {
      let errorKey: ProductFileUploadError | null = null;
      if (
        !(file instanceof File) ||
        !file.name ||
        !Number.isSafeInteger(file.size) ||
        file.size < 0
      )
        errorKey = "unsupported";
      else if (
        limits.existingFiles.some((item) => item.name === file.name) ||
        records.some(
          (item) => item.status !== "done" && item.name === file.name,
        )
      )
        errorKey = "duplicate";
      else if (file.size > limits.maxFileBytes) errorKey = "too_large";
      else if (count >= PRODUCT_FILE_UPLOAD_COUNT_LIMIT)
        errorKey = "file_limit";
      else if (file.size > available) errorKey = "capacity";
      if (errorKey) {
        rejected.push({
          name: file?.name || "",
          size: file?.size || 0,
          errorKey,
        });
        continue;
      }
      const record = reactive<ProductFileUploadRecord>({
        id: ++nextId,
        name: file.name,
        size: file.size,
        sent: 0,
        progress: 0,
        speed: null,
        eta: null,
        history: [],
        attempts: [],
        status: "queued",
        errorKey: null,
        canRetry: false,
        canDismiss: false,
        completedOrder: null,
      });
      records.push(record);
      entries.set(record.id, {
        file,
        authorizedAt: 0,
        authorizationStarted: false,
        uploaded: false,
        busy: false,
        generation: 0,
        needsRecovery: false,
      });
      added.push(record);
      count++;
      available -= file.size;
    }
    changed();
    pump();
    return { added, rejected };
  }

  function cancel(value: ProductFileUploadRecord | number) {
    const record = find(value),
      entry = record && entries.get(record.id);
    if (
      !record ||
      !entry ||
      entry.uploaded ||
      !["queued", "authorizing", "uploading"].includes(record.status)
    )
      return false;
    const signing = record.status === "authorizing";
    record.status = "cancelled";
    record.errorKey = entry.authorizationStarted
      ? "cancelled_reservation"
      : null;
    record.canRetry = !signing;
    record.canDismiss = !entry.busy;
    record.speed = null;
    record.eta = null;
    entry.abortTransfer?.();
    changed();
    pump();
    return true;
  }

  function retry(value: ProductFileUploadRecord | number) {
    const record = find(value),
      entry = record && entries.get(record.id);
    if (
      !record ||
      !entry ||
      entry.busy ||
      !record.canRetry ||
      !["error", "cancelled"].includes(record.status)
    )
      return false;
    entry.needsRecovery = true;
    record.status = "queued";
    record.canRetry = false;
    record.canDismiss = false;
    changed();
    pump();
    return true;
  }

  function dismiss(value: ProductFileUploadRecord | number) {
    const record = find(value),
      entry = record && entries.get(record.id);
    if (!record || !entry || entry.busy || !record.canDismiss) return false;
    entry.generation++;
    entry.file = null;
    entry.descriptor = undefined;
    entry.fileItem = undefined;
    entries.delete(record.id);
    records.splice(records.indexOf(record), 1);
    changed();
    return true;
  }

  function clearCompleted() {
    for (let index = records.length - 1; index >= 0; index--)
      if (records[index].status === "done") {
        entries.delete(records[index].id);
        records.splice(index, 1);
      }
    changed();
  }

  function dispose() {
    disposed = true;
    for (const entry of entries.values()) {
      entry.generation++;
      entry.controller?.abort();
      entry.abortTransfer?.();
      entry.descriptor = undefined;
      entry.fileItem = undefined;
      entry.file = null;
    }
    entries.clear();
    records.splice(0);
    changed();
  }

  return { records, add, cancel, retry, dismiss, clearCompleted, dispose };
}
