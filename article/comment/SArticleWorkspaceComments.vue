<template>
  <section class="s-article-workspace-comments text-start" @keydown.esc.stop.prevent="escapeEditor()">
    <header class="s-article-workspace-comments__heading">
      <div><h1>{{ $t('global.article.workspace.comments') }}</h1><p>{{ $t('global.article.workspace.comments_subtitle') }}</p></div>
      <v-btn v-if="user && loaded" ref="primary" class="sd-modern-button s-article-workspace-comments__action" color="primary" variant="flat" :prepend-icon="active_own ? 'edit' : 'add'" :disabled="disabled || busy_read || busy_write" @click="openComposer()">{{ t(active_own ? 'edit_mine' : 'add') }}</v-btn>
    </header>

    <div class="s-article-workspace-comments__widget sd-modern-widget" :aria-label="t('title')" :aria-busy="busy_read || busy_write">
      <div class="s-article-workspace-comments__toolbar">
        <div class="s-article-workspace-comments__count">{{ t('title') }} <span>{{ loaded ? total : '—' }}</span></div>
        <div class="s-article-workspace-comments__order"><span>{{ t('newest_first') }}</span><v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('refresh')" :disabled="disabled || busy_read || busy_write" @click="requestRefresh()"><v-icon icon="refresh" size="16" aria-hidden="true" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('refresh') }}</v-tooltip></v-btn></div>
      </div>

      <div v-if="mode === 'add'" class="s-article-workspace-comments__compose">
        <v-textarea ref="newInput" v-model="draft" :label="t('body')" :placeholder="t('placeholder')" variant="outlined" rows="4" auto-grow persistent-placeholder dir="auto" :disabled="busy_write || disabled" hide-details />
        <p class="s-article-workspace-comments__form-note">{{ t('one_per_article') }}</p>
        <p v-if="write_error" class="s-article-workspace-comments__error sd-modern-notice" role="alert">{{ write_error }}</p>
        <div class="s-article-workspace-comments__detail-footer"><small>{{ t('public_hint') }}</small><div class="s-article-workspace-comments__buttons"><v-btn class="sd-modern-button s-article-workspace-comments__action" variant="text" :disabled="busy_write" @click="cancelEditor()">{{ t('cancel') }}</v-btn><v-btn class="sd-modern-button s-article-workspace-comments__action" color="primary" variant="flat" prepend-icon="send" :loading="busy_write" :disabled="disabled" @click="saveComment()">{{ t('post') }}</v-btn></div></div>
      </div>

      <div v-if="read_error" class="s-article-workspace-comments__read-error sd-modern-notice" role="status"><v-icon icon="cloud_off" size="20" aria-hidden="true" /><div><h2>{{ t('load_error_title') }}</h2><p>{{ read_error }}</p></div><v-btn class="sd-modern-button s-article-workspace-comments__action" variant="outlined" prepend-icon="refresh" :disabled="disabled || busy_read || busy_write" @click="fetchComments(failed_refresh)">{{ t('retry') }}</v-btn></div>
      <div v-if="busy_read && !loaded" class="s-article-workspace-comments__empty" role="status"><h2>{{ t('loading') }}</h2><v-skeleton-loader type="list-item-two-line@3" /></div>
      <div v-else-if="loaded && !comments.length" class="s-article-workspace-comments__empty sd-modern-empty-state"><v-icon icon="forum" size="26" aria-hidden="true" /><h2>{{ t('empty_title') }}</h2><p>{{ t('empty_description') }}</p><slot v-if="!user" name="login"></slot></div>

      <template v-if="comments.length">
        <div class="s-article-workspace-comments__columns sd-modern-list-header" aria-hidden="true"><span>{{ t('author') }}</span><span>{{ t('comment') }}</span><span>{{ t('reply') }}</span><span>{{ t('updated') }}</span><span>{{ t('actions') }}</span></div>
        <div :aria-label="t('title')">
          <article v-for="comment in comments" :key="comment.id" class="s-article-workspace-comments__entry" :class="{ 's-article-workspace-comments__entry--open': expanded_id === comment.id }">
            <div class="s-article-workspace-comments__row">
              <v-tooltip :disabled="!truncated[comment.id]" location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
                <template #activator="{ props }">
              <button ref="rowButtons" v-bind="props" type="button" class="s-article-workspace-comments__open sd-modern-clickable-item" :data-comment-id="comment.id" :aria-label="t('open') + ' · ' + authorName(comment)" :aria-expanded="expanded_id === comment.id" :aria-controls="detailId(comment)" :aria-describedby="`${props['aria-describedby'] ? props['aria-describedby'] + ' ' : ''}${detailId(comment)}-excerpt ${detailId(comment)}-status ${detailId(comment)}-date`" :disabled="busy_write" @click="toggleComment(comment)">
                <span class="s-article-workspace-comments__author"><v-avatar size="30" class="avatar-gradient -thin -user hover-scale force-top"><img :src="getUserAvatar(comment.user_id)" alt="" /></v-avatar><span><span class="s-article-workspace-comments__author-name">{{ authorName(comment) }}</span><span v-if="owned(comment)" class="s-article-workspace-comments__you">{{ t('you') }}</span></span></span>
                <span :id="`${detailId(comment)}-excerpt`" v-overflow-check="(value) => { truncated[comment.id] = value; }" class="s-article-workspace-comments__excerpt" dir="auto">{{ comment.body }}</span>
                <span :id="`${detailId(comment)}-status`" class="s-article-workspace-comments__status"><span class="sd-modern-status__dot" :class="comment.deleted_at ? 'sd-modern-status__dot--error' : comment.reply ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--warning'" aria-hidden="true"></span>{{ t(comment.deleted_at ? 'deleted_label' : comment.reply ? 'replied' : 'no_reply') }}</span>
                <time :id="`${detailId(comment)}-date`" class="s-article-workspace-comments__date" :datetime="comment.updated_at || comment.created_at">{{ getLocalDateString(comment.updated_at || comment.created_at) }}</time>
              </button>
                </template>{{ comment.body }}
              </v-tooltip>
              <div class="s-article-workspace-comments__row-actions">
                <template v-if="owned(comment)">
                  <v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('edit')" :disabled="disabled || busy_read || busy_write" @click="startEdit(comment)"><v-icon icon="edit" size="16" aria-hidden="true" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('edit') }}</v-tooltip></v-btn>
                  <v-btn v-if="!comment.deleted_at" class="sd-modern-icon-button" icon variant="text" :aria-label="t('delete')" :disabled="disabled || busy_read || busy_write" @click="confirmDelete(comment)"><v-icon icon="delete_outline" size="16" aria-hidden="true" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('delete') }}</v-tooltip></v-btn>
                </template>
                <v-btn v-else class="sd-modern-icon-button" icon variant="text" :aria-label="t(expanded_id === comment.id ? 'close' : 'open')" :disabled="busy_write" @click="toggleComment(comment)"><v-icon :icon="expanded_id === comment.id ? 'expand_less' : 'expand_more'" size="16" aria-hidden="true" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t(expanded_id === comment.id ? 'close' : 'open') }}</v-tooltip></v-btn>
              </div>
            </div>

            <div v-if="expanded_id === comment.id" :id="detailId(comment)" class="s-article-workspace-comments__detail">
              <div class="s-article-workspace-comments__detail-heading"><span>{{ t('details') }} · #{{ comment.id }}</span><v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="t('close')" :disabled="busy_write" @click="toggleComment(comment)"><v-icon icon="close" size="16" aria-hidden="true" /><v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ t('close') }}</v-tooltip></v-btn></div>
              <div v-if="mode === 'delete'" class="s-article-workspace-comments__delete sd-modern-panel"><h2>{{ t('delete_title') }}</h2><p>{{ t('delete_message') }}</p><p v-if="write_error" class="sd-modern-notice" role="alert">{{ write_error }}</p><div class="s-article-workspace-comments__buttons"><v-btn class="sd-modern-button s-article-workspace-comments__action" variant="text" :disabled="busy_write" @click="cancelEditor()">{{ t('cancel') }}</v-btn><v-btn class="sd-modern-button s-article-workspace-comments__action" variant="outlined" color="error" prepend-icon="delete_outline" :loading="busy_write" :disabled="disabled" @click="deleteComment()">{{ t('delete_confirm') }}</v-btn></div></div>
              <div v-else-if="mode === 'edit'" class="s-article-workspace-comments__editor">
                <v-textarea ref="editInput" v-model="draft" :label="t('body')" variant="outlined" rows="4" auto-grow dir="auto" :disabled="busy_write || disabled" hide-details />
                <p class="s-article-workspace-comments__form-note">{{ t('one_per_article') }}</p><p v-if="write_error" class="s-article-workspace-comments__error sd-modern-notice" role="alert">{{ write_error }}</p>
                <div class="s-article-workspace-comments__detail-footer"><small>{{ t('public_hint') }}</small><div class="s-article-workspace-comments__buttons"><v-btn class="sd-modern-button s-article-workspace-comments__action" variant="text" :disabled="busy_write" @click="cancelEditor()">{{ t('cancel') }}</v-btn><v-btn class="sd-modern-button s-article-workspace-comments__action" color="primary" variant="flat" prepend-icon="save" :loading="busy_write" :disabled="disabled" @click="saveComment()">{{ t('save') }}</v-btn></div></div>
              </div>
              <div v-else>
                <div class="s-article-workspace-comments__detail-meta"><span>{{ t('posted') }} <bdi>{{ getLocalTimeString(comment.created_at) }}</bdi></span><span v-if="comment.updated_at">{{ t('updated') }} <bdi>{{ getLocalTimeString(comment.updated_at) }}</bdi></span></div><p class="s-article-workspace-comments__full" dir="auto">{{ comment.body }}</p>
                <div v-if="comment.reply" class="s-article-workspace-comments__reply"><div class="s-article-workspace-comments__reply-heading"><v-icon icon="storefront" size="16" aria-hidden="true" />{{ t(comment.deleted_at ? 'removal_reason' : 'merchant_reply') }}</div><p class="s-article-workspace-comments__full" dir="auto">{{ comment.reply }}</p></div>
                <div v-if="owned(comment)" class="s-article-workspace-comments__detail-footer"><small>{{ t('one_per_article') }}</small><v-btn class="sd-modern-button s-article-workspace-comments__action" variant="outlined" prepend-icon="edit" :disabled="disabled || busy_read || busy_write" @click="startEdit(comment)">{{ t('edit') }}</v-btn></div>
              </div>
            </div>
          </article>
        </div>
      </template>

      <footer v-if="loaded && comments.length" class="s-article-workspace-comments__footer sd-modern-table-footer"><span>{{ t('loaded_summary', { loaded: active_count, total }) }}</span><v-btn v-if="more" class="sd-modern-button s-article-workspace-comments__action" variant="outlined" append-icon="expand_more" :loading="busy_read" :disabled="disabled || busy_write" @click="fetchComments(false)">{{ t('load_more') }}</v-btn><span v-else>{{ t('all_loaded') }}</span></footer>
      <slot v-if="!user && comments.length" name="login"></slot>
    </div>
    <p class="s-article-workspace-comments__notice" role="status" aria-live="polite">{{ notice }}</p>

    <v-dialog v-model="discard_open" max-width="440" :persistent="busy_write" @after-leave="focusEditor()">
      <v-card class="s-article-workspace-comments__discard sd-modern-widget text-start"><v-card-title>{{ t('discard_title') }}</v-card-title><v-card-text>{{ t('discard_message') }}</v-card-text><v-card-actions><v-spacer /><v-btn class="sd-modern-button s-article-workspace-comments__action" variant="text" @click="discard_open = false; pending_action = null">{{ $t('global.article.workspace.leave_cancel') }}</v-btn><v-btn class="sd-modern-button s-article-workspace-comments__action" color="primary" variant="flat" @click="discardChanges()">{{ t('discard_confirm') }}</v-btn></v-card-actions></v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

// Recheck actual two-line overflow after content or available width changes.
const overflowCheck = {
  mounted(element, binding) {
    const state = { notify: binding.value, observer: null, measure: null };
    state.measure = () => state.notify(element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1);
    if (typeof ResizeObserver !== 'undefined') { state.observer = new ResizeObserver(state.measure); state.observer.observe(element); }
    element._articleCommentOverflow = state;
    state.measure();
  },
  updated(element, binding) { const state = element._articleCommentOverflow; if (state) { state.notify = binding.value; state.measure(); } },
  beforeUnmount(element) { element._articleCommentOverflow?.observer?.disconnect(); delete element._articleCommentOverflow; },
};

export default {
  name: "SArticleWorkspaceComments",
  mixins: [DateMixin],
  directives: { overflowCheck },
  emits: ["dirty", "busy", "count"],
  props: {
    articleId: { type: Number, required: true }, articleUserId: Number, shopId: [Number, String],
    forProduct: { type: Boolean, default: false }, isSelldone: Boolean, isShop: Boolean,
    active: { type: Boolean, default: true }, disabled: { type: Boolean, default: false },
  },
  data: () => ({ comments: [], total: 0, offset: 0, limit: 10, more: false, loaded: false,
    busy_read: false, busy_write: false, read_error: "", write_error: "", failed_refresh: true,
    expanded_id: null, mode: "view", draft: "", original: "",
    discard_open: false, pending_action: null, notice: "", truncated: {} }),
  computed: {
    user() { return this.USER(); },
    identity() { return `${this.shopId ?? ''}:${this.articleId}:${this.USER_ID() ?? ''}:${this.forProduct}`; },
    active_own() { return this.comments.find((comment) => this.owned(comment) && !comment.deleted_at); },
    active_count() { return this.comments.filter((comment) => !comment.deleted_at).length; },
    dirty() { return ['add', 'edit'].includes(this.mode) && this.draft !== this.original; },
  },
  watch: {
    active(value) { if (!value) { this.discard_open = false; this.pending_action = null; } else if (!this.loaded) this.fetchComments(true); },
    disabled(value) { if (!value && this.active && !this.loaded) this.fetchComments(true); },
    identity() { this.reset(); if (this.active) this.fetchComments(true); },
    dirty(value) { this.$emit('dirty', value); },
    busy_write(value) { this.$emit('busy', value); },
  },
  created() { this._generation = 0; this._readRequest = 0; if (this.active) this.fetchComments(true); },
  beforeUnmount() { this._unmounted = true; this._generation++; this.$emit('dirty', false); this.$emit('busy', false); },
  methods: {
    t(key, params) { return this.$t(`global.article.workspace.comments_list.${key}`, params); },
    context() { return { generation: this._generation, identity: this.identity }; },
    current(context) { return !this._unmounted && context.generation === this._generation && context.identity === this.identity; },
    sameArticle(comment) { return comment?.article_id === this.articleId && comment.id != null; },
    owned(comment) { return !!this.USER() && this.sameArticle(comment) && comment.user_id === this.USER_ID() && (comment.user?.id == null || comment.user.id === comment.user_id); },
    authorName(comment) { return comment.user?.name || this.$t('global.commons.not_set'); },
    detailId(comment) { return `article-${this.articleId}-comment-${comment.id}`; },
    errorMessage(value, fallback) { return typeof value === 'string' ? value.slice(0, 1000) : this.t(fallback); },
    reset() {
      this._generation++; this._readRequest++;
      this.comments = []; this.total = 0; this.offset = 0; this.more = false; this.loaded = false;
      this.busy_read = false; this.busy_write = false; this.read_error = ''; this.write_error = '';
      this.expanded_id = null; this.mode = 'view'; this.draft = ''; this.original = '';
      this.discard_open = false; this.pending_action = null; this.notice = '';
      this.truncated = {};
    },
    mergeComments(rows, replace = false) {
      const records = new Map((replace ? [] : this.comments).map((comment) => [comment.id, comment]));
      for (const comment of rows) if (this.sameArticle(comment)) records.set(comment.id, { ...records.get(comment.id), ...comment });
      this.comments = [...records.values()].sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0) || Number(b.id) - Number(a.id));
    },
    fetchComments(refresh = false) {
      if (!this.active || this.disabled || this._unmounted || !this.articleId || this.busy_read || this.busy_write || (!refresh && !this.more)) return;
      const context = this.context(), request = ++this._readRequest, offset = refresh ? 0 : this.offset;
      this.busy_read = true; this.read_error = ''; this.failed_refresh = refresh;
      axios.get(window.GAPI.GET_COMMENTS(this.articleId), { params: { offset, limit: this.limit, product: this.forProduct, myself: true } })
        .then(({ data }) => {
          if (!this.current(context) || request !== this._readRequest) return;
          if (data.error || !Array.isArray(data.comments) || !Number.isFinite(data.count) || data.count < 0 || !Number.isFinite(data.offset) || data.offset < offset) { this.read_error = this.errorMessage(data.error_msg, refresh ? 'load_error_description' : 'load_more_error'); return; }
          // Keep the same excluded-mine offset collection on every page; merge own history separately.
          this.mergeComments([...data.comments, ...(Array.isArray(data.my_comments) ? data.my_comments : [])], refresh);
          this.offset = data.offset; this.more = data.more === true; this.total = data.count; this.loaded = true;
          this.$emit('count', this.total);
        })
        .catch((error) => { if (this.current(context) && request === this._readRequest) this.read_error = this.errorMessage(error?.response?.data?.error_msg, refresh ? 'load_error_description' : 'load_more_error'); })
        .finally(() => { if (this.current(context) && request === this._readRequest) this.busy_read = false; });
    },
    transition(action) {
      if (this.disabled || this.busy_write) return;
      if (this.dirty) { this.pending_action = { context: this.context(), action }; this.discard_open = true; return; }
      action();
    },
    discardChanges() {
      const pending = this.pending_action;
      this.discard_open = false; this.pending_action = null;
      if (pending && this.current(pending.context) && !this.busy_write && !this.disabled) pending.action();
    },
    clearEditor() { this.mode = 'view'; this.draft = ''; this.original = ''; this.write_error = ''; },
    requestRefresh() { this.transition(() => { this.clearEditor(); this.expanded_id = null; this.fetchComments(true); }); },
    focusRow(id) { this.$nextTick(() => { const row = this.$refs.rowButtons?.find((button) => String(button.dataset.commentId) === String(id)); if (row) row.focus(); else this.$refs.primary?.$el?.focus(); }); },
    toggleComment(comment) { this.transition(() => { this.clearEditor(); this.expanded_id = this.expanded_id === comment.id ? null : comment.id; if (this.expanded_id === null) this.focusRow(comment.id); }); },
    escapeEditor() { if (this.mode !== 'view') this.cancelEditor(); else if (this.expanded_id !== null) { const id = this.expanded_id; this.expanded_id = null; this.focusRow(id); } },
    focusEditor() { this.$nextTick(() => { if (!this.active) return; const input = this.mode === 'add' ? this.$refs.newInput : this.$refs.editInput?.[0]; input?.$el?.querySelector('textarea')?.focus(); }); },
    openComposer() {
      if (!this.active || !this.USER() || !this.loaded || this.busy_read || this.busy_write || this.disabled) return;
      if (this.active_own) return this.startEdit(this.active_own);
      this.transition(() => { this.clearEditor(); this.expanded_id = null; this.mode = 'add'; this.focusEditor(); });
    },
    startEdit(comment) {
      const row = this.comments.find((item) => item.id === comment.id);
      if (!this.active || !this.owned(row) || this.busy_read || this.busy_write || this.disabled) return;
      this.transition(() => { this.clearEditor(); this.expanded_id = row.id; this.mode = 'edit'; this.draft = row.body || ''; this.original = this.draft; this.focusEditor(); });
    },
    cancelEditor() { this.transition(() => { const id = this.expanded_id; this.clearEditor(); this.focusRow(id); }); },
    confirmDelete(comment) {
      const row = this.comments.find((item) => item.id === comment.id);
      if (!this.active || !this.owned(row) || row.deleted_at || this.busy_read || this.busy_write || this.disabled) return;
      this.transition(() => { this.clearEditor(); this.expanded_id = row.id; this.mode = 'delete'; });
    },
    saveComment() {
      if (!this.active || this.disabled || this.busy_read || this.busy_write || !this.USER() || !this.loaded || !['add', 'edit'].includes(this.mode)) return;
      const adding = this.mode === 'add', row = this.comments.find((item) => item.id === this.expanded_id), body = this.draft.trim();
      if (adding ? this.active_own : !this.owned(row)) return;
      if (!body) { this.write_error = this.t('required'); this.focusEditor(); return; }
      const context = this.context(), target = row?.id;
      this.busy_write = true; this.write_error = '';
      const request = adding ? axios.post(window.ARTICLE_API.POST_ADD_COMMENT(this.articleId), { body }) : axios.put(window.ARTICLE_API.PUT_UPDATE_COMMENT(target), { comment_id: target, body });
      request.then(({ data }) => {
        if (!this.current(context)) return;
        const updated = { ...(adding ? {} : row), ...data.comment };
        if (data.error || !data.comment || typeof data.comment.body !== 'string' || !this.owned(updated) || (!adding && updated.id !== target) || (adding && (!Number.isFinite(data.count) || data.count < 0))) { this.write_error = this.errorMessage(data.error_msg, adding ? 'post_error' : 'update_error'); return; }
        this.mergeComments([updated]); this.clearEditor(); this.expanded_id = updated.id; this.notice = this.t(adding ? 'added' : 'saved');
        if (adding) { this.total = data.count; this.$emit('count', this.total); }
      }).catch((error) => { if (this.current(context)) this.write_error = this.errorMessage(error?.response?.data?.error_msg, adding ? 'post_error' : 'update_error'); })
        .finally(() => { if (this.current(context)) this.busy_write = false; });
    },
    deleteComment() {
      const row = this.comments.find((item) => item.id === this.expanded_id);
      if (!this.active || this.disabled || this.busy_read || this.busy_write || this.mode !== 'delete' || !this.owned(row) || row.deleted_at) return;
      const context = this.context(), target = row.id;
      this.busy_write = true; this.write_error = '';
      axios.delete(window.ARTICLE_API.DELETE_COMMENT(target)).then(({ data }) => {
        if (!this.current(context)) return;
        const removed = { ...row, ...data.comment };
        if (data.error || data.success !== true || data.comment?.id !== target || !this.owned(removed) || !Number.isFinite(data.count) || data.count < 0) { this.write_error = this.errorMessage(data.error_msg, 'delete_error'); return; }
        if (removed.reply) this.mergeComments([removed]); else this.comments = this.comments.filter((item) => item.id !== target);
        this.total = data.count; this.$emit('count', this.total); this.clearEditor(); this.expanded_id = null; this.notice = this.t('deleted');
      }).catch((error) => { if (this.current(context)) this.write_error = this.errorMessage(error?.response?.data?.error_msg, 'delete_error'); })
        .finally(() => { if (this.current(context)) this.busy_write = false; });
    },
  },
};
</script>

