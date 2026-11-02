<template>
  <v-dialog
    :model-value="modelValue"
    :theme="overlayTheme"
    :aria-labelledby="`${$.uid}-layout-customize-title`"
    fullscreen
    transition="dialog-bottom-transition"
    @update:model-value="$emit('update:modelValue', $event)"
    @keydown.esc.capture="dismissCloseHelp"
  >
    <v-card
      ref="guideSurface"
      class="b-official-layout-customize sd-modern-canvas text-start"
    >
      <header class="b-official-layout-customize__header">
        <div class="b-official-layout-customize__header-inner">
          <v-icon size="24" aria-hidden="true">code</v-icon>
          <div>
            <h1 :id="`${$.uid}-layout-customize-title`">{{ t("title") }}</h1>
            <p>{{ layout.title }}</p>
          </div>
          <v-btn
            icon
            variant="text"
            class="sd-modern-icon-button b-official-layout-customize__close"
            :aria-label="$t('domain_layouts.close')"
            @click="close"
          >
            <v-icon size="18" aria-hidden="true">close</v-icon>
            <v-tooltip
              :model-value="closeHelp"
              activator="parent"
              location="top"
              open-on-focus
              content-class="sd-modern-tooltip text-start"
              @update:model-value="closeHelp = $event"
              >{{ $t("domain_layouts.close") }}</v-tooltip
            >
          </v-btn>
        </div>
      </header>
      <v-card-text class="b-official-layout-customize__scroll">
        <main class="b-official-layout-customize__content">
          <p class="b-official-layout-customize__intro">{{ t("intro") }}</p>
          <section class="sd-modern-widget b-official-layout-customize__widget">
            <ol class="sd-modern-steps">
              <li
                v-for="(step, index) in ['source', 'design', 'upload', 'apply']"
                :key="step"
                class="sd-modern-step"
              >
                <span class="sd-modern-step__number" aria-hidden="true">{{
                  index + 1
                }}</span>
                <h2 class="sd-modern-step__title">{{ t(`${step}_title`) }}</h2>
                <div class="sd-modern-step__body">
                  <p>{{ t(`${step}_help`) }}</p>
                  <v-btn
                    v-if="step === 'source' && repository"
                    :href="repository"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="text"
                    color="primary"
                    class="sd-modern-button sd-modern-button--inline"
                  >
                    {{ $t("domain_layouts.github_source")
                    }}<v-icon size="16" end aria-hidden="true"
                      >north_east</v-icon
                    >
                  </v-btn>
                  <v-btn
                    v-if="step === 'apply'"
                    :to="{ name: 'DeveloperLayoutsListPage' }"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="text"
                    color="primary"
                    class="sd-modern-button sd-modern-button--inline"
                  >
                    {{ $t("domain_layouts.manage_private")
                    }}<v-icon size="16" end aria-hidden="true"
                      >north_east</v-icon
                    >
                  </v-btn>
                </div>
              </li>
            </ol>
          </section>
          <section
            v-if="repository"
            class="sd-modern-widget b-official-layout-customize__widget"
            :aria-labelledby="`${$.uid}-layout-prompt-title`"
          >
            <div class="b-official-layout-customize__prompt-heading">
              <div>
                <h2 :id="`${$.uid}-layout-prompt-title`">
                  {{ t("prompt_title") }}
                </h2>
                <p>{{ t("prompt_help") }}</p>
              </div>
              <v-btn
                color="primary"
                variant="elevated"
                class="sd-modern-button sd-modern-button--primary b-official-layout-customize__copy"
                :loading="copying"
                :disabled="!modelValue"
                @click="copyPrompt"
              >
                <v-icon size="16" start aria-hidden="true">content_copy</v-icon
                >{{ t("copy_prompt") }}
              </v-btn>
            </div>
            <p class="b-official-layout-customize__prompt" dir="ltr" lang="en">
              {{ prompt }}
            </p>
            <p
              class="b-official-layout-customize__copy-status"
              role="status"
              aria-live="polite"
            >
              {{ t(copyState || "copy_help") }}
            </p>
          </section>
          <p class="b-official-layout-customize__footnote">{{ t("footer") }}</p>
        </main>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export function officialLayoutRepository(value: unknown): string {
  if (typeof value !== "string" || value.length > 1024 || /\s/.test(value))
    return "";
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "github.com" ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash
    )
      return "";
    if (!/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(url.pathname))
      return "";
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.some((part) => part === "." || part === "..")) return "";
    return `https://github.com/${parts.join("/")}`;
  } catch {
    return "";
  }
}

