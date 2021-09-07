// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

(function (window) {
  const activeClass = 'resize-active'
  const resetDelay = 500
  let flag = false
  let timer = null
  const removeClassHandler = () => {
    flag = false
    document.documentElement.classList.remove(activeClass)
  }
  const resizeHandler = () => {
    if (!flag) {
      flag = true
      document.documentElement.classList.add(activeClass)
    }
    clearTimeout(timer)
    timer = setTimeout(removeClassHandler, resetDelay)
  }
  window.addEventListener('resize', resizeHandler)
})(window)