<style lang="scss" scoped>
.s-article-workspace-comments {
  --comments-actions-width: 72px;
  min-width: 0; font-family: inherit; font-size: 13px; line-height: 20px; color: rgb(var(--v-theme-on-surface));
  .s-article-workspace-comments__heading { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-block-end: 22px; }
  .s-article-workspace-comments__heading h1 { margin: 0; font-family: inherit; font-size: 18px !important; font-weight: 500; line-height: 26px; }
  .s-article-workspace-comments__heading p { margin: 4px 0 0; font-size: 12px !important; line-height: 19px; color: var(--sd-modern-muted); }
  .s-article-workspace-comments__action { min-height: 36px; height: 36px; border-radius: 8px; padding-inline: 12px; font-family: inherit; font-size: 12px !important; font-weight: 500; line-height: 20px; text-transform: none; letter-spacing: 0; }
  .s-article-workspace-comments__action :deep(.v-btn__content) { font: inherit; letter-spacing: inherit; }
  .sd-modern-icon-button { --sd-modern-icon-button-size: 32px; border-radius: 7px; }
  .s-article-workspace-comments__widget { padding: 0 24px; border-radius: 18px; }
  .s-article-workspace-comments__toolbar { min-height: 64px; display: flex; justify-content: space-between; align-items: center; gap: 12px; border-block-end: 1px solid var(--sd-modern-border); }
  .s-article-workspace-comments__count { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; }
  .s-article-workspace-comments__count span, .s-article-workspace-comments__order { color: var(--sd-modern-muted); font-weight: 400; }
  .s-article-workspace-comments__order { display: flex; align-items: center; gap: 10px; font-size: 11px; }
  // The last data caption includes the open control's trailing inset before its separate actions.
  .s-article-workspace-comments__columns { display: grid; grid-template-columns: minmax(126px, 1.4fr) minmax(180px, 2.8fr) 92px 104px var(--comments-actions-width); gap: 14px; padding: 17px 12px 9px; }
  .s-article-workspace-comments__columns > :last-child { text-align: end; }
  .s-article-workspace-comments__entry { border-block-end: 1px solid var(--sd-modern-border); }
  .s-article-workspace-comments__entry--open { background: var(--sd-modern-inset); }
  .s-article-workspace-comments__row { display: flex; align-items: center; gap: 14px; min-height: 88px; }
  .s-article-workspace-comments__open { display: grid; grid-template-columns: minmax(126px, 1.4fr) minmax(180px, 2.8fr) 92px 92px; align-items: center; gap: 14px; flex: 1; min-width: 0; border: 0; background: transparent; padding: 16px 12px; text-align: start; color: inherit; font-family: inherit; }
  .s-article-workspace-comments__author { display: flex; align-items: center; gap: 9px; min-width: 0; }
  .s-article-workspace-comments__author img { width: 100%; height: 100%; object-fit: cover; }
  .s-article-workspace-comments__author-name { display: block; font-size: 12px; font-weight: 500; line-height: 18px; overflow-wrap: anywhere; }
  .s-article-workspace-comments__you { display: block; font-size: 10px; line-height: 15px; color: var(--sd-modern-muted); }
  .s-article-workspace-comments__excerpt { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
  .s-article-workspace-comments__status { display: flex; align-items: center; gap: 6px; font-size: 11px; line-height: 17px; }
  .s-article-workspace-comments__status .sd-modern-status__dot { flex-basis: 5px; width: 5px; height: 5px; }
  .s-article-workspace-comments__date { font-size: 11px; line-height: 17px; color: var(--sd-modern-muted); }
  .s-article-workspace-comments__row-actions { display: flex; justify-content: flex-end; gap: 6px; width: calc(var(--comments-actions-width) + 12px); padding-inline-end: 12px; flex-shrink: 0; }
  .s-article-workspace-comments__detail { padding: 4px 0 22px; display: grid; gap: 18px; }
  .s-article-workspace-comments__detail-heading { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding-block-start: 6px; font-size: 11px; color: var(--sd-modern-muted); }
  .s-article-workspace-comments__detail-meta { display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  .s-article-workspace-comments__full { margin: 8px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 14px !important; line-height: 23px; }
  .s-article-workspace-comments__reply { margin-block-start: 20px; padding-inline-start: 16px; border-inline-start: 2px solid var(--sd-modern-border); }
  .s-article-workspace-comments__reply-heading { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 500; color: var(--sd-modern-muted); }
  .s-article-workspace-comments__detail-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-block-start: 18px; }
  .s-article-workspace-comments__detail-footer small { color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .s-article-workspace-comments__buttons { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
  .s-article-workspace-comments__compose { padding: 22px 0; border-block-end: 1px solid var(--sd-modern-border); }
  .s-article-workspace-comments__form-note { margin: 7px 0 0; font-size: 11px !important; line-height: 18px; color: var(--sd-modern-muted); }
  .s-article-workspace-comments__compose :deep(textarea), .s-article-workspace-comments__editor :deep(textarea) { font-family: inherit; font-size: 14px; line-height: 23px; }
  .s-article-workspace-comments__delete { padding: 16px; }
  .s-article-workspace-comments__delete h2, .s-article-workspace-comments__read-error h2, .s-article-workspace-comments__empty h2 { margin: 0 0 6px; font-size: 15px !important; font-weight: 500; line-height: 22px; }
  .s-article-workspace-comments__delete p { margin: 0 0 12px; font-size: 13px !important; line-height: 20px; }
  .s-article-workspace-comments__error { margin: 12px 0 0; padding: 12px; font-size: 12px !important; line-height: 19px; }
  .s-article-workspace-comments__read-error { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; padding: 16px; margin-block: 18px; }
  .s-article-workspace-comments__read-error > div { flex: 1; min-width: 160px; }
  .s-article-workspace-comments__read-error p, .s-article-workspace-comments__empty p { margin: 0; font-size: 12px !important; line-height: 19px; color: var(--sd-modern-muted); }
  .s-article-workspace-comments__empty { padding: 64px 10px; text-align: center; }
  .s-article-workspace-comments__empty > .v-icon { color: var(--sd-modern-muted); margin-block-end: 12px; }
  .s-article-workspace-comments__footer { min-height: 70px; padding-inline: 0; font-size: 11px; color: var(--sd-modern-muted); }
  .s-article-workspace-comments__notice { min-height: 20px; margin: 10px 0 0; color: var(--sd-modern-muted); font-size: 12px !important; line-height: 19px; }
}
.s-article-workspace-comments__discard :deep(.v-card-title) { font-family: inherit; font-size: 18px; font-weight: 500; line-height: 26px; }
@media (max-width: 760px) {
  .s-article-workspace-comments {
    .s-article-workspace-comments__columns { grid-template-columns: minmax(105px, 1.25fr) minmax(130px, 2fr) 92px var(--comments-actions-width); }
    .s-article-workspace-comments__columns > :nth-child(4) { display: none; }
    .s-article-workspace-comments__open { grid-template-columns: minmax(105px, 1.25fr) minmax(130px, 2fr) 80px; }
    .s-article-workspace-comments__date { grid-column: 1; grid-row: 2; margin-inline-start: 39px; }
  }
}
@media (max-width: 640px) {
  .s-article-workspace-comments {
    .s-article-workspace-comments__heading { flex-wrap: wrap; align-items: start; }
    .s-article-workspace-comments__widget { padding-inline: 16px; }
    .s-article-workspace-comments__columns { display: none; }
    .s-article-workspace-comments__row { align-items: start; flex-wrap: wrap; gap: 0; padding-block: 16px; }
    .s-article-workspace-comments__open { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; padding: 12px; width: 100%; flex-basis: 100%; }
    .s-article-workspace-comments__author { grid-column: 1 / 3; grid-row: 1; }
    .s-article-workspace-comments__excerpt { grid-column: 1 / 3; grid-row: 2; -webkit-line-clamp: 3; }
    .s-article-workspace-comments__status { grid-column: 1; grid-row: 3; margin-block-start: 3px; }
    .s-article-workspace-comments__date { grid-column: 2; grid-row: 3; margin: 3px 0 0; justify-self: end; }
    .s-article-workspace-comments__row-actions { width: 100%; padding-inline: 12px; padding-block-start: 12px; }
    .s-article-workspace-comments__footer { flex-wrap: wrap; padding-block: 16px; gap: 12px; }
    .s-article-workspace-comments__order { gap: 6px; }
  }
}
@media (max-width: 640px), (pointer: coarse) {
  .s-article-workspace-comments { --comments-actions-width: 94px; }
  .s-article-workspace-comments .sd-modern-icon-button { --sd-modern-icon-button-size: 44px; }
  .s-article-workspace-comments .s-article-workspace-comments__action { min-height: 44px; height: auto; }
  .s-article-workspace-comments .s-article-workspace-comments__toolbar { min-height: 72px; }
}
</style>
