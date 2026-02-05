<template>
  <div
    class="bg-black bg-center bg-no-repeat bg-cover"
    :style="!hasWallet ? 'background-image: url(/map.svg);' : ''"
  >
    <div class="container">
      <div class="relative">
        <div class="absolute left-0 top-64">
          <Logo/>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center min-h-screen py-128">
      <div class="container">
        <div class="mx-auto max-w-800">
          <div class="text-white md:px-6 mb-11 text-caption" v-if="!hasWallet">
            <h1 class="mb-2 text-white">
              Welcome to the <span class="edge-text">Edge</span>
            </h1>
            <p class="text-75opac">Create or restore an XE wallet to begin</p>
          </div>

          <div
            v-if="!hasWallet"
            class="grid grid-cols-1 gap-32 p-32 rounded-md md:grid-cols-2 bg-black-100"
            style="box-shadow: 0px 0px 100px 50px #000000"
          >
            <div>
              <h3 class="mb-18 text-gray">CREATE a new wallet</h3>
              <button class="w-full button button--success" @click="openCreateModal">
                Create wallet
              </button>
              <CreateModal :afterCreate="gotoOverview" :close="reset" :visible="modal === 'create'"/>
            </div>
            <div>
              <h3 class="mb-18 text-gray">restore an existing wallet</h3>
              <button class="w-full button button--outline-success" @click="openRestoreModal">
                Restore wallet
              </button>
              <RestoreModal :afterRestore="gotoOverview" :close="reset" :visible="modal === 'restore'"/>
            </div>
          </div>

          <div>
            <UnlockModal
              :afterUnlock="gotoOverview"
              :close="resetAuto"
              :switchToForgetModal="openForgetModal"
              :visible="modal === 'unlock'"
            />
            <ForgetModal :afterForget="reset" :close="resetAuto" :visible="modal === 'forget'"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.edge-text {
  color: #0ECC5F;
}
.text-75opac {
  opacity: 0.75;
}
</style>
<script>
import CreateModal from '@/components/index/CreateModal.vue'
import ForgetModal from '@/components/index/ForgetModal.vue'
import Logo from '@/components/Logo.vue'
import RestoreModal from '@/components/index/RestoreModal.vue'
import UnlockModal from '@/components/index/UnlockModal.vue'
import { mapState } from 'vuex'

export default {
  name: 'ViewIndex',
  title: 'Create or restore a wallet',
  components: {
    CreateModal,
    ForgetModal,
    Logo,
    RestoreModal,
    UnlockModal
  },
  data: function () {
    return {
      modal: ''
    }
  },
  computed: mapState({
    address: 'address',
    locked: 'locked',
    hasWallet: 'hasWallet'
  }),
  methods: {
    gotoOverview() {
      this.$router.push('overview')
    },
    openCreateModal() {
      this.modal = 'create'
    },
    openForgetModal() {
      this.modal = 'forget'
    },
    openRestoreModal() {
      this.modal = 'restore'
    },
    openUnlockModal() {
      this.modal = 'unlock'
    },
    reset() {
      this.modal = ''
    },
    resetAuto() {
      if (this.hasWallet) this.modal = 'unlock'
      else this.modal = ''
    }
  },
  mounted() {
    if (!this.locked) this.$router.replace('overview')
    else this.resetAuto()
  }
}
</script>
