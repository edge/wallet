<template>
  <div class="account-panel">

    <h1 style="color: white;">VUE_APP_IS_TESTNET: {{ isTestnet }}</h1>

    <h1 style="color: white;" v-if="isTestnet">Testnet!</h1>
    <h1 style="color: white;" v-if="!isTestnet">Mainnet!</h1>





    <div class="container">
      <div class="account-panel__left">
        <div class="account-panel__address">
          <h3 class="mb-1">Address</h3>
          <span>{{ wallet.address }}</span>
        </div>

        <div class="account-panel__balance">
          <h3 class="mb-1">Balance</h3>
          <h1>
            {{ formatMicroXe(wallet.balance) }}<sub>XE</sub>
          </h1>
        </div>
      </div>

      <div class="account-panel__right">
        <div class="account-panel__buttons">
          <button class="w-full button button--success" @click="openSend()">
            <span class="w-12 button__icon">
              <ArrowUpIcon/>
            </span>
            Send
          </button>

          <button class="w-full button button--outline-success" @click="openExchange()">
            <span class="button__icon w-15">
              <SwitchHorizontalIcon/>
            </span>
            Exchange
          </button>
        </div>
      </div>
    </div>

    <div class="account-panel__modals">
      <Modal v-if="showSendStep === true" :opened="true" :closeHandler="swallowClose">
        <!-- <template v-slot:opener="slotProps">
          <button class="w-full button button--outline-success" @click="slotProps.open">
            <span class="w-12 button__icon">
              <ArrowUpIcon/>
            </span>
            Send
          </button>
        </template> -->

        <template v-slot:header>
          <h2 class="mb-8">Send XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
          <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
        </template>
        <template v-slot:body>
          <div class="pb-14 min-h-410">
            <div class="form-group" :class="{'form-group__error': v$.xeAddress.$error}">
              <label for="send-send" class="label">SEND TO</label>
              <input
                id="send-send"
                placeholder="XE address"
                ref="recipient"
                type="text"
                v-model="xeAddress"
              />
              <div class="form-group__error" v-if="v$.xeAddress.$error">Invalid XE wallet address.</div>
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
              :class="{'form-group__error': (!v$.amount.sufficientFunds.$pending && v$.amount.sufficientFunds.$invalid) || (v$.amount.validAmount.$invalid)}"
            >
              <label for="amount-send">AMOUNT</label>
              <div class="relative input-wrap">
                <input
                  type="text"
                  id="amount-send"
                  placeholder="0.00"
                  v-model="amount"
                  class="placeholder-white placeholder-opacity-100"
                />
                <span class="absolute right-0 text-xl currentColor top-23">XE</span>
                <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="(!v$.amount.sufficientFunds.$pending && v$.amount.sufficientFunds.$invalid)">Insufficient funds.</div>
                <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="v$.amount.validAmount.$invalid">Invalid amount.</div>
              </div>
            </div>
            <div class="flex flex-wrap pt-12 radio-list">
              <!-- <Radio name="amount-send1" id="half" label="HALF" @click="populateAmount(50)" /> -->
              <Radio name="amount-send1" id="max" label="MAX" @click="populateAmount(100)" />
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
            <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
              <button class="w-full button button--outline-success" @click="clearForm(); hideModal(slotProps, 'showSendStep');">
                Cancel
              </button>
              <button class="w-full button button--success"
                  @click="showOtherModal(slotProps, 'showSendStep2', [v$.xeAddress, v$.sendMemo, v$.amount])">
                Send
              </button>
            </div>
          </div>
        </template>
      </Modal>
      <Modal v-if="showSendStep2 === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <h2 class="mb-8">Send XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
          <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
        </template>
        <template v-slot:body>
          <div class="pb-14 min-h-410">
            <div class="form-group mb-25">
              <label class="label">Send to</label>
              <span class="break-all">{{ xeAddress }}</span>
            </div>
            <div class="form-group mb-25">
              <label class="label">Memo</label>
              <span class="break-all">{{ sendMemo || 'None' }}</span>
            </div>
            <div class="mb-16 form-group">
              <label>Amount</label>
              <Amount :value="amount" currency="XE"/>
            </div>
            <div class="mb-16 form-group">
              <label>Fee</label>
              <Amount value="0.00" currency="XE"/>
            </div>
            <div class="mb-0 form-group">
              <label>Recipient receives</label>
              <Amount :value="amount" currency="XE"/>
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
            <form>
              <div class="form-group" :class="{'form-group__error': v$.password.$error}">
                <label for="pass-step">Enter Password</label>
                <div class="relative input-wrap">
                  <span class="icon">
                    <LockOpenIcon/>
                  </span>
                  <input type="password" autocomplete="off" @keypress="(event) => handleEnterKeyConfirmTransaction(event)" placeholder='Your password' id="pass-step" v-model="password">
                </div>
                <div class="form-group__error" v-if="invalidPassword">Password incorrect.</div>
              </div>
            </form>
            <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
              <button
                class="w-full button button--outline-success"
                @click="hideModal(slotProps, 'showSendStep2'); showOtherModal(slotProps, 'showSendStep');">
                Back
              </button>
              <button
                class="w-full button button--success"
                @click="confirmTransaction()">Confirm transaction</button>
            </div>

            <div class="form-group__error" v-if="errorMessage">{{ errorMessage }}</div>

          </div>
        </template>
      </Modal>
      <Modal v-if="showSendStep3 === true && currentTx" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <!-- <h2 class="mb-8">Done</h2> -->
          <Logo/>
        </template>
        <template v-slot:body>
          <div class="pb-14 min-h-410">
            <div class="pb-4 mb-20 border-b border-gray-700 decor-block border-opacity-30">
              <!-- <CheckIcon class="w-52 text-green"/> -->
            </div>

            <!--
            <div class="form-group mb-14">
              <span class="mb-4 normal-case label tracking text-base3">You've sent</span>
              <div class="relative input-wrap">
                <span
                  class="block w-full overflow-hidden text-white break-all input-filled overflow-ellipsis text-caption">
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
              <span class="break-all">{{ currentTx.data.memo || 'None' }}</span>
            </div>
            <div class="mb-16 form-group">
              <label>Amount</label>
              <Amount :value="formatMicroXe(currentTx.amount)" currency="XE"/>
            </div>
            <div class="mb-16 form-group">
              <label>Fee</label>
              <Amount value="0.00" currency="XE"/>
            </div>
            <div class="mb-0 form-group">
              <label>Recipient receives</label>
              <Amount :value="formatMicroXe(currentTx.amount)" currency="XE"/>
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
            <button class="block w-full mx-auto text-center button button--success md:w-1/2"
                @click="clearForm(); hideModal(slotProps, 'showSendStep3')">
              Close
            </button>
          </div>
        </template>
      </Modal>

      <Modal v-if="showExchangeOptions === true"
        :opened="true"
        :withCloseButton="true"
        :disallowClickOutside="true"
        :closeHandler="closeWithdraw"
        :width="900">
        <template v-slot:header>
          <h2>Exchange<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        </template>

        <template v-slot:body="slotProps">
          <div class="grid grid-cols-1 gap-24 pt-12 pb-20 md:grid-cols-3">
            <div>
              <div class="leading-7 text-caption mb-65">
                <strong>Deposit</strong>
                <p class="mb-25">Convert EDGE to XE for staking, governance and service use.</p>
                <img src="/assets/deposit.svg" alt="Deposit EDGE for XE" class="account-panel__exchange-img">
              </div>

              <button
                class="w-full button--outline-success button"
                @click="openDeposit();"
              >
                <span class="w-12 button__icon">
                  <ArrowNarrowLeftIcon/>
                </span>
                Deposit
              </button>
            </div>
            <div>
              <div class="leading-7 text-caption mb-65">
                <strong>Withdraw</strong>
                <p class="mb-25">Convert XE to EDGE for use within the Ethereum network.</p>
                <img src="/assets/withdraw.svg" alt="Withdraw XE for EDGE" class="account-panel__exchange-img">
              </div>
              <button
                class="w-full button--outline-success button"
                @click="openWithdraw();"
              >
                <span class="w-12 button__icon">
                  <ArrowNarrowRightIcon/>
                </span>
                Withdraw
              </button>
            </div>
            <div>
              <div class="leading-7 text-caption mb-65">
                <strong>Sell</strong>
                <p class="mb-25">Sell XE for USDC on the Ethereum network.</p>
                <img src="/assets/sell.svg" alt="Sell XE for USDC" class="account-panel__exchange-img">
              </div>
              <button
                class="w-full button--outline-success button"
                @click="openSell();"
              >
                <span class="w-12 button__icon">
                  <CurrencyDollarIcon/>
                </span>
                Sell
              </button>
            </div>
          </div>
        </template>
      </Modal>

      <Modal v-if="showDepositStep === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <h2 class="mb-8">Deposit EDGE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
          <span v-if="supportedBrowser" class="sub-heading d-block text-gray text-caption">Connect to MetaMask to deposit EDGE for exchange.</span>
          <span v-if="!supportedBrowser" class="sub-heading d-block text-gray text-caption">Your browser doesn't support the MetaMask browser extension. Please use Brave, Chrome, Edge or Firefox for depositing EDGE.</span>
        </template>
        <template v-slot:body="slotProps">
          <div class="pb-15">
            <button
              class="w-full mb-16 button button--success"
              id="metamaskButton"
              :ref="(el) => {
                initialise(el)
              }"
            >
              Connect
            </button>
            <button
              class="w-full button button--outline-success"
              @click="closeDeposit();"
            >
              Cancel
            </button>
          </div>
        </template>
      </Modal>
      <Modal v-if="showDepositStep2 === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <div class="flex justify-between">
            <div>
              <h2 class="mb-8">Deposit EDGE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
              <span class="sub-heading d-block text-gray text-caption">{{ formatCurrency(edgeBalance) }} EDGE available</span>
            </div>
            <div>
              <div class="px-10 py-5 text-gray-400 border border-green-200 rounded-xl">{{ ethereumNetwork }}</div>
            </div>
          </div>
        </template>
        <template v-slot:body>
          <div class="pb-14 min-h-410">
            <div class="form-group">
              <span class="label">Depositing from</span>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis">{{ ethereumAddress }}</span>
              </div>
            </div>
            <div class="form-group">
              <span class="label">Depositing to</span>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis">{{ wallet.address }}</span>
              </div>
            </div>
            <div
              class="lg-input-group"
              :class="{'form-group__error': edgeAmount !== 0 && (v$.edgeAmount.sufficientFunds.$invalid || v$.edgeAmount.validAmount.$invalid)}"
            >
              <label for="key">AMOUNT</label>
              <div class="relative input-wrap">
                <input
                  type="text"
                  id="amount-send"
                  placeholder="0.00"
                  v-model="edgeAmount"
                  class="placeholder-white placeholder-opacity-100"
                />
                <span class="absolute right-0 text-xl curren top-23">EDGE</span>

                <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="v$.edgeAmount.sufficientFunds.$invalid">Insufficient funds.</div>
                <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="edgeAmount !== 0 && v$.edgeAmount.validAmount.$invalid">Invalid amount.</div>
              </div>
            </div>
            <div class="flex flex-wrap justify-end pt-12 radio-list">
              <Radio name="currency" id="max" label="MAX" @click="populateEdgeAmount(100);" />
            </div>

            <div class="form-group">
              <label class="flex items-center space-x-3">
                Estimated Cost
                <Tooltip class="ml-3" position="right" theme="dark" :text="`Inclusive of a ${minimumFee} XE handling fee`">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <Amount :value="fee" currency="XE"/>
            </div>

          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">

            <div v-if="tx === null"
                class="px-10 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
              <div class="md:flex">
                <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                  <div class="md:flex-grow">
                    <span class="block mb-3 text-gray">You are depositing</span>
                    <span class="block text-lg text-white price">
                      {{ formatCurrency(edgeAmount) }} EDGE
                    </span>
                  </div>
                  <span
                      class="flex justify-center p-12 mx-auto mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
                    <img src="/assets/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
                  </span>
                  <span
                      class="block mx-auto my-12 icon-arrow md:absolute md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                    <ArrowRightIcon class="hidden md:block"/>
                    <ArrowDownIcon class="block md:hidden"/>
                  </span>
                </div>
                <div class="right md:w-1/2 md:flex md:pl-18">
                  <span class="flex justify-center p-8 pl-12 mx-auto mb-12 bg-white border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                    <img src="/assets/logo.svg" alt="XE Wallet" class="flex-shrink-0">
                  </span>
                  <div class="md:flex-grow">
                    <span class="block mb-3 text-gray">You should receive</span>
                    <span class="block text-lg text-white price">
                      {{ formatCurrency(calculatedXe) }} XE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="depositMessage !== null"
                class="px-20 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
              <div class="">
                <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
                  {{ depositMessage }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
              <button
                class="w-full button button--outline-success"
                :disabled="depositInProgress"
                @click="closeDeposit();"
              >
                Cancel
              </button>
              <button
                class="w-full button button--success"
                :disabled="depositInProgress || (v$.edgeAmount.sufficientFunds.$invalid || v$.edgeAmount.validAmount.$invalid) || edgeAmount <= 0"
                @click="exchange([v$.edgeAmount])"
              >
                Deposit
              </button>
            </div>
          </div>
        </template>
      </Modal>
      <Modal v-if="showDepositStep3 === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <h2 class="mb-8">Deposit accepted<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        </template>
        <template v-slot:body>
          <div class="pb-14 min-h-410">
            <div class="form-group mb-14">
              <label>You are depositing</label>
              <Amount :value="edgeAmount" currency="EDGE" />
            </div>

            <div class="form-group mb-14">
              <label>From</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ tx.from }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label>To</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ wallet.address }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <span class="mb-4 label tracking text-base3">Estimated cost</span>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  <Amount :value="fee" currency="XE" />
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label>You should receive</label>
              <Amount :value="calculatedXe" currency="XE" />
            </div>

            <div class="form-group mb-14">
              <label>Transaction hash</label>
              <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
                <a class="text-lg text-white underline" :href="getHashUrl()" target="_blank">
                  {{ tx.hash.substring(0, 6) }}...{{ tx.hash.substring(tx.hash.length - 4) }}
                </a>
                <svg class="w-20 h-20 mt-2 ml-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </span>
            </div>

            <div class="flex items-center mt-24 leading-8 text-gray">
              <p class="mb-0">Your request has been accepted and should be processed within 24 hours.</p>
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
            <button
              class="block w-full mx-auto text-center button button--success md:w-3/6"
              @click="closeDeposit();"
            >
              Close
            </button>
          </div>
        </template>
      </Modal>

      <Modal v-if="showWithdrawStep === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <h2 class="mb-8">Withdraw XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
          <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
        </template>
        <template v-slot:body>
          <div class="pb-4 min-h-410">
            <div class="form-group mb-8" :class="{'form-group__error': v$.ethAddress.$error}">
              <label for="send1" class="flex items-center space-x-3 label">
                Withdraw to
                <Tooltip
                  class="ml-3" position="right" theme="dark" :wide="true"
                  text="This is the Ethereum wallet that will hold your EDGE">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <input
                type="text"
                placeholder="Ethereum address"
                id="send1"
                maxlength="43"
                v-model="ethAddress"
              />
              <div class="form-group__error" v-if="v$.ethAddress.$error">Invalid Ethereum wallet address.</div>
            </div>

            <div
              class="mt-32 lg-input-group"
              :class="{'form-group__error': (!v$.amount.sufficientFunds.$pending && v$.amount.sufficientFunds.$invalid) || v$.amount.validAmount.$invalid}">
              <label for="key">Amount</label>
              <div class="relative input-wrap">
                <input
                  type="text"
                  id="amount-send"
                  placeholder="0.00"
                  v-model="amount"
                  class="placeholder-white placeholder-opacity-100"
                >
                <span class="absolute right-0 text-xl curren top-23">XE</span>

                <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="(!v$.amount.sufficientFunds.$pending && v$.amount.sufficientFunds.$invalid)">Insufficient funds.</div>
                <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="v$.amount.validAmount.$invalid">Invalid amount.</div>
              </div>
            </div>

            <div class="mt-32 mb-8 form-group">
              <label class="flex items-center space-x-3 label">
                Transaction speed
                <Tooltip
                  class="ml-3" position="right" theme="dark" :wide="true"
                  text="Faster transactions cost more gas in the Ethereum network">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <div class="flex flex-wrap mt-12 -mx-6 radio-list">
                <Radio name="fee" @click="selectFeeLevel(gasRates.slow)" id="slow" :label="gasRates.slow + ' XE'" :big="true" extraName="Slow"/>
                <Radio name="fee" :selected="selectedFeeLevel === gasRates.average"  @click="selectFeeLevel(gasRates.average)" id="average" :label="gasRates.average + ' XE'" :big="true" extraName="Average"/>
                <Radio name="fee" @click="selectFeeLevel(gasRates.fast)" id="fast" :label="gasRates.fast + ' XE'" :big="true" extraName="Fast"/>
                <Radio name="fee" @click="selectFeeLevel(gasRates.fastest)" id="fastest" :label="gasRates.fastest + ' XE'" :big="true" extraName="Fastest"/>
              </div>
            </div>
            <div class="mt-32 mb-8 form-group">
              <label class="flex items-center space-x-3">
                Estimated Cost
                <Tooltip class="ml-3" position="right" theme="dark" :text="`Inclusive of a ${minimumFee} XE handling fee`">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <Amount :value="fee" currency="XE"/>
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
            <div class="px-10 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
              <div class="md:flex">
                <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                  <div class="md:flex-grow">
                    <span class="block mb-3 text-gray">You are withdrawing</span>
                    <span class="block text-xl text-white price">
                      {{ formatCurrency(amount) }} XE
                    </span>
                  </div>
                  <span class="flex justify-center p-12 pl-12 mx-auto mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
                    <img src="/assets/logo.svg" alt="XE Wallet" class="flex-shrink-0">
                  </span>
                  <span class="block mx-auto my-12 icon-arrow md:absolute md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                    <ArrowRightIcon class="hidden md:block"/>
                    <ArrowDownIcon class="block md:hidden"/>
                  </span>
                </div>
                <div class="right md:w-1/2 md:flex md:pl-18">
                  <span class="flex justify-center p-8 mx-auto mb-12 bg-white border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                    <img src="/assets/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
                  </span>
                  <div class="md:flex-grow">
                    <span class="block mb-3 text-gray">You should receive</span>
                    <span class="block text-xl text-white price">
                      {{ formatCurrency(calculatedEdge) }} EDGE
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
              <button class="w-full button button--outline-success"
                  @click="closeWithdraw();">
                Cancel
              </button>
              <button class="w-full button button--success"
                @click="validateFields([v$.ethAddress, v$.amount]) && openWithdrawalConfirmation();"
              >
                Withdraw
              </button>
            </div>
          </div>
        </template>
      </Modal>
      <Modal v-if="showWithdrawStep2 === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <h2 class="mb-8">Withdraw XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
          <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
        </template>
        <template v-slot:body>
          <div class="pb-12 min-h-300">
            <div class="form-group mb-14">
              <label>You are withdrawing</label>
              <Amount :value="amount" currency="XE"/>
            </div>

            <div class="form-group mb-14">
              <label class="label">From</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ wallet.address }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label class="label">To</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ ethAddress }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label class="flex items-center space-x-3">
                Estimated Cost
                <Tooltip class="ml-3" position="right" theme="dark" :text="`Includes handling fee of ${minimumFee} XE`">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <Amount :value="fee" currency="XE"/>
            </div>

            <div class="form-group mb-14">
              <label class="flex items-center space-x-3">
                You should receive
                <Tooltip
                  class="ml-3" position="right" :wide="true" theme="dark"
                  :text="`This is dependent on the final Ethereum transaction cost, you may receive more`">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <Amount :value="calculatedEdge" currency="EDGE"/>
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 py-32 border-t border-gray-700 border-opacity-30">
            <div class="mb-24 form-group" :class="{'form-group__error': v$.passphraseWithdraw.$error}">
              <form>
                <label for="pass-withdraw">ENTER PASSWORD</label>
                <div class="relative input-wrap">
                  <span class="icon">
                    <LockOpenIcon/>
                  </span>
                  <input
                    autocomplete="off"
                    type="password"
                    placeholder='Your password'
                    id="pass-withdraw"
                    v-model="password"
                    @keypress="(event) => handleEnterKeyConfirmWithdraw(event)"
                  />
                </div>
                <div class="form-group__error" v-if="invalidPassword">Password incorrect.</div>
              </form>
            </div>

            <div v-if="errorMessage !== ''"
                class="px-20 py-20 text-center bg-black border border-gray-700 rounded convert-info md:text-left red border-opacity-30 border-color">
              <div class="">
                <span class="flex w-full overflow-hidden overflow-ellipsis text-red">
                  An error has occurred ({{ errorMessage }}). Please try again.
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-24 pt-12 md:grid-cols-2">
              <button class="w-full button button--outline-success" @click="() => {
                hideModal(slotProps, 'showWithdrawStep2')
                showOtherModal(slotProps, 'showWithdrawStep')
              }">
                Back
              </button>
              <button
                class="w-full button button--success"
                @click="confirmWithdraw()"
              >
                Confirm
              </button>
            </div>
          </div>
        </template>
      </Modal>
      <Modal v-if="showWithdrawStep3 === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <h2 class="mb-8">Withdrawal accepted<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        </template>
        <template v-slot:body>
          <div class="pb-14 min-h-410">

            <div class="form-group mb-14">
              <label>You are withdrawing</label>
              <Amount :value="currentTx.amount / 1e6" currency="XE"/>
            </div>

            <div class="form-group mb-14">
              <label>From</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ wallet.address }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label>To</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ currentTx.data.destination }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label>Estimated cost</label>
              <Amount :value="currentTx.data.fee / 1e6" currency="XE"/>
            </div>

            <div class="form-group mb-14">
              <label>You should receive</label>
              <Amount :value="currentTx.edgeAmount" currency="EDGE"/>
            </div>

            <div class="flex items-center mt-24 leading-8 text-gray">
              <p class="mb-0">Your request has been accepted and should be processed within 24 hours.</p>
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
            <button class="block w-full mx-auto text-center button button--success md:w-1/2"
                @click="closeWithdraw();">
              Close
            </button>
          </div>
        </template>
      </Modal>

      <Modal v-if="showSellStep === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <h2 class="mb-8">Sell XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
          <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
        </template>
        <template v-slot:body>
          <div class="pb-4 min-h-410">
            <div class="form-group mb-8" :class="{'form-group__error': v$.ethAddress.$error}">
              <label for="send1" class="flex items-center space-x-3 label">
                Ethereum address
                <Tooltip
                  class="ml-3" position="right" theme="dark" :wide="true"
                  text="This is the Ethereum wallet that will hold your USDC">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <input
                type="text"
                placeholder="Ethereum address"
                id="sell1"
                maxlength="43"
                v-model="ethAddress"
              />
              <div class="form-group__error" v-if="v$.ethAddress.$error">Invalid Ethereum wallet address.</div>
            </div>

            <div
              class="mt-32 lg-input-group"
              :class="{'form-group__error': (!v$.amount.sufficientFunds.$pending && v$.amount.sufficientFunds.$invalid) || v$.amount.validAmount.$invalid}">
              <label for="key">Amount</label>
              <div class="relative input-wrap">
                <input
                  type="text"
                  id="amount-sell"
                  placeholder="0.00"
                  v-model="amount"
                  class="placeholder-white placeholder-opacity-100"
                >
                <span class="absolute right-0 text-xl curren top-23">XE</span>

                <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="(!v$.amount.sufficientFunds.$pending && v$.amount.sufficientFunds.$invalid)">Insufficient funds.</div>
                <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="v$.amount.validAmount.$invalid">Invalid amount.</div>
                <div class="mt-5 form-group__error" style="color: #CD5F4E" v-if="v$.amount.withinSaleLimit.$invalid">The exchange maximum is {{exchangeRate.limit}} XE</div>
              </div>
            </div>

            <div class="mt-32 mb-8 form-group">
              <label class="flex items-center space-x-3">
                Exchange Rate
                <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`Last updated ${secondsSince(exchangeRate.date)}`">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <Amount :value="exchangeRate.rate" currency="USDC"/>
            </div>

            <div class="mt-32 mb-8 form-group">
              <label class="flex items-center space-x-3">
                Transaction Fee
                <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`This covers the cost of the Ethereum transaction`">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <Amount :value="fee" currency="XE"/>
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
            <div class="px-10 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
              <div class="md:flex">
                <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                  <div class="md:flex-grow">
                    <span class="block mb-3 text-gray">You are selling</span>
                    <span class="block text-xl text-white price">
                      {{ formatCurrency(amount) }} XE
                    </span>
                  </div>
                  <span class="flex justify-center p-12 pl-12 mx-auto mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
                    <img src="/assets/logo.svg" alt="XE" class="flex-shrink-0">
                  </span>
                  <span class="block mx-auto my-12 icon-arrow md:absolute md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                    <ArrowRightIcon class="hidden md:block"/>
                    <ArrowDownIcon class="block md:hidden"/>
                  </span>
                </div>
                <div class="right md:w-1/2 md:flex md:pl-18">
                  <span class="flex justify-center p-8 mx-auto mb-12 bg-white border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                    <img src="/assets/usd-coin-usdc-logo.svg" alt="USDC" class="flex-shrink-0">
                  </span>
                  <div class="md:flex-grow">
                    <span class="block mb-3 text-gray">You will receive</span>
                    <span class="block text-xl text-white price">
                      {{ formatCurrency(calculatedUSDC) }} USDC
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
              <button class="w-full button button--outline-success"
                  @click="closeSell();">
                Cancel
              </button>
              <button class="w-full button button--success"
                @click="validateFields([v$.ethAddress, v$.amount]) && continueToSellConfirmation();"
              >
                Sell
              </button>
            </div>
          </div>
        </template>
      </Modal>
      <Modal v-if="showSellStep2 === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <h2 class="mb-8">Sell XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
          <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(wallet.balance) }} XE available</span>
        </template>
        <template v-slot:body>
          <div class="pb-12 min-h-300">
            <div class="form-group mb-14">
              <label>You are selling</label>
              <Amount :value="amount" currency="XE"/>
            </div>

            <div class="form-group mb-14">
              <label class="label">From</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ wallet.address }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label class="label">To</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ ethAddress }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label class="flex items-center space-x-3">
                Transaction Fee
                <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`This covers the cost of the Ethereum transaction`">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <Amount :value="fee" currency="XE"/>
            </div>

            <div class="form-group mb-14">
              <label class="flex items-center space-x-3">
                Exchange Rate
                <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`Last updated ${secondsSince(exchangeRate.date)}`">
                  <InformationCircleIcon class="hidden md:block button__icon w-15" />
                </Tooltip>
              </label>
              <Amount :value="exchangeRate.rate" currency="USDC"/>
            </div>

            <div class="form-group mb-14">
              <label class="flex items-center space-x-3">
                You will receive
              </label>
              <Amount :value="calculatedUSDC" currency="USDC"/>
            </div>
          </div>

          <div v-if="!withinSaleLimit()"
              class="px-20 py-20 mb-24 text-center bg-black border border-gray-700 rounded convert-info md:text-left red border-opacity-30 border-color">
            <div class="">
              <span class="flex w-full overflow-hidden overflow-ellipsis text-red">
                Exchange rate has been updated. The exchange maximum is now {{exchangeRate.limit}} XE.
              </span>
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 py-32 border-t border-gray-700 border-opacity-30">
            <div class="mb-24 form-group" :class="{'form-group__error': v$.passphraseWithdraw.$error}">
              <form>
                <label for="pass-sell">ENTER PASSWORD</label>
                <div class="relative input-wrap">
                  <span class="icon">
                    <LockOpenIcon/>
                  </span>
                  <input
                    autocomplete="off"
                    type="password"
                    placeholder='Your password'
                    id="pass-sell"
                    v-model="password"
                    @keypress="(event) => handleEnterKeyConfirmSell(event)"
                  />
                </div>
                <div class="form-group__error" v-if="invalidPassword">Password incorrect.</div>
              </form>
            </div>

            <div v-if="errorMessage !== ''"
                class="px-20 py-20 text-center bg-black border border-gray-700 rounded convert-info md:text-left red border-opacity-30 border-color">
              <div class="">
                <span class="flex w-full overflow-hidden overflow-ellipsis text-red">
                  An error has occurred ({{ errorMessage }}). Please try again.
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-24 pt-12 md:grid-cols-2">
              <button class="w-full button button--outline-success" @click="() => {
                hideModal(slotProps, 'showSellStep2')
                showOtherModal(slotProps, 'showSellStep')
              }">
                Back
              </button>
              <button
                class="w-full button button--success"
                :disabled="!withinSaleLimit()"
                @click="confirmSell()"
              >
                Confirm
              </button>
            </div>
          </div>
        </template>
      </Modal>
      <Modal v-if="showSellStep3 === true" :opened="true" :closeHandler="swallowClose">
        <template v-slot:header>
          <h2 class="mb-8">Sale accepted<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        </template>
        <template v-slot:body>
          <div class="pb-14 min-h-410">

            <div class="form-group mb-14">
              <label>You are selling</label>
              <Amount :value="currentTx.amount / 1e6" currency="XE"/>
            </div>

            <div class="form-group mb-14">
              <label>From</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ wallet.address }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label>To</label>
              <div class="relative input-wrap">
                <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                  {{ currentTx.data.destination }}
                </span>
              </div>
            </div>

            <div class="form-group mb-14">
              <label>Transaction Fee</label>
              <Amount :value="fee" currency="XE"/>
            </div>

            <div class="form-group mb-14">
              <label>Exchange Rate</label>
              <Amount :value="currentTx.exchangeRate" currency="USDC"/>
            </div>

            <div class="form-group mb-14">
              <label>You will receive</label>
              <Amount :value="currentTx.usdcAmount" currency="USDC"/>
            </div>

            <div class="flex items-center mt-24 leading-8 text-gray">
              <p class="mb-0">Your request has been accepted and should be processed soon. If your request cannot be processed for any reason, your XE will be returned.</p>
            </div>
          </div>
        </template>

        <template v-slot:footer="slotProps">
          <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
            <button class="block w-full mx-auto text-center button button--success md:w-1/2"
                @click="closeSell();">
              Close
            </button>
          </div>
        </template>
      </Modal>
    </div>
  </div>
