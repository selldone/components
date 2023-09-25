<template>
    <div class="ntf">
        <div class="-bar">
            <v-icon :color="color" class="me-2" small>{{icon}}</v-icon>
            <b class="op-0-8">{{app}}</b>
            <v-spacer></v-spacer>
            <small>{{time}}</small>

        </div>
        <h3 class="-title">  {{title}}</h3>
         <p class="-msg">
             {{message}}
         </p>

    </div>
</template>

<script>
    export default {
        name: "NotificationView",
        props:{
            icon:{
                default:'chat_bubble'

            },
            color:{
                default:'green'
            },
            app:{
                default:'Message'
            },
            title:{
            },
            message:{
            },
            time:{
                default:'now'

            }

        }
    }
</script>

<style scoped lang="scss">
.ntf{

    margin: 2px 8px;
    background-color: rgba(250, 250, 250, 0.95);

    font-weight: 400;

    width: calc(100% - 16px);
    padding: 6px 8px;
    border-radius: 13px;

    .-bar{
        text-transform: uppercase;
        display: flex;
        align-items: center;
        font-size: 12px;
        font-weight: 400;
        small{
            text-transform: lowercase;
        }
    }

    .-title{
        font-size: 12px;
        font-weight: 600;
        margin: 0;
        color: #666;
    }
    .-msg{
        font-size: 12px;
        margin: 0;
    }
}
</style>