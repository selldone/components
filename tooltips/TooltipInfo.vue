<template>
    <v-tooltip bottom max-width="420" color="#000">
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                    color="#666"
                    dark
                    v-bind="attrs"
                    v-on="on"
                    icon tile
                    small
            >
                <v-icon>help_center</v-icon>
            </v-btn>
        </template>
       <div class="pa-2 text-start">
           <slot></slot>
       </div>
    </v-tooltip>
</template>

<script>
export default {
    name: "TooltipInfo",

}
</script>

<style scoped>

</style>