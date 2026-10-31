<template>
  <figure
    class="sd-modern-illustration b-cluster-help text-start"
    :class="{ 'b-cluster-help--rtl': $vuetify.locale.isRtl }"
  >
    <figcaption>
      <p class="sd-modern-eyebrow">
        {{ $t("classification_clusters.editor.help.eyebrow") }}
      </p>
      <h3 class="sd-modern-title-text">
        {{ $t("classification_clusters.editor.help.title") }}
      </h3>
      <p class="b-cluster-help__summary">
        {{ $t("classification_clusters.editor.help.summary") }}
      </p>
    </figcaption>

    <div class="b-cluster-help__stage" aria-hidden="true">
      <div class="b-cluster-help__resources">
        <div
          v-for="resource in resources"
          :key="resource"
          class="b-cluster-help__resource"
        >
          <svg
            class="sd-modern-illustration__icon"
            viewBox="0 0 24 24"
            focusable="false"
          >
            <path :d="paths[resource]" />
          </svg>
          <span>{{
            $t("classification_clusters.editor.help." + resource)
          }}</span>
        </div>
      </div>

      <div class="b-cluster-help__connector">
        <svg viewBox="0 0 40 24" fill="none" focusable="false">
          <path
            class="b-cluster-help__route"
            d="M2 12C12 12 28 12 37 12m-5-5 5 5-5 5"
            pathLength="100"
          />
        </svg>
      </div>

      <div class="b-cluster-help__group">
        <div class="b-cluster-help__parent">
          <svg
            class="sd-modern-illustration__icon"
            viewBox="0 0 24 24"
            focusable="false"
          >
            <path
              d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"
            />
          </svg>
          <span>{{ $t("classification_clusters.editor.help.parent") }}</span>
        </div>
        <span class="b-cluster-help__nest"></span>
        <div class="b-cluster-help__folder">
          <div class="b-cluster-help__folder-title">
            <svg
              class="sd-modern-illustration__icon"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <path
                d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"
              />
            </svg>
            <span>{{ $t("classification_clusters.editor.help.folder") }}</span>
          </div>
          <div class="b-cluster-help__contents">
            <div v-for="resource in resources" :key="resource">
              <svg
                class="sd-modern-illustration__icon"
                viewBox="0 0 24 24"
                focusable="false"
              >
                <path :d="paths[resource]" />
              </svg>
              <span>{{
                $t("classification_clusters.editor.help." + resource)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="b-cluster-help__connector b-cluster-help__connector--result">
        <svg viewBox="0 0 40 24" fill="none" focusable="false">
          <path
            class="b-cluster-help__route"
            d="M2 12C12 12 28 12 37 12m-5-5 5 5-5 5"
            pathLength="100"
          />
        </svg>
      </div>

      <div class="b-cluster-help__quick">
        <div
          class="sd-modern-illustration__action b-cluster-help__quick-heading"
        >
          <svg
            class="sd-modern-illustration__icon"
            viewBox="0 0 24 24"
            focusable="false"
          >
            <circle cx="12" cy="5" r="2.5" />
            <circle cx="5" cy="17" r="2.5" />
            <circle cx="19" cy="17" r="2.5" />
            <path d="m10.7 7.2-4.4 7.5m7-7.5 4.4 7.5M8 17h8" />
          </svg>
          <span>{{
            $t("classification_clusters.editor.help.quick_access")
          }}</span>
        </div>
        <div class="b-cluster-help__quick-folder">
          <svg
            class="sd-modern-illustration__icon"
            viewBox="0 0 24 24"
            focusable="false"
          >
            <path
              d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"
            />
          </svg>
          <span>{{ $t("classification_clusters.editor.help.folder") }}</span>
        </div>
      </div>
    </div>
  </figure>
</template>

<script lang="ts">
export default {
  name: "BClusterHelp",
  data: () => ({
    resources: ["page", "incentive", "campaign"],
    paths: {
      page: "M14 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9Zm0 0v6h6M8 13h8m-8 4h6",
      incentive:
        "M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4Zm6 0v12m4-7 4 4m-4 0 4-4",
      campaign: "m4 10 12-5v14L4 14Zm12-1 4-2v6l-4-2M5 15l2 6h4l-2-5",
    },
  }),
};
</script>

<style scoped lang="scss">
.b-cluster-help {
  min-width: 0;
  margin: 0;
  color: rgb(var(--v-theme-on-surface));

  .sd-modern-title-text {
    margin-block-start: 5px;
  }

  &__summary {
    margin: 7px 0 0;
    color: var(--sd-modern-muted);
    font-size: var(--sd-modern-font-small, 13px);
    font-weight: 400;
    line-height: 22px;
  }

  &__stage {
    display: grid;
    grid-template-columns:
      minmax(100px, 1fr) 32px minmax(150px, 1.2fr)
      32px minmax(100px, 0.9fr);
    align-items: center;
    min-width: 0;
    min-height: 210px;
    padding-block: 18px 8px;
    margin-block-start: 16px;
  }

  &__resources {
    display: grid;
    gap: 8px;
    min-width: 0;
    animation: cluster-help-resources 3.6s ease both;
  }

  &__resource {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 40px;
    min-width: 0;
    padding: 8px 10px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 10px;
    background: rgb(var(--v-theme-surface));
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    overflow-wrap: anywhere;

    > svg {
      width: 18px;
      height: 18px;
      color: rgb(var(--sd-modern-illustration-highlight-rgb));
    }
  }

  &__connector {
    display: grid;
    place-items: center;
    min-width: 0;
    color: rgb(var(--sd-modern-illustration-accent-rgb));

    > svg {
      width: 32px;
      height: 24px;
      transform: var(--cluster-help-arrow-transform, none);
    }
  }

  &--rtl {
    --cluster-help-arrow-transform: scaleX(-1);
  }

  &__route {
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 100;
    animation: cluster-help-route 3.6s ease both;
  }

  &__connector--result &__route {
    animation-name: cluster-help-result-route;
  }

  &__group {
    min-width: 0;
  }

  &__parent {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    min-width: 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 19px;
    text-align: center;
    overflow-wrap: anywhere;

    > svg {
      width: 17px;
      height: 17px;
    }
  }

  &__nest {
    display: block;
    width: 1px;
    height: 18px;
    margin: 5px auto 11px;
    background: var(--sd-modern-border);
  }

  &__folder {
    position: relative;
    min-width: 0;
    padding: 12px;
    border: 1px solid rgba(var(--sd-modern-illustration-accent-rgb), 0.28);
    border-radius: 14px;
    border-start-start-radius: 4px;
    background: rgb(var(--v-theme-surface));

    &::before {
      position: absolute;
      inset-block-start: -9px;
      inset-inline-start: 14px;
      width: 48px;
      height: 9px;
      content: "";
      border: 1px solid rgba(var(--sd-modern-illustration-accent-rgb), 0.28);
      border-block-end: 0;
      border-radius: 6px 6px 0 0;
      background: rgb(var(--v-theme-surface));
    }
  }

  &__folder-title,
  &__quick-folder {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    overflow-wrap: anywhere;

    > svg {
      width: 18px;
      height: 18px;
      color: rgb(var(--sd-modern-illustration-accent-rgb));
    }
  }

  &__contents {
    display: grid;
    gap: 6px;
    margin-block-start: 11px;
    animation: cluster-help-contents 3.6s ease both;

    > div {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      color: var(--sd-modern-muted);
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      overflow-wrap: anywhere;

      > svg {
        width: 15px;
        height: 15px;
      }
    }
  }

  &__quick {
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
    animation: cluster-help-quick 3.6s ease both;
  }

  &__quick-heading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 8px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 500;
    line-height: 19px;
    overflow-wrap: anywhere;

    > svg {
      width: 17px;
      height: 17px;
    }
  }

  &__quick-folder {
    margin-block-start: 12px;
    padding-inline: 2px;
    font-weight: 400;
  }

  @media (max-width: 560px) {
    &__stage {
      grid-template-columns: minmax(0, 1fr);
      min-height: 0;
      padding-block: 16px 0;
    }

    &__resources {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }

    &__resource {
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      padding: 8px 5px;
      font-size: 12px;
      line-height: 18px;
      text-align: center;
    }

    &__connector {
      --cluster-help-arrow-transform: rotate(90deg);
      height: 40px;
    }

    &__group {
      width: min(240px, 100%);
      margin-inline: auto;
    }

    &__quick {
      width: min(240px, 100%);
      margin-inline: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__resources,
    &__route,
    &__contents,
    &__quick {
      animation: none;
    }
  }
}

@keyframes cluster-help-resources {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  16%,
  100% {
    opacity: 1;
    transform: none;
  }
}

@keyframes cluster-help-route {
  0%,
  16% {
    stroke-dashoffset: 100;
  }
  44%,
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes cluster-help-contents {
  0%,
  35% {
    opacity: 0;
    transform: translateY(4px);
  }
  64%,
  100% {
    opacity: 1;
    transform: none;
  }
}

@keyframes cluster-help-result-route {
  0%,
  60% {
    stroke-dashoffset: 100;
  }
  84%,
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes cluster-help-quick {
  0%,
  70% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
</style>