</template>

<style scoped>
.account-panel {
  @apply bg-black-100 pt-16 pb-30;
}

.account-panel .container {
  @apply flex flex-col justify-between items-center;
}

.account-panel__left,
.account-panel__right {
  @apply w-full;
}

.account-panel__address {
  @apply text-gray text-sm2 mb-7 w-full;
}

.account-panel__address span {
  @apply text-white break-all block;
}

.account-panel__balance h3 {
  @apply text-green mb-5;
}

.account-panel__balance h1 {
  @apply text-white mb-0 font-normal;
}

.account-panel__balance h1 sub {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-6 grid-cols-1 w-full flex-shrink-0 mt-12;
}

.account-panel__buttons button {
  @apply w-full;
}

.account-panel__balance {
  @apply flex-grow mb-6;
}

.account-panel__modals {
  width: 1px;
}

.account-panel__exchange-img {
  height: 24px;
}

@screen md {
  .account-panel .container {
    @apply flex flex-row justify-between items-end;
  }

  .account-panel__left,
  .account-panel__right {
    @apply w-auto;
  }

  .account-panel__address {
    @apply pr-9 my-12;
  }

  .account-panel__info {
    @apply flex items-center justify-between;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid grid-cols-2 mt-0;
  }

  .account-panel__buttons > button {
    width: 170px;
  }

  .account-panel__balance {
    @apply mb-0;
  }
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}
</style>

<script>
import {
  ArrowDownIcon,
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  InformationCircleIcon,
  KeyIcon,
  LockOpenIcon,
  ShieldExclamationIcon
} from '@heroicons/vue/solid'
import {
  SwitchHorizontalIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/outline'

import Amount from "@/components/Amount"
import AutoNumeric from 'autonumeric'
import Logo from "@/components/Logo"
import Modal from "@/components/Modal"
import Radio from '@/components/Radio'
import Tooltip from '@/components/Tooltip'

import detectEthereumProvider from "@metamask/detect-provider"
import MetaMaskOnboarding from '@metamask/onboarding'
import { ethers } from 'ethers'
import { required, minLength, numeric } from '@vuelidate/validators'
import useVuelidate from "@vuelidate/core"

import { fetchPendingTransactions, fetchGasRates, fetchExchangeRates, getNonce, sendTransaction } from '../utils/api'
import { createTransaction, createWithdrawalTransaction, validatePassword } from '../utils/wallet'

const { utils } = ethers

const {
  version,
  addresses,
  bridge,
  token
} = require("@edge/bridge-utils")

const {
  formatXe,
  toMicroXe,
  xeStringFromMicroXe
} = require('@edge/wallet-utils')

const { detect } = require('detect-browser')
const browser = detect()

export default {
  name: "AccountPanel",
  setup() {
    return {v$: useVuelidate()}
  },
  components: {
    Amount,
    ArrowDownIcon,
    ArrowNarrowLeftIcon,
    ArrowNarrowRightIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    CheckIcon,
    CurrencyDollarIcon,
    KeyIcon,
    InformationCircleIcon,
    LockOpenIcon,
    Logo,
    Modal,
    Radio,
    ShieldExclamationIcon,
    SwitchHorizontalIcon,
    Tooltip
  },
  validations() {
    return {
      passphraseWithdraw: {
        required,
        minLength: minLength(10)
      },
      xeAddress: {
        required,
        validAddress: (value) => this.validAddress(value)
      },
      ethAddress: {
        required,
        validAddress: (value) => this.validAddress(value, 'ETH')
      },
      sendMemo: {
        validMemo: this.validMemo
      },
      password: {
        required,
        minLength: minLength(10)
      },
      amount: {
        required,
        sufficientFunds: async (value) => {
          const result = await this.sufficientFundsXe(value)
          return result
        },
        validAmount: this.validAmount,
        withinSaleLimit: this.withinSaleLimit
      },
      edgeAmount: {
        numeric,
        required,
        sufficientFunds: this.sufficientFundsEdge,
        validAmount: this.validAmount
      }
    }
  },
  mounted() {
    if (browser && this.supportedBrowsers.includes(browser.name)) {
      this.supportedBrowser = true
    } else {
      this.supportedBrowser = false
    }
  },
  unmounted() {
    this.stopExchangeRateUpdateCycle()
    this.stopGasRatesUpdateCycle()
  },
  watch: {
    amount: ['calculateEdge', 'calculateUSDC'],
    edgeAmount: 'calculateDepositFee'
  },
  methods: {
    calculateEdge() {
      const { handlingFeePercentage, minimumHandlingFee } = this.gasRates
      const percentageFee = this.amount * (handlingFeePercentage / 100)
      this.minimumFee = percentageFee < minimumHandlingFee ? minimumHandlingFee : percentageFee
      this.fee = Math.round(this.minimumFee + this.selectedFeeLevel)
      this.calculatedEdge = this.amount - this.fee > 0 ? this.amount - this.fee : 0
    },
    calculateUSDC() {
      const { handlingFeePercentage, minimumHandlingFee } = this.gasRates
      const percentageFee = this.amount * (handlingFeePercentage / 100)
      this.minimumFee = percentageFee < minimumHandlingFee ? minimumHandlingFee : percentageFee
      this.fee = Math.round(this.minimumFee + this.exchangeRate.gas)
      const xeToExchange = this.amount - this.fee > 0 ? this.amount - this.fee : 0
      this.calculatedUSDC = xeToExchange * this.exchangeRate.rate
    },
    calculateDepositFee() {
      const { handlingFeePercentage, minimumHandlingFee } = this.gasRates
      const percentageFee = this.edgeAmount * (handlingFeePercentage / 100)
      this.fee = Math.round(percentageFee < minimumHandlingFee ? minimumHandlingFee : percentageFee)
      this.calculatedXe = this.edgeAmount - this.fee > 0 ? this.edgeAmount - this.fee : 0
    },
    secondsSince(date) {
      if (typeof date === 'string') date = new Date(date)
      const ms = Date.now() - date.getTime()
      const s = Math.floor(ms / 1000)
      const unit = s === 1 ? 'second' : 'seconds'
      return `${s} ${unit} ago`
    },
    startExchangeRateUpdateCycle() {
      this.exchangeRateUpdateCycle = setInterval(async () => {
        this.exchangeRate = await fetchExchangeRates()
      }, this.exchangeRateUpdateInterval)
    },
    stopExchangeRateUpdateCycle() {
      clearInterval(this.exchangeRateUpdateCycle)
    },
    startGasRatesUpdateCycle() {
      this.gasRatesUpdateCycle = setInterval(async () => {
        this.gasRates = await fetchGasRates()
      }, this.gasRatesUpdateInterval)
    },
    stopGasRatesUpdateCycle() {
      clearInterval(this.gasRatesUpdateCycle)
    },
    formatAmount(input, skipValidation) {
      if (skipValidation && this.v$.amount.$invalid) {
        return formatXe(0, true)
      }

      return formatXe(input, true)
    },
    formatCurrency(input) {
      return Number(input).toLocaleString('en-US', { maximumFractionDigits: 6 })
    },
    populateAmount(percentage) {
      this.amount = (parseFloat(this.fromMicroXe(this.wallet.balance)) * (percentage / 100)).toFixed(6)
    },
    populateEdgeAmount(percentage) {
      this.edgeAmount = (parseFloat(this.edgeBalance) * (percentage / 100)).toFixed(6)
    },
    validAmount(value) {
      if (!this.v$.amount) return true

      // Remove commas, otherwise the parseFloat call will remove all characters after the first comma.
      value = typeof value === 'string' ? value.replace(/,/g, '') : value

      if (!/^([0-9]{1,9}\.?[0-9]{0,6})$/.test(value) && this.v$.amount.$dirty) return false

      const enteredAmount = parseFloat(value)
      if (isNaN(enteredAmount) && this.v$.amount.$dirty) return false
      if (enteredAmount <= 0 && this.v$.amount.$dirty) return false
      if (this.calculatedUSDC <= 0) return false

      return true
    },
    sufficientFundsEdge(value) {
      if (!this.v$.edgeAmount || !value) return true
      if (!value && !this.edgeBalance) return true

      const enteredAmount = parseFloat(value)

      // Check amount is less than the MetaMask balance.
      return enteredAmount <= parseFloat(this.edgeBalance)
    },
    async sufficientFundsXe(value) {
      if (!this.v$.amount || !value) return true
      if (!value && !this.wallet.balance) return true

      // Determine amount of XE currently in pending txs.
      const pendingTxs = await fetchPendingTransactions(this.wallet.address)

      const pendingTxTotal = pendingTxs.reduce((accumulator, currentItem) => {
        if (currentItem.sender === this.wallet.address) {
          accumulator += Number(currentItem.amount)
        }

        return accumulator
      }, 0)

      const enteredAmount = parseFloat(value)

      // Check amount is less than the wallet balance.
      return enteredAmount <= parseFloat(this.fromMicroXe(this.wallet.balance) - this.fromMicroXe(pendingTxTotal))
    },
    withinSaleLimit() {
      const isSellScreen = this.showSellStep || this.showSellStep2
      return !isSellScreen || this.amount <= this.exchangeRate.limit
    },
    validAddress(value, type = 'XE') {
      const lengths = {
        XE: 43,
        ETH: 42
      }

      const patterns = {
        XE: /^xe_[a-fA-F0-9]+$/,
        ETH: /^0x[a-fA-F0-9]+$/
      }

      if (value.length !== lengths[type]) {
        return false
      }

      const regex = new RegExp(patterns[type])
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
    selectFeeLevel(value) {
      this.selectedFeeLevel = value
      this.calculateEdge()
    },
    openSend() {
      this.showSendStep = true
    },
    openExchange() {
      // Validate the EDGE value - it should be zero and invalid to begin.
      this.validateFields([this.v$.edgeAmount])
      this.showExchangeOptions = true
    },
    closeExchange() {
      this.showExchangeOptions = false
    },
    async openDeposit() {
      this.gasRates = await fetchGasRates()
      this.showExchangeOptions = false
      this.showDepositStep = true
    },
    closeDeposit() {
      this.showExchangeOptions = false
      this.showDepositStep = false
      this.showDepositStep2 = false
      this.showDepositStep3 = false
    },
    async openWithdraw() {
      this.gasRates = await fetchGasRates()
      this.selectedFeeLevel = this.gasRates.average
      this.calculateEdge()

      this.showExchangeOptions = false
      this.showWithdrawStep = true
    },
    closeWithdraw() {
      this.showExchangeOptions = false
      this.showWithdrawStep = false
      this.showWithdrawStep2 = false
      this.showWithdrawStep3 = false
    },
    openWithdrawalConfirmation() {
      this.showWithdrawStep = false
      this.showWithdrawStep2 = true
    },
    clearForm() {
      this.amount = ''
      this.xeAddress = ''
      this.ethAddress = ''
      this.sendMemo = ''

      this.v$.amount.$reset()
      this.v$.xeAddress.$reset()
      this.v$.ethAddress.$reset()
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
        const amount = this.amount.replace(/,/g, '')
        const nonce = await getNonce(this.wallet.address)
        const tx = await createTransaction(amount, { memo: this.sendMemo }, nonce, this.xeAddress)

        // Send transaction to the blockchain.
        const txResponse = await sendTransaction(tx)

        const { metadata, results } = txResponse

        if (metadata.accepted) {
          this.v$.amount.$reset()

          this.currentTx = tx
          this.amount = 0
          this.password = ''
          this.xeAddress = ''
          this.sendMemo = ''
          this.showSendStep = false
          this.showSendStep2 = false
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
    handleEnterKeyConfirmWithdraw(event) {
      const { key, code, charCode } = event

      if (key === 'Enter' || code === 'Enter' || charCode === 13) {
        event.preventDefault()

        return this.confirmWithdraw()
      }
    },
    handleEnterKeyConfirmSell(event) {
      const { key, code, charCode } = event

      if (key === 'Enter' || code === 'Enter' || charCode === 13) {
        event.preventDefault()

        return this.confirmSell()
      }
    },
    async confirmWithdraw() {
      const isValidPassword = await validatePassword(this.password)

      if (isValidPassword) {
        // Create tx object.
        const nonce = await getNonce(this.wallet.address)
        const tx = await createWithdrawalTransaction(this.amount, {
          destination: this.ethAddress,
          fee: toMicroXe(this.fee),
          memo: 'XE Withdrawal',
          token: 'EDGE'
        }, nonce)

        // Send transaction to the blockchain.
        const txResponse = await sendTransaction(tx)

        // TODO: Handle accepted/rejected status.
        const { metadata, results } = txResponse

        if (metadata.accepted) {
          this.currentTx = tx
          this.currentTx.edgeAmount = this.calculatedEdge

          this.password = ''
          this.showWithdrawStep = false
          this.showWithdrawStep2 = false
          this.showWithdrawStep3 = true

          this.clearForm()

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
    async openSell() {
      this.gasRates = await fetchGasRates()
      this.exchangeRate = await fetchExchangeRates()
      this.startExchangeRateUpdateCycle()
      this.showExchangeOptions = false
      this.showSellStep = true
    },
    closeSell() {
      this.stopExchangeRateUpdateCycle()
      this.showSellStep = false
      this.showSellStep2 = false
      this.showSellStep3 = false
    },
    continueToSellConfirmation() {
      this.showSellStep = false
      this.showSellStep2 = true
    },
    async confirmSell() {
      const isValidPassword = await validatePassword(this.password)

      if (isValidPassword) {
        this.stopExchangeRateUpdateCycle()
        this.stopGasRatesUpdateCycle()

        // Create tx object.
        const nonce = await getNonce(this.wallet.address)
        const tx = await createWithdrawalTransaction(this.amount, {
          destination: this.ethAddress,
          ref: this.exchangeRate.ref,
          memo: 'XE Sale',
          token: 'USDC'
        }, nonce)

        // Send transaction to the blockchain.
        const txResponse = await sendTransaction(tx)

        // TODO: Handle accepted/rejected status.
        const { metadata, results } = txResponse

        if (metadata.accepted) {
          this.currentTx = tx
          this.currentTx.fee = this.fee
          this.currentTx.exchangeRate = this.exchangeRate.rate
          this.currentTx.usdcAmount = this.calculatedUSDC

          this.password = ''
          this.showSellStep = false
          this.showSellStep2 = false
          this.showSellStep3 = true

          this.clearForm()

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

        // slotProps.close()
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
    getHashUrl() {
      return `${this.etherscanUrls[this.chainId]}/tx/${this.tx.hash}`
    },
    async connect() {
      try {
        await ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        /**********************************************************/
        /* Handle chain (network) and chainChanged (per EIP-1193) */
        /**********************************************************/

        const chainId = await ethereum.request({ method: "eth_chainId" })
        this.chainId = chainId
        this.ethereumNetwork = this.networks[this.chainId].label

        const handleChainChanged = _chainId => {
          // We recommend reloading the page, unless you must do otherwise
          window.location.reload()
        }

        const handleAccountChanged = async accounts => {
          if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            console.log("Please connect to MetaMask.");
          } else if (accounts[0] !== this.ethereumAddress) {
            this.ethereumAddress = accounts[0]

            this.edgeContract = new ethers.Contract(
              addresses[this.networks[this.chainId].key].token,
              token.abi,
              provider.getSigner(0)
            )

            const balance = await this.edgeContract.balanceOf(this.ethereumAddress)
            this.edgeBalance = utils.formatEther(balance.toString())
          }

          return Promise.resolve()
        }

        // Handle Ethereum account change.
        ethereum.on("accountsChanged", handleAccountChanged)
        // Handle Ethereum network change.
        ethereum.on("chainChanged", handleChainChanged)

        ethereum
          .request({ method: 'eth_accounts' })
          .then(handleAccountChanged)
          .then(() => {
            this.showDepositStep = false
            this.showDepositStep2 = true
          })
      } catch (error) {
        console.error(error)
      }

      return

      const provider = await detectEthereumProvider();

      if (provider) {
        // From now on, this should always be true:
        // provider === window.ethereum
        // startApp(provider); // initialize your app
        console.log("provider", provider);

        /**********************************************************/
        /* Handle chain (network) and chainChanged (per EIP-1193) */
        /**********************************************************/

        const chainId = await ethereum.request({ method: "eth_chainId" });
        console.log("chainId", chainId);
        // handleChainChanged(chainId);

        ethereum.on("chainChanged", handleChainChanged);

        function handleChainChanged(_chainId) {
          // We recommend reloading the page, unless you must do otherwise
          window.location.reload();
        }

        let currentAccount = null;

        // For now, 'eth_accounts' will continue to always return an array
        const handleAccountsChanged = accounts => {
          console.log('accounts', accounts)
          if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            console.log("Please connect to MetaMask.");
          } else if (accounts[0] !== currentAccount) {
            currentAccount = accounts[0];
            // Do any other work!

            this.ethereumAddress = accounts[0];
          }
        }

        ethereum.on("accountsChanged", handleAccountsChanged);

        ethereum
          .request({ method: "eth_accounts" })
          .then(handleAccountsChanged)
          .catch((err) => {
            // Some unexpected error.
            // For backwards compatibility reasons, if no accounts are available,
            // eth_accounts will return an empty array.
            console.error(err);
          });

        // Note that this event is emitted on page load.
        // If the array of accounts is non-empty, you're already
        // connected.
        ethereum.on("accountsChanged", handleAccountsChanged);


        ethereum
          .request({ method: "eth_requestAccounts" })
          .then(handleAccountsChanged)
          .catch((err) => {
            if (err.code === 4001) {
              // EIP-1193 userRejectedRequest error
              // If this happens, the user rejected the connection request.
              console.log("Please connect to MetaMask.");
            } else {
              console.error(err);
            }
          });
      } else {
        console.log("Please install MetaMask!");
      }
    },
    async exchange(fields) {
      if (this.validateFields(fields)) {
        try {
          this.depositInProgress = true
          this.depositMessage = 'Please confirm the transaction in MetaMask.'

          const amount = utils.parseEther(this.edgeAmount.toString())
          const bridgeAddress = addresses[this.networks[this.chainId].key].bridge
          const tx = await this.edgeContract.approveAndCall(bridgeAddress, amount.toString(), this.wallet.address)
          this.tx = tx

          // Show deposit confirmation screen.
          this.showDepositStep2 = false
          this.showDepositStep3 = true
        } catch (err) {
          if (err && err.code && err.code === 4001) {
            // User rejected the MetaMask transaction, display message and reenable the deposit button
            this.depositMessage = 'MetaMask transaction rejected, please try again.'
            this.depositInProgress = false
          }
        }
      }
    },
    fromMicroXe(mxe) {
      return xeStringFromMicroXe(mxe || 0)
    },
    formatMicroXe(mxe) {
      return xeStringFromMicroXe(mxe || 0, true)
    },
    initialise(metamaskButton) {
      if (!metamaskButton) {
        return
      }

      const isMetaMaskInstalled = () => {
        // Have to check the ethereum binding on the window object to see if it's installed
        const { ethereum } = window
        return Boolean(ethereum && ethereum.isMetaMask)
      }

      const onboarding = new MetaMaskOnboarding()

      const onClickInstall = () => {
        metamaskButton.innerText = 'Waiting for Metamask...'
        metamaskButton.disabled = true
        // Start the onboarding process for our end user.
        onboarding.startOnboarding()
      }

      const MetaMaskClientCheck = () => {
        if (!isMetaMaskInstalled()) {
          metamaskButton.innerText = 'Click to install MetaMask'
          metamaskButton.onclick = onClickInstall
          metamaskButton.disabled = !this.supportedBrowser
        } else {
          metamaskButton.innerText = 'Connect MetaMask'
          metamaskButton.onclick = this.connect
          metamaskButton.disabled = !this.supportedBrowser
        }
      }

      MetaMaskClientCheck()
    },
    // Empty function to ignore the modal close event.
    swallowClose () {}
  },
  data: function() {
    return {
      amount: '',
      calculatedEdge: 0,
      calculatedXe: 0,
      calculatedUSDC: 0,
      chainId: null,
      currentTx: null,
      depositInProgress: false,
      depositMessage: null,
      edgeAmount: 0,
      edgeBalance: 0,
      edgeContract: null,
      errorMessage: '',
      ethereumAddress: '',
      ethereumNetwork: '',
      etherscanUrls: {
        "0x1": 'https://etherscan.io',
        "0x4": 'https://rinkeby.etherscan.io'
      },
      exchangeRate: {},
      exchangeRateUpdateCycle: null,
      exchangeRateUpdateInterval: 2500,
      fee: 0,
      gasRates: {},
      gasRatesUpdateCycle: null,
      gasRatesUpdateInterval: 2500,
      invalidPassword: false,
      isModalVisible: false,
      minimumFee: 0,
      networks: {
        "0x1": {
          key: 'mainnet',
          label: 'Mainnet'
        },
        "0x4": {
          key: 'testnet',
          label: 'Rinkeby Testnet'
        }
      },
      selectedFeeLevel: 0,
      showDepositStep: false,
      showDepositStep2: false,
      showDepositStep3: false,
      showWithdrawStep: false,
      showWithdrawStep2: false,
      showWithdrawStep3: false,
      showSendStep: false,
      showSendStep2: false,
      showSendStep3: false,
      showExchangeOptions: false,
      showSellStep: false,
      showSellStep2: false,
      showSellStep3: false,
      showSellStep4: false,
      xeAddress: '',
      supportedBrowsers: ['brave', 'chrome', 'edge', 'firefox'],
      supportedBrowser: true,
      tx: null,
      ethAddress: '',
      sendMemo: '',
      password: '',
      passphraseWithdraw: '',
      isTestnet: process.env.VUE_APP_IS_TESTNET === true
    }
  },
  props: {
    wallet: {
      type: Object
    }
  }
}
</script>