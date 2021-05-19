<template>
  <div class="bg-black bg-center bg-no-repeat bg-cover"
       style="background-image: url('/assets/Map-placeholder.png');">
    <div class="container">
      <div class="relative">
        <div class="absolute top-64 left-0">
          <Logo/>
        </div>
      </div>
    </div>

    <div class="min-h-screen py-128 flex items-center justify-center">
      <div class="container">
        <div class="max-w-800 mx-auto">
          <div class="text-white md:px-6 mb-11 text-caption">
          <h1 class="text-white mb-2">
            Welcome to the Edge
          </h1>
          <p>Generate or restore an XE wallet to begin</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-24 bg-black-100 py-20 px-6 pb-52 rounded-md">
            <div>
              <h3 class="text-gray mb-6">CREATE a new wallet</h3>
              <a href="#" class="button button--success w-full">
                Create wallet
              </a>
            </div>
            <div>
            <h3 class="text-gray mb-6">restore an existing wallet</h3>
            <Modal
            >
              <template v-slot:opener="slotProps">
                <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
                  Restore wallet
                </a>
              </template>
              <template v-slot:header>
                <h2>Restore a wallet</h2>
              </template>

              <template v-slot:body>
                This is a new modal body.
              </template>

              <template v-slot:footer>
                This is a new modal footer.
              </template>
            </Modal>

            </div>
          </div>
          <h3>Deposit modals</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from "@/components/Logo";
import Modal from '@/components/Modal';
import Radio from '@/components/Radio';
import {KeyIcon, LockOpenIcon, ArrowRightIcon, ArrowDownIcon, CheckIcon} from "@heroicons/vue/outline"
import {ShieldExclamationIcon} from "@heroicons/vue/solid"


export default {
  name: 'Sample',
  components: {
    Logo,
    KeyIcon,
    LockOpenIcon,
    ArrowRightIcon,
    ArrowDownIcon,
    CheckIcon,
    ShieldExclamationIcon,
    Modal,
    Radio
  },
  title() {
    return 'XE Wallet » Create or restore a wallet'
  }
}
</script>
