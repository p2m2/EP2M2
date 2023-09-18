<!--
    This module give access to help, profile, logout, home page 
 -->

<script setup lang="ts">
    import {ref, reactive} from 'vue';

    const altHome = ref<string>('Accueil');
    const altHelp = ref<string>('Aide');
    const altTopProfOut = ref<string>('Accéder au sous-menu profile et déconnection');
    const user = reactive<{firstName: string, secondName: string}>({
        firstName : 'Pierre',
        secondName : 'Dupond'
    });
    
    const aProfile = reactive<{href: string, title: string}>({
        href: '...',
        title: 'Profile'
    })
    const aLogout = reactive<{href: string, title: string}>({
        href: '...',
        title: 'LogOut'
    })

    function openLink (link: string): void {
        window.location.assign(link);
    } 
</script>

<style>
    menu {
        margin: 0;
        padding: 0;
        display: ruby;
    }

    li {
        list-style-type: none;
        position: relative;
        padding: 0.625rem 0.055rem 0 0.5rem;
    }

    li menu {
        flex-direction: column;
        position: absolute;
        background-color: rgba(255, 255, 255, 0);
        align-items: flex-start;
        transition: all 0.5s ease;
        width: 15rem;
        right: -1rem;
        top: 3rem;
        border-radius: 0.5rem;
        gap: 0;
        /* padding: 1rem 0rem; */
        opacity: 0;
        box-shadow: 0px 0px 100px rgba(20, 18, 18, 0.25);
        display: none;
    }

    menu li:hover > menu,
    menu li menu:hover {
        visibility: visible;
        opacity: 1;
        display: flex;
    }

    .topProfOut {
        height: 3rem;
        width: auto;
        cursor: pointer;
    }

    .bgGreen{
        background-color: var(--greenP2M2);
    }

    .subMenu {
        background-color: initial;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.725rem;
        cursor: pointer;
        padding: 0.5rem 1.5rem;
    }

    .profileName {
        background-color: var(--greenP2M2);
        color: var(--orangeP2M2);
        cursor: default;
    }

    a {
        color: black;
        text-decoration: none;
    }

    li:hover > a {
        transition: all 0.5s ease;
        color: var(--blueP2M2);
        font-weight: bolder;
    }
</style>

<template>
    <nav>
        <menu type="toolbar">
            <li>
                <img src="../ressource/image/home.svg" :alt="altHome" width="35">
            </li>
            <li>
                <img src="../ressource/image/help.svg" :alt="altHelp" width="35">
            </li>
            <li class="topProfOut">
                <img src="../ressource/image/profile.svg" :alt="altTopProfOut" width="35" class="bgGreen">
                <menu>
                    <li class="subMenu profileName">
                        <img src="../ressource/image/profile.svg" :alt="altTopProfOut" width="35">
                        <span>{{ user.firstName }} {{ user.secondName }}</span>
                    </li>
                    <li class="subMenu" @click="openLink(aProfile.href)">
                        <img src="../ressource/image/setting.svg" :alt="altTopProfOut" width="35">
                        <a v-bind="aProfile"> {{ aProfile.title }}</a>
                    </li>
                    <li class="subMenu" @click="openLink(aLogout.href)">
                        <img src="../ressource/image/logout.svg" :alt="altTopProfOut" width="35">
                        <a v-bind="aLogout"> {{ aLogout.title }}</a>
                    </li>
                </menu>
            </li>
        </menu>
    </nav>
</template>