<!--
    This page provide manage of compound control
 -->

<script lang="ts">
import comp from "~/components/DbCompoundShowList.vue";
import banner from "~/components/BannerMain.vue";
import extras from "~/components/ExtrasNav.vue";
import login from "~/components/LoginForm.vue";
import bug from "~/components/BugButton.vue";
import { useCookie } from "nuxt/app";

export default{
    components:{
        comp,
        login,
        banner,
        extras,
        bug
    },
    data(){
        return {
            checkSession: false,
            tab: "reference"
        };
    },
    created:async function() {
        const token = useCookie("token",{sameSite:"strict"});
        const team = useCookie("team",{sameSite:"strict"});
 
        if (!token.value || !team.value){
            this.checkSession = false;
            return null;
        }

        this.checkSession = await $fetch("/api/checkToken", {
            method: "POST",
            headers:{
                "Content-Type":"text/plain"
            },
            body: token.value.toString()
        });
    },
    methods:{
        t(params:string) {
            const {t} = useI18n();
            return t(params);
        }
    }
    
};


</script>

<template>
  <UCard> 
    <UNotifications />
    <template
      v-if="checkSession" 
      #header
    >
      <UContainer class="flex justify-between">
        <banner />
        <extras link-to="" />
      </UContainer>
    </template>
  
    <template
      v-else
      #header
    >
      <UContainer class="flex justify-between">
        <banner />
      </UContainer>
      <login />
    </template>
    <UContainer v-if="checkSession">
      <div class="d-flex flex-row">
        <v-tabs
          v-model="tab"
          direction="vertical"
        >
          <v-tab value="reference">
            <v-icon start>
              mdi-beaker-outline
            </v-icon>
            {{ t("tabs.reference") }}
          </v-tab>
          <v-tab value="machine">
            <v-icon start>
              mdi-washing-machine
            </v-icon>
            {{ t("tabs.machine") }}
          </v-tab>
          <v-tab value="fitting">
            <v-icon start>
              mdi-scale-balance
            </v-icon>
            {{ t("tabs.fitting") }}
          </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item value="reference">
            <v-card flat>
              <v-card-text>
                <comp
                  name-table="compound"
                />
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item value="machine">
            <v-card flat>
              <v-card-text>
                <p>
                  Morbi nec metus. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci. Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Nunc sed turpis.
                </p>

                <p>
                  Suspendisse feugiat. Suspendisse faucibus, nunc et pellentesque egestas, lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. In hac habitasse platea dictumst. Fusce ac felis sit amet ligula pharetra condimentum.
                </p>

                <p>
                  Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Nam commodo suscipit quam. In consectetuer turpis ut velit. Sed cursus turpis vitae tortor. Aliquam eu nunc.
                </p>

                <p>
                  Etiam ut purus mattis mauris sodales aliquam. Ut varius tincidunt libero. Aenean viverra rhoncus pede. Duis leo. Fusce fermentum odio nec arcu.
                </p>

                <p class="mb-0">
                  Donec venenatis vulputate lorem. Aenean viverra rhoncus pede. In dui magna, posuere eget, vestibulum et, tempor auctor, justo. Fusce commodo aliquam arcu. Suspendisse enim turpis, dictum sed, iaculis a, condimentum nec, nisi.
                </p>
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item value="fitting">
            <v-card flat>
              <v-card-text>
                <p>
                  Fusce a quam. Phasellus nec sem in justo pellentesque facilisis. Nam eget dui. Proin viverra, ligula sit amet ultrices semper, ligula arcu tristique sapien, a accumsan nisi mauris ac eros. In dui magna, posuere eget, vestibulum et, tempor auctor, justo.
                </p>

                <p class="mb-0">
                  Cras sagittis. Phasellus nec sem in justo pellentesque facilisis. Proin sapien ipsum, porta a, auctor quis, euismod ut, mi. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nam at tortor in tellus interdum sagittis.
                </p>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </div>
    </UContainer>

    <!-- <bug v-else /> -->
    <template 
      #footer
    >
      <bug />
    </template>
  </UCard>
</template>