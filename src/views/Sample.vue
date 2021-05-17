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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-24">
            <Modal
              with-close-button="true"
            >
              <template v-slot:opener="slotProps">
                <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
                  <span class="button__icon w-15">
                    <SwitchHorizontalIcon/>
                  </span>
                  Deposit modal1
                </a>
              </template>
              <template v-slot:header>
                <h2 class="mb-8">Deposit XE</h2>
                <span class="sub-heading d-block text-gray text-caption">Connect to METAMASK</span>
              </template>

              <template v-slot:footer="slotProps">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-24 pt-23 px-24 pb-40">
                  <a href="#" class="button button--outline-success w-full" @click="slotProps.close">
                    Cancel
                  </a>
                  <a href="#" class="button button--success w-full">
                    Connect
                  </a>
                </div>
              </template>
            </Modal>


            <Modal
              with-close-button="true"
            >
              <template v-slot:opener="slotProps">
                <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
                  <span class="button__icon w-15">
                    <SwitchHorizontalIcon/>
                  </span>
                  Deposit modal2
                </a>
              </template>
              <template v-slot:header>
                <h2 class="mb-8">Deposit XE</h2>
                <span class="sub-heading d-block text-gray text-caption">3492.83 EDGE available</span>
              </template>
              <template v-slot:body>
                <div class="pb-35">
                  <div class="form-group">
                    <span class="label">SEND TO</span>
                    <div class="input-wrap relative">
                      <span class="input-filled w-full overflow-hidden overflow-ellipsis block text-white">hgdaiuygs7ef87wyeiuywei8yi8fm8sufsumef9uemof9uow9fu</span>
                    </div>
                  </div>
                  <div class="lg-input-group">
                    <label for="key">AMOUNT</label>
                    <div class="input-wrap relative">
                      <input type="text" placeholder="0.00" class="placeholder-white placeholder-opacity-100">
                      <span class="curren absolute top-23 right-0 text-xl">EDGE</span>
                    </div>
                  </div>
                  <div class="radio-list flex flex-wrap pt-12">
                    <Radio  name="currency" id="min" label="MIN"/>
                    <Radio  name="currency" id="half" label="HALF"/>
                    <Radio  name="currency" id="max" label="MAX"/>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-32 px-24 pb-40">
                  <div class="convert-info text-center md:text-left bg-black border-gray-700 border-opacity-30 rounded py-20 px-10 mb-32 border border-color">
                    <div class="md:flex">
                      <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                        <div class="md:flex-grow">
                          <span class="block text-gray mb-3">You are depositing</span>
                          <span class="price block text-white text-xl">0.00 EDGE</span>
                        </div>
                        <span class="mx-auto md:ml-20 mt-12 md:mt-0 md:flex-shrink-0 p-12 w-52 h-52 rounded-full border border-gray-700 border-opacity-30 flex align-center justify-center">
                          <img src="/assets/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
                        </span>
                        <span class="icon-arrow block md:absolute mx-auto my-12 md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                          <ArrowRightIcon class="hidden md:block" />
                          <ArrowDownIcon class="block md:hidden"/>
                        </span>
                      </div>
                      <div class="rihgt md:w-1/2 md:flex md:pl-18">
                        <span class="mx-auto mb-12 md:mb-0 md:flex-shrink-0 md:mr-20 p-8 pl-12 w-52 h-52 rounded-full border bg-white flex align-center justify-center">
                          <img src="/assets/logo.svg" alt="XE Wallet" class="flex-shrink-0">
                        </span>
                        <div class="md:flex-grow">
                          <span class="block text-gray mb-3">You are receiving</span>
                          <span class="price block text-white text-xl">0.00 XE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <a href="#" class="button button--success w-full">
                    Deposit
                  </a>
                </div>
              </template>
            </Modal>
            <Modal
              with-close-button="true"
            >
              <template v-slot:opener="slotProps">
                <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
                  <span class="button__icon w-15">
                    <SwitchHorizontalIcon/>
                  </span>
                  Deposit modal3
                </a>
              </template>
              <template v-slot:header>
                <h2 class="mb-8">Done</h2>
              </template>
              <template v-slot:body>
                <div class="pb-35 min-h-410">
                  <div class="decor-block pb-4 mb-20 border-b border-gray-700 border-opacity-30">
                    <CheckIcon class="w-52 text-green"/>
                  </div>
                  <div class="form-group mb-14">
                    <span class="label normal-case tracking text-base3 mb-4">You’ve sent</span>
                    <div class="input-wrap relative">
                      <span class="input-filled w-full overflow-hidden overflow-ellipsis block text-white text-caption">35 EDGE <span class="text-gray">to</span> 76290sgdjhagsdjh498gasjhdgajshdg5askdgkajsdhkaj</span>
                    </div>
                  </div>
                  <div class="form-group mb-14">
                    <span class="label normal-case tracking text-base3 mb-4">You’ve received</span>
                    <div class="input-wrap relative">
                      <span class="input-filled w-full overflow-hidden overflow-ellipsis block text-white text-caption">35 XE</span>
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-40 px-24 pb-40">
                  <a href="#" class="button button--success w-full" @click="slotProps.close">
                    Close
                  </a>
                </div>
              </template>
            </Modal>




            <Modal
              with-close-button="true"
            >
              <template v-slot:opener="slotProps">
                <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
                  <span class="button__icon w-15">
                    <SwitchHorizontalIcon/>
                  </span>
                  Withdraw modal 1
                </a>
              </template>
              <template v-slot:header>
                <h2 class="mb-8">Withdraw XE</h2>
                <span class="sub-heading d-block text-gray text-caption">1574.987XE available</span>
              </template>
              <template v-slot:body>
                <div class="pb-35">
                  <div class="form-group">
                    <label for="send1" class="label">SEND TO</label>
                    <input type="text" placeholder="Send to Ethereum address" id="send1">
                  </div>
                  <div class="lg-input-group">
                    <label for="key">AMOUNT</label>
                    <div class="input-wrap relative">
                      <input type="text" placeholder="0.00" class="placeholder-white placeholder-opacity-100">
                      <span class="curren absolute top-23 right-0 text-xl">XE</span>
                    </div>
                  </div>
                  <div class="radio-list flex flex-wrap pt-12 pb-32">
                    <Radio  name="currency" id="min" label="MIN"/>
                    <Radio  name="currency" id="half" label="HALF"/>
                    <Radio  name="currency" id="max" label="MAX"/>
                  </div>
                  <div class="form-group mb-0">
                    <span class="label">choose fee</span>
                    <div class="radio-list flex flex-wrap pt-12">
                      <Radio name="fee" id="min" label="Slow 80.00XE"/>
                      <Radio name="fee" id="half" label="Slow 80.00XE"/>
                      <Radio name="fee" id="max" label="Slow 80.00XE"/>
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-32 px-24 pb-40">
                  <div class="convert-info text-center md:text-left bg-black border-gray-700 border-opacity-30 rounded py-20 px-10 mb-32 border border-color">
                    <div class="md:flex">
                      <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                        <div class="md:flex-grow">
                          <span class="block text-gray mb-3">You are withdrawing</span>
                          <span class="price block text-white text-xl">0.00 XE</span>
                        </div>
                        <span class="mx-auto md:ml-20 mt-12 md:mt-0 md:flex-shrink-0 p-12 pl-12 w-52 h-52 rounded-full border border-gray-700 border-opacity-30 flex align-center justify-center">
                          <img src="/assets/logo.svg" alt="XE Wallet" class="flex-shrink-0">
                        </span>
                        <span class="icon-arrow block md:absolute mx-auto my-12 md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                          <ArrowRightIcon class="hidden md:block" />
                          <ArrowDownIcon class="block md:hidden"/>
                        </span>
                      </div>
                      <div class="rihgt md:w-1/2 md:flex md:pl-18">
                        <span class="mx-auto mb-12 md:mb-0 md:flex-shrink-0 md:mr-20 p-8 w-52 h-52 rounded-full border bg-white flex align-center justify-center">
                          <img src="/assets/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
                        </span>
                        <div class="md:flex-grow">
                          <span class="block text-gray mb-3">You are receiving</span>
                          <span class="price block text-white text-xl">0.00 EDGE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <a href="#" class="button button--success w-full">
                    Withdraw
                  </a>
                </div>
              </template>
            </Modal>



            <Modal
              with-close-button="true"
            >
              <template v-slot:opener="slotProps">
                <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
                  <span class="button__icon w-15">
                    <SwitchHorizontalIcon/>
                  </span>
                  Withdraw modal 3
                </a>
              </template>
              <template v-slot:header>
                <h2 class="mb-8">Done</h2>
              </template>
              <template v-slot:body>
                <div class="pb-35 min-h-410">
                  <div class="decor-block pb-4 mb-20 border-b border-gray-700 border-opacity-30">
                    <CheckIcon class="w-52 text-green"/>
                  </div>
                  <div class="form-group mb-14">
                    <span class="label normal-case tracking text-base3 mb-4">You’ve sent</span>
                    <div class="input-wrap relative">
                      <span class="input-filled w-full overflow-hidden overflow-ellipsis block text-white text-caption">47 XE <span class="text-gray">to</span> 76290sgdjhagsdjh498gasjhdgajshdg5askdgkajsdhkaj</span>
                    </div>
                  </div>
                  <div class="form-group mb-14">
                    <span class="label normal-case tracking text-base3 mb-4">You’ve received</span>
                    <div class="input-wrap relative">
                      <span class="input-filled w-full overflow-hidden overflow-ellipsis block text-white text-caption">47 EDGE</span>
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-40 px-24 pb-40">
                  <a href="#" class="button button--success w-full" @click="slotProps.close">
                    Close
                  </a>
                </div>
              </template>
            </Modal>
          </div>
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

export default {
  name: 'Sample',
  components: {
    Logo,
    KeyIcon,
    LockOpenIcon,
    ArrowRightIcon,
    ArrowDownIcon,
    CheckIcon,
    Modal,
    Radio
  },
  title() {
    return 'XE Wallet » Create or restore a wallet'
  }
}
</script>