export default {
  name: "BOfficialLayoutCustomizeDialog",
  props: {
    modelValue: Boolean,
    layout: { type: Object, required: true },
  },
  emits: ["update:modelValue"],
  data: () => ({
    copying: false,
    copyState: "",
    copyRequest: 0,
    closeHelp: false,
  }),
  computed: {
    repository() {
      return officialLayoutRepository(this.layout?.github_url);
    },
    overlayTheme() {
      return this.USER()?.preferences?.dark ? "dark" : undefined;
    },
    prompt() {
      return this.repository
        ? this.t("prompt", { source_url: this.repository })
        : "";
    },
  },
  watch: {
    modelValue(open) {
      if (!open) {
        this.copyRequest++;
        this.copying = false;
        this.copyState = "";
        this.closeHelp = false;
      }
    },
  },
  beforeUnmount() {
    this.copyRequest++;
  },
  methods: {
    t(key, values = {}) {
      return this.$t(`domain_layouts.customize.${key}`, values);
    },
    close() {
      this.$emit("update:modelValue", false);
    },
    dismissCloseHelp(event) {
      if (!this.closeHelp) return;
      event.preventDefault();
      event.stopPropagation();
      this.closeHelp = false;
    },
    async copyPrompt() {
      if (!this.modelValue || !this.prompt || this.copying) return;
      const request = ++this.copyRequest;
      this.copying = true;
      this.copyState = "";
      let copied = false;
      try {
        await navigator.clipboard.writeText(this.prompt);
        copied = true;
      } catch {
        if (request !== this.copyRequest) return;
        // Use the existing guide's focus-safe fallback; Core's helper reports success even when copying fails.
        const activator = document.activeElement as HTMLElement | null;
        const input = document.createElement("textarea");
        input.value = this.prompt;
        input.readOnly = true;
        input.style.position = "fixed";
        input.style.opacity = "0";
        this.$refs.guideSurface.$el.appendChild(input);
        try {
          input.select();
          copied = document.execCommand("copy") === true;
        } catch {
          copied = false;
        } finally {
          input.remove();
          if (activator?.isConnected) activator.focus();
        }
      }
      if (request !== this.copyRequest) return;
      this.copying = false;
      this.copyState = copied ? "copied" : "copy_unavailable";
    },
  },
};
</script>

<style scoped lang="scss">
.b-official-layout-customize.v-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 0;
  border-radius: 0;
  color: rgb(var(--v-theme-on-surface));
  font: inherit;
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 23px;
}
.b-official-layout-customize {
  &__header {
    flex: 0 0 auto;
    background: rgb(var(--v-theme-surface));
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__header-inner {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 880px;
    margin-inline: auto;
    padding: 16px 24px;
    > div {
      flex: 1;
      min-width: 0;
    }
    > .v-btn {
      flex-shrink: 0;
    }
  }
  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
  }
  h2:not(.sd-modern-step__title) {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
  }
  :where(p) {
    margin: 0;
    font-size: var(--sd-modern-font-body, 14px);
    line-height: 23px;
    overflow-wrap: anywhere;
  }
  &__header p,
  &__prompt-heading p,
  &__copy-status,
  &__footnote {
    color: var(--sd-modern-muted);
    font-size: var(--sd-modern-font-small, 13px);
    line-height: 22px;
  }
  &__scroll.v-card-text {
    flex: 1;
    min-height: 0;
    padding: 0;
    overflow-y: auto;
  }
  &__content {
    width: 100%;
    max-width: 880px;
    margin-inline: auto;
    padding: 24px;
  }
  &__intro {
    margin-block-end: 20px;
  }
  &__widget {
    padding: 24px;
    margin-block-end: 20px;
  }
  .sd-modern-step__body > .v-btn {
    margin-block-start: 8px;
  }
  &__prompt-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    margin-block-end: 16px;
  }
  &__prompt {
    white-space: pre-wrap;
    text-align: start;
    background: var(--sd-modern-inset);
    padding: 16px;
    border-radius: 12px;
  }
  &__copy-status {
    min-height: 22px;
    margin-block-start: 10px;
  }
  .sd-modern-button {
    white-space: normal;
  }
  @media (max-width: 600px) {
    &__header-inner,
    &__content {
      padding: 16px;
    }
    &__widget {
      padding: 20px 16px;
    }
  }
}
</style>
