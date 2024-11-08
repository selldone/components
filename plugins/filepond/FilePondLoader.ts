/*
 * Copyright (c) 2024. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */
// src/utils/FilePondLoader.ts
import { defineAsyncComponent } from 'vue';

class FilePondLoader {
    // Static method to load FilePond asynchronously
    static loadFilePondComponent() {
        return defineAsyncComponent(async () => {
            // Dynamically import FilePond and its plugins
            const [
                { default: vueFilePond },
                { default: FilePondPluginFileValidateType },
                { default: FilePondPluginImagePreview },
                { default: FilePondPluginImageTransform },
                { default: FilePondPluginImageResize },
                { default: FilePondPluginFileValidateSize },
            ] = await Promise.all([
                import('vue-filepond'),
                import('filepond-plugin-file-validate-type'),
                import('filepond-plugin-image-preview'),
                import('filepond-plugin-image-transform'),
                import('filepond-plugin-image-resize'),
                import('filepond-plugin-file-validate-size'),
            ]);

            // Dynamically import CSS files
            await Promise.all([
                import('filepond/dist/filepond.min.css'),
                import('filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'),
            ]);

            // Register FilePond plugins
            const FilePond = vueFilePond(
                FilePondPluginFileValidateType,
                FilePondPluginImagePreview,
                FilePondPluginImageTransform,
                FilePondPluginImageResize,
                FilePondPluginFileValidateSize
            );

            return FilePond;
        });
    }
}

export default FilePondLoader;

