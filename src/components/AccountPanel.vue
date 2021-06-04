<template>
  <div class="account-panel">
    <div class="container">

      <div class="account-panel__address">
        <h3 class="mb-1">Address</h3>
        <span>{{ wallet.address }}</span>
      </div>

      <div class="account-panel__info">
        <div class="account-panel__balance">
          <h3 class="mb-1">Balance</h3>
          <h1>
            {{ formatMicroXe(wallet.balance) }}<sub>XE</sub>
          </h1>
        </div>

        <div class="account-panel__buttons">
          <div></div>
          <div></div>
          <div>
            <Modal
            >
              <template v-slot:opener="slotProps">
                <button class="button button--outline-success w-full" @click="slotProps.open">
                  <span class="button__icon w-12">
                    <ArrowUpIcon/>
                  </span>
                  Send
                </button>
              </template>

              <template v-slot:header>
                <h2 class="mb-8">Send XE</h2>
                <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
              </template>
              <template v-slot:body>
                <div class="pb-35 min-h-410">
                  <div class="form-group" :class="{'form-group__error': v$.sendAddress.$error}">
                    <label for="send-send" class="label">SEND TO</label>
                    <input
                      id="send-send"
                      placeholder="XE address"
                      ref="recipient"
                      type="text"
                      v-model="sendAddress"
                    />
                    <div class="form-group__error" v-if="v$.sendAddress.$error">Invalid XE wallet address.</div>
                  </div>
                  <div class="form-group" :class="{'form-group__error': v$.sendMemo.$error}">
                    <label for="memo" class="label">Memo (optional)</label>
                    <input type="text" placeholder="Enter a memo" id="memo" v-model="sendMemo">
                    <div class="form-group__error" v-if="v$.sendMemo.$error">
                      Memo is limited to 32 characters and should include only upper and lowercase letters, numbers, hyphens and spaces.
                    </div>
                  </div>
                  <div
                    class="lg-input-group"
                    :class="{'form-group__error': v$.amount.sufficientFunds.$invalid || v$.amount.validAmount.$invalid}"
                  >
                    <label for="amount-send">AMOUNT</label>
                    <div class="input-wrap relative">
                      <input
                        type="text"
                        :ref="(el) => {
                          init(el)

                        }"
                        id="amount-send"
                        placeholder="0.00"
                        v-model="amount"
                        class="placeholder-white placeholder-opacity-100"
                      />
                      <span class="currentColor absolute top-23 right-0 text-xl">XE</span>
                      <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="v$.amount.sufficientFunds.$invalid">Insufficient funds.</div>
                      <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="v$.amount.validAmount.$invalid">Invalid amount.</div>
                    </div>
                  </div>
                  <div class="radio-list flex flex-wrap pt-12">
                    <Radio name="amount-send1" id="half" label="HALF" @click="populateAmount(50)" />
                    <Radio name="amount-send1" id="max" label="ALL" @click="populateAmount(100)" />
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-32 px-24 pb-40">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-24">
                    <button class="button button--outline-success w-full" @click="clearForm(); slotProps.close();">
                      Cancel
                    </button>
                    <button class="button button--success w-full"
                       @click="showOtherModal(slotProps, 'showSendStep2', [v$.sendAddress, v$.sendMemo, v$.amount])">
                      Send
                    </button>
                  </div>
                </div>
              </template>
            </Modal>
            <Modal
                :opened="true"
                v-if="showSendStep2 === true"
            >
              <template v-slot:header>
                <h2 class="mb-8">Send XE</h2>
                <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
              </template>
              <template v-slot:body>
                <div class="pb-35 min-h-410">
                  <div class="form-group mb-25">
                    <label class="label">Send to</label>
                    <span class="break-all">{{ sendAddress }}</span>
                  </div>
                  <div class="form-group mb-25">
                    <label class="label">Memo</label>
                    <span class="break-all">{{ sendMemo || 'None' }}</span>
                  </div>
                  <div class="form-group mb-16">
                    <label>Amount</label>
                    <Amount :value="formatAmount(amount)" currency="XE"/>
                  </div>
                  <div class="form-group mb-16">
                    <label>Fee</label>
                    <Amount value="0.00" currency="XE"/>
                  </div>
                  <div class="form-group mb-0">
                    <label>Recipient receives</label>
                    <Amount :value="formatAmount(amount)" currency="XE"/>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-32 px-24 pb-40">
                  <form>
                    <div class="form-group" :class="{'form-group__error': v$.password.$error}">
                      <label for="pass-step">Enter Password</label>
                      <div class="input-wrap relative">
                            <span class="icon">
                              <LockOpenIcon/>
                            </span>
                        <input type="password" autocomplete="off" @keypress="(event) => handleEnterKeyConfirmTransaction(event)" placeholder='Your password' id="pass-step" v-model="password">
                      </div>
                      <div class="form-group__error" v-if="invalidPassword">Password incorrect.</div>
                    </div>
                  </form>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-24">
                    <button class="button button--outline-success w-full" @click="() => {
                    hideModal(slotProps, 'showSendStep2')
                    showOtherModal(slotProps, 'showSendStep')
                  }">
                      Back
                    </button>
                    <button class="button button--success w-full" @click="confirmTransaction()">Confirm transaction</button>
                  </div>
                  
                  <div class="form-group__error" v-if="errorMessage">{{ errorMessage }}</div>

                </div>
              </template>
            </Modal>
            <Modal
                :opened="true"
                v-if="showSendStep3 === true && currentTx"
                 :closeHandler="swallowClose"
            >
              <template v-slot:header>
                <!-- <h2 class="mb-8">Done</h2> -->
                <Logo/>
              </template>
              <template v-slot:body>
                <div class="pb-35 min-h-410">
                  <div class="decor-block pb-4 mb-20 border-b border-gray-700 border-opacity-30">
                    <!-- <CheckIcon class="w-52 text-green"/> -->
                  </div>

                  <!--
                  <div class="form-group mb-14">
                    <span class="label normal-case tracking text-base3 mb-4">You've sent</span>
                    <div class="input-wrap relative">
                      <span
                        class="input-filled w-full overflow-hidden overflow-ellipsis block text-white text-caption break-all">
                        {{ formatMicroXe(currentTx.amount) }} XE
                        <span class="text-gray">to</span>
                        {{ currentTx.recipient }}
                      </span>
                    </div>
                  </div>
                  -->
                  <div class="form-group mb-25">
                    <label class="label">Recipient</label>
                    <span class="break-all">{{ currentTx.recipient }}</span>
                  </div>
                  <div class="form-group mb-25">
                    <label class="label">Memo</label>
                    <span class="break-all">{{ currentTx.data.memo }}</span>
                  </div>
                  <div class="form-group mb-16">
                    <label>Amount</label>
                    <Amount :value="formatMicroXe(currentTx.amount)" currency="XE"/>
                  </div>
                  <div class="form-group mb-16">
                    <label>Fee</label>
                    <Amount value="0.00" currency="XE"/>
                  </div>
                  <div class="form-group mb-0">
                    <label>Recipient receives</label>
                    <Amount :value="formatMicroXe(currentTx.amount)" currency="XE"/>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-40 px-24 pb-40">
                  <button class="button button--success w-full md:w-1/2 mx-auto block text-center"
                     @click="clearForm(); hideModal(slotProps, 'showSendStep3')">
                    Close
                  </button>
                </div>
              </template>
            </Modal>
          </div>
          <!--
          <div>
            <a href="#" class="button button--outline-success w-full">
            <span class="button__icon w-12">
              <ArrowDownIcon/>
            </span>
              Receive
            </a>
          </div>
          -->
          <!--
          <div>
            <Modal
                with-close-button="true"
            >
              <template v-slot:opener="slotProps">
                <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
            <span class="button__icon w-15">
              <SwitchHorizontalIcon/>
            </span>
                  Exchange
                </a>
              </template>
              <template v-slot:header>
                <h2>Exchange</h2>
              </template>

              <template v-slot:body="slotProps">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-24 pt-12 pb-20">
                  <div class="">
                    <div class="text-caption leading-7 mb-65">
                      <strong>Deposit</strong>
                      <p class="mb-25">Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                      <img src="/assets/deposit.svg" alt="image description">
                    </div>

                    <a href="#" class="button--outline-success button w-full"
                       @click="showOtherModal(slotProps, 'showDepositStep')">
                    <span class="button__icon w-12">
                      <ArrowNarrowLeftIcon/>
                    </span>
                      Deposit
                    </a>
                  </div>
                  <div class="">
                    <div class="text-caption leading-7 mb-65">
                      <strong>Withdraw</strong>
                      <p class="mb-25">Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                      <img src="/assets/withdraw.svg" alt="image description">

                    </div>
                    <a href="#" class="button--outline-success button w-full"
                       @click="showOtherModal(slotProps, 'showWithdrawStep')">
                    <span class="button__icon w-12">
                      <ArrowNarrowRightIcon/>
                    </span>
                      Withdraw
                    </a>
                  </div>
                </div>
              </template>
            </Modal>
            <Modal :opened="true" v-if="showDepositStep === true"
            >
              <template v-slot:header>
                <h2 class="mb-8">Deposit XE</h2>
                <span class="sub-heading d-block text-gray text-caption">Connect to METAMASK</span>
              </template>
              <template v-slot:body>
                <div class="min-h-410"></div>
              </template>
              <template v-slot:footer="slotProps">
                <div
                    class="grid grid-cols-1 md:grid-cols-2 gap-24 pt-23 px-24 pb-40 border-t-default border-solid border-opacity-30 border-gray-700">
                  <a href="#" class="button button--outline-success w-full"
                     @click="hideModal(slotProps, 'showDepositStep')">
                    Cancel
                  </a>
                  <a href="#" class="button button--success w-full"
                     @click="showOtherModal(slotProps, 'showDepositStep2')">
                    Connect
                  </a>
                </div>
              </template>
            </Modal>
            <Modal
                :opened="true"
                v-if="showDepositStep2 === true"
            >
              <template v-slot:header>
                <h2 class="mb-8">Deposit XE</h2>
                <span class="sub-heading d-block text-gray text-caption">3492.83 EDGE available</span>
              </template>
              <template v-slot:body>
                <div class="pb-35 min-h-410">
                  <div class="form-group">
                    <span class="label">Address</span>
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
                    <Radio name="currency" id="min" label="MIN"/>
                    <Radio name="currency" id= label=/>
                    <Radio name="currency" id="max" label="MAX"/>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-32 px-24 pb-40">
                  <div
                      class="convert-info text-center md:text-left bg-black border-gray-700 border-opacity-30 rounded py-20 px-10 mb-32 border border-color">
                    <div class="md:flex">
                      <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                        <div class="md:flex-grow">
                          <span class="block text-gray mb-3">You are depositing</span>
                          <span class="price block text-white text-xl">0.00 EDGE</span>
                        </div>
                        <span
                            class="mx-auto md:ml-20 mt-12 md:mt-0 md:flex-shrink-0 p-12 w-52 h-52 rounded-full border border-gray-700 border-opacity-30 flex align-center justify-center">
                          <img src="/assets/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
                        </span>
                        <span
                            class="icon-arrow block md:absolute mx-auto my-12 md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                          <ArrowRightIcon class="hidden md:block"/>
                          <ArrowDownIcon class="block md:hidden"/>
                        </span>
                      </div>
                      <div class="rihgt md:w-1/2 md:flex md:pl-18">
                        <span
                            class="mx-auto mb-12 md:mb-0 md:flex-shrink-0 md:mr-20 p-8 pl-12 w-52 h-52 rounded-full border bg-white flex align-center justify-center">
                          <img src="/assets/logo.svg" alt="XE Wallet" class="flex-shrink-0">
                        </span>
                        <div class="md:flex-grow">
                          <span class="block text-gray mb-3">You are receiving</span>
                          <span class="price block text-white text-xl">0.00 XE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-24">
                    <a href="#" class="button button--outline-success w-full"
                       @click="hideModal(slotProps, 'showDepositStep2')">
                      Cancel
                    </a>
                    <a href="#" class="button button--success w-full"
                       @click="showOtherModal(slotProps, 'showDepositStep3')">
                      Deposit
                    </a>
                  </div>
                </div>
              </template>
            </Modal>
            <Modal
                :opened="true"
                v-if="showDepositStep3 === true"
            >
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
                      <span class="input-filled w-full overflow-hidden overflow-ellipsis block text-white text-caption">35 EDGE <span
                          class="text-gray">to</span> 76290sgdjhagsdjh498gasjhdgajshdg5askdgkajsdhkaj</span>
                    </div>
                  </div>
                  <div class="form-group mb-14">
                    <span class="label normal-case tracking text-base3 mb-4">You’ve received</span>
                    <div class="input-wrap relative">
                      <span class="input-filled w-full overflow-hidden overflow-ellipsis block text-white text-caption">35 XE</span>
                    </div>
                  </div>
                  <div class="flex items-center text-gray leading-8 mb-14">
                      <span class="icon inline-block w-27 mr-12 flex-shrink-0 text-white">
                        <ShieldExclamationIcon/>
                      </span>
                    <p class="mb-0">Your XE should reach your wallet within 24 hours.</p>
                  </div>

                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-40 px-24 pb-40">
                  <a href="#" class="button button--success w-full md:w-3/6 mx-auto block text-center"
                     @click="hideModal(slotProps, 'showDepositStep2')">
                    Close
                  </a>
                </div>
              </template>
            </Modal>
            <Modal
                :opened="true"
                v-if="showWithdrawStep === true"
            >
              <template v-slot:header>
                <h2 class="mb-8">Withdraw XE</h2>
                <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
              </template>
              <template v-slot:body>
                <div class="pb-35 min-h-410">
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
                    <Radio name="currency" id="min" label="MIN"/>
                    <Radio name="currency" id= label="HALF"/>
                    <Radio name="currency" id="max" label="MAX"/>
                  </div>
                  <div class="form-group mb-0">
                    <span class="label">choose fee</span>
                    <div class="radio-list flex flex-wrap pt-12 -mx-6">
                      <Radio name="fee" id="slow" label="80.00XE" :big="true" extraName="Slow"/>
                      <Radio name="fee" id="average" label="100.00XE" :big="true" extraName="Average"/>
                      <Radio name="fee" id="fast" label="120.00XE" :big="true" extraName="Fast"/>
                      <Radio name="fee" id="fastest" label="140.00XE" :big="true" extraName="Fastest"/>
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-32 px-24 pb-40">
                  <div
                      class="convert-info text-center md:text-left bg-black border-gray-700 border-opacity-30 rounded py-20 px-10 mb-32 border border-color">
                    <div class="md:flex">
                      <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                        <div class="md:flex-grow">
                          <span class="block text-gray mb-3">You are withdrawing</span>
                          <span class="price block text-white text-xl">0.00 XE</span>
                        </div>
                        <span
                            class="mx-auto md:ml-20 mt-12 md:mt-0 md:flex-shrink-0 p-12 pl-12 w-52 h-52 rounded-full border border-gray-700 border-opacity-30 flex align-center justify-center">
                          <img src="/assets/logo.svg" alt="XE Wallet" class="flex-shrink-0">
                        </span>
                        <span
                            class="icon-arrow block md:absolute mx-auto my-12 md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                          <ArrowRightIcon class="hidden md:block"/>
                          <ArrowDownIcon class="block md:hidden"/>
                        </span>
                      </div>
                      <div class="rihgt md:w-1/2 md:flex md:pl-18">
                        <span
                            class="mx-auto mb-12 md:mb-0 md:flex-shrink-0 md:mr-20 p-8 w-52 h-52 rounded-full border bg-white flex align-center justify-center">
                          <img src="/assets/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
                        </span>
                        <div class="md:flex-grow">
                          <span class="block text-gray mb-3">You are receiving</span>
                          <span class="price block text-white text-xl">0.00 EDGE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-24">
                    <a href="#" class="button button--outline-success w-full"
                       @click="hideModal(slotProps, 'showWithdrawStep')">
                      Cancel
                    </a>
                    <a href="#" class="button button--success w-full"
                       @click="showOtherModal(slotProps, 'showWithdrawStep2')">
                      Withdraw
                    </a>
                  </div>
                </div>
              </template>
            </Modal>
            <Modal
                :opened="true"
                v-if="showWithdrawStep2 === true"
            >
              <template v-slot:header>
                <h2 class="mb-8">Withdraw XE</h2>
                <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
              </template>
              <template v-slot:body>
                <div class="pb-35 min-h-410">
                  <div class="form-group mb-25">
                    <label class="label">Etherium address</label>
                    <span class="break-all">hgdaiuygs7ef87wyeiuywei8yi8fm8sufsumef9uemof9uow9fu</span>
                  </div>
                  <div class="form-group mb-16">
                    <label>Widthdrawing</label>
                    <Amount value="47.00" currency="XE"/>
                  </div>
                  <div class="form-group mb-16">
                    <label>receiving</label>
                    <Amount value="47.00" currency="EDGE"/>

                  </div>
                  <div class="form-group mb-0">
                    <label>Fee</label>
                    <Amount value="120.00" currency="XE"/>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-32 px-24 pb-40">
                  <div class="form-group" :class="{'form-group__error': v$.passphraseWithdraw.$error}">
                    <label for="pass-withdraw">ENTER PASSPHRASE</label>
                    <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                      <input type="password" placeholder='Your passphrase' id="pass-withdraw"
                             v-model="passphraseWithdraw">
                    </div>
                    <div class="form-group__error" v-if="v$.passphraseWithdraw.$error">Name field has an error.</div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-24">
                    <a href="#" class="button button--outline-success w-full" @click="() => {
                    hideModal(slotProps, 'showWithdrawStep2')
                    showOtherModal(slotProps, 'showWithdrawStep')
                  }">
                      Back
                    </a>
                    <a href="#" class="button button--success w-full"
                       @click="showOtherModal(slotProps, 'showWithdrawStep3', [v$.passphraseWithdraw])">
                      Confirm
                    </a>
                  </div>
                </div>
              </template>
            </Modal>
            <Modal
                :opened="true"
                v-if="showWithdrawStep3 === true"
            >
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
                      <span class="input-filled w-full overflow-hidden overflow-ellipsis block text-white text-caption">47 XE <span
                          class="text-gray">to</span> 76290sgdjhagsdjh498gasjhdgajshdg5askdgkajsdhkaj</span>
                    </div>
                  </div>
                  <div class="form-group mb-14">
                    <span class="label normal-case tracking text-base3 mb-4">You’ve received</span>
                    <div class="input-wrap relative">
                      <span class="input-filled w-full overflow-hidden overflow-ellipsis block text-white text-caption">47 EDGE</span>
                    </div>
                  </div>
                  <div class="flex items-center text-gray leading-8 mb-14">
                      <span class="icon inline-block w-27 mr-12 flex-shrink-0 text-white">
                        <ShieldExclamationIcon/>
                      </span>
                    <p class="mb-0">Your EDGE should reach the Ethereum wallet provided within 24 hours.</p>
                  </div>
                </div>
              </template>

              <template v-slot:footer="slotProps">
                <div class="border-t border-gray-700 border-opacity-30 pt-40 px-24 pb-40">
                  <a href="#" class="button button--success w-full md:w-1/2 mx-auto block text-center"
                     @click="slotProps.close">
                    Close
                  </a>
                </div>
              </template>
            </Modal>
          </div>
          -->
        </div>
      </div>
    </div>
  </div>


