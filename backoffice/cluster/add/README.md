# Cluster editor

`BClusterAdd.vue` is the existing fullscreen add/edit form used by the Clusters list. Keep its name, description, nullable color, searchable parent, image and deletion flows together here.

Creation uploads the selected optional image with the new cluster. Editing keeps the existing image uploader: replacing an image is saved independently of metadata Save. The editor must retain its current shop context, category write checks, validation, loading/error handling, success events and Close behavior. Deletion keeps explicit verification followed by the final danger confirmation; cluster resources are not deleted.

`BClusterHelp.vue` is a separate inert explanation below the form. Its fictional Page, Incentive and Campaign symbols enter a cluster nested under a parent, then appear in Quick access. It receives no shop or resource data, exposes no operational controls and performs no requests. English/Persian copy lives under `classification_clusters.editor.help`.

The illustration reuses `sd-modern-illustration` tokens and outline/action grammar. Its desktop stage is a compact five-column flow with 32px connector slots; at 560px and below it stacks the cluster and quick-access view beneath a three-item resource row. Child labels stay at 12–13px. CSS runs once for 3.6 seconds, ends in the complete static explanation, and disables motion for reduced-motion preferences.

Run the isolated illustration check with `node --test @selldone/components-vue/backoffice/cluster/add/BClusterHelp.test.mjs`. Verify the integrated form in the existing local HMR session; do not submit live records merely to inspect the artwork.