</template>

<script>
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
  KeyIcon,
  LockOpenIcon,
  ArrowRightIcon,
  CheckIcon,
  ShieldExclamationIcon
} from '@heroicons/vue/solid'

import Amount from "@/components/Amount"
import AutoNumeric from 'autonumeric'
import Logo from "@/components/Logo"
import Modal from "@/components/Modal"
import Radio from '@/components/Radio'
import { SwitchHorizontalIcon } from '@heroicons/vue/outline'
import {required, minLength, numeric} from '@vuelidate/validators'
import useVuelidate from "@vuelidate/core"

import { fetchPendingTransactions, sendTransaction } from '../utils/api'
import { createTransaction, validatePassword } from '../utils/wallet'

const {
  formatXe,
  toMicroXe,
  xeStringFromMicroXe
} = require('@edge/wallet-utils')

export default {
  name: "AccountPanel",
  setup() {
    return {v$: useVuelidate()}
  },
  components: {
    Amount,
    ArrowDownIcon,
    ArrowUpIcon,
    SwitchHorizontalIcon,
    ArrowNarrowLeftIcon,
    ArrowNarrowRightIcon,
    ShieldExclamationIcon,
    KeyIcon,
    LockOpenIcon,
    Logo,
    ArrowRightIcon,
    CheckIcon,
    Radio,
    Modal
  },
  validations() {
    return {
      passphraseWithdraw: {
        required,
        minLength: minLength(10)
      },
      sendAddress: {
        required,
        validAddress: this.validAddress
      },
      sendMemo: {
        validMemo: this.validMemo
      },
      password: {
        required,
        minLength: minLength(10)
      },
      amount: {
        numeric,
        required,
        sufficientFunds: this.sufficientFunds,
        validAmount: this.validAmount
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    populateAmount(percentage) {
      this.amount = (parseFloat(this.fromMicroXe(this.wallet.balance)) * (percentage / 100)).toFixed(6)
    },
    formatAmount(input) {
      return formatXe(input, true)
    },
    validAmount(value) {
      if (!this.v$.amount) {
        return true
      }

      const enteredAmount = parseFloat(value)

      if (isNaN(enteredAmount)) {
        return false
      }

      // Check less than/equal to zero.
      if (enteredAmount <= 0) {
        return false
      }

      // Check no more than 6 decimals.
      if (enteredAmount.toString().indexOf('.') > 0) {
        const decimals = enteredAmount.toString().split('.')[1]

        if (decimals.length > 6) {
          return false
        }
      }

      return true
    },
    sufficientFunds(value) {
      if (!this.v$.amount) {
        return true
      }

      if (!value && !this.wallet.balance) {
        return true
      }

      const enteredAmount = parseFloat(value)

      // Check amount is less than the wallet balance.
      return enteredAmount <= parseFloat(this.fromMicroXe(this.wallet.balance))
    },
    validAddress(value) {
      if (value.length !== 43) {
        return false
      }

      const regex = /^xe_[a-fA-F0-9]+$/
      return regex.test(value)
    },
    validMemo(value) {
      if (value === '') {
        return true
      }

      if (value.length > 32) {
        return false
      }

      const regex = /^[a-zA-Z0-9\s-]+$/
      return regex.test(value)
    },
    clearForm() {
      this.amount = ''
      this.sendAddress = ''
      this.sendMemo = ''

      this.v$.amount.$reset()
      this.v$.sendAddress.$reset()
    },
    handleEnterKeyConfirmTransaction(event) {
      const { key, code, charCode } = event

      if (key === 'Enter' || code === 'Enter' || charCode === 13) {
        event.preventDefault()

        return this.confirmTransaction()
      }
    },
    async confirmTransaction() {
      const isValidPassword = await validatePassword(this.password)

      if (isValidPassword) {
        // Create tx object.
        let nonce = this.wallet.nonce

        // Update nonce with pending transactions.
        const pendingTx = await fetchPendingTransactions(this.wallet.address)
        nonce = nonce + pendingTx.length + 1

        const tx = await createTransaction(this.amount, this.sendMemo, nonce, this.sendAddress)
      
        // Send transaction to the blockchain.
        const txResponse = await sendTransaction(tx)

        console.log('txResponse', txResponse)

        // TODO: Handle accepted/rejected status.
        const { metadata, results } = txResponse

        if (metadata.accepted) {        
          this.currentTx = tx
          this.amount = 0
          this.sendAddress = ''
          this.sendMemo = ''
          this.showSendStep3 = true

          return true
        } else {
          this.errorMessage = results && results[0] && results[0].reason
          return false
        }
      } else {
        this.invalidPassword = true
        return false
      }
    },
    validateFields(fields) {
      if (fields && fields.length) {
        fields.forEach(field => {
          field.$touch()
        })
        const validFields = fields.filter(field => !field.$invalid)
        return validFields.length === fields.length;
      }
    },
    showOtherModal(slotProps, property, fields) {
      return (() => {
        if (fields) {
          if (!this.validateFields(fields)) return
        }
        slotProps.close()
        this[property] = true
      })()
    },
    hideModal(slotProps, property) {
      return (() => {
        slotProps.close()
        this[property] = false
      })()
    },
    completeModal(slotProps, property, fields) {
      return (() => {
        if (fields) {
          if (!this.validateFields(fields)) return
        }
        slotProps.close()
        this[property] = false
      })()
    },
    fromMicroXe(mxe) {
      return xeStringFromMicroXe(mxe || 0)
    },
    formatMicroXe(mxe) {
      return xeStringFromMicroXe(mxe || 0, true)
    },
    init(element) {
      if (element && !this.amountFieldInitialised) {
        // new AutoNumeric(element, {
        //   caretPositionOnFocus: "end",
        //   decimalPlaces: 6,
        //   decimalPlacesRawValue: 6,
        //   emptyInputBehavior: "zero",
        //   minimumValue: "0",
        //   onInvalidPaste: "ignore"
        // })

        // element.addEventListener('autoNumeric:rawValueModified', event => {
        //   this.amount = event.detail.newRawValue
        // })

        this.amountFieldInitialised = true
      }
    },
    // Empty function to ignore the modal close event.
    swallowClose () {}
  },
  data: function() {
    return {
      amount: '',
      amountFieldInitialised: false,
      currentTx: null,
      errorMessage: '',
      invalidPassword: false,
      isModalVisible: false,
      showDepositStep: false,
      showDepositStep2: false,
      showDepositStep3: false,
      showWithdrawStep: false,
      showWithdrawStep2: false,
      showWithdrawStep3: false,
      showSendStep2: false,
      showSendStep3: false,
      sendAddress: '',
      sendMemo: '',
      password: '',
      passphraseWithdraw: ''
    }
  },
  props: {
    wallet: {
      type: Object
    }
  }
}
</script>

<style scoped>
.account-panel {
  @apply bg-black-100 pt-16 pb-30;
}

.account-panel__address {
  @apply text-gray text-sm2 mb-7;
}

.account-panel__address span {
  @apply text-white break-all block;
}

.account-panel__info h3 {
  @apply text-green mb-5;
}

.account-panel__info h1 {
  @apply text-white mb-0 font-normal;
}

.account-panel__info h1 sub {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-24 grid-cols-1  w-full flex-shrink-0;
}

.account-panel__balance {
  @apply flex-grow mb-6;
}

@screen md {
  .account-panel__address {
    @apply pr-9 mb-12;
  }

  .account-panel__info {
    @apply flex items-center justify-between;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid-cols-3 max-w-560;
  }

  .account-panel__balance {
    @apply mb-0;
  }
}
</style>
