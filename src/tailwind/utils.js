const round = (number) => {
  return number
    .toFixed(7)
    .replace(/(\.\d+?)0+$/, '$1')
    .replace(/\.0$/, '')
}

const rem = (px, base = 16) => {
  return `${round(px / base)}rem`
}

const em = (px, base = 16) => {
  return `${round(px / base)}em`
}

const media = (resolution, mobileFirst = true) => {
  if (mobileFirst) {
    return `@media (min-width: ${resolution})`
  }

  return `@media (max-width: ${resolution - 1})`
}

const urlFriendlyColor = ($color) => {
  return $color.replace('#', '%23')
}

module.exports = { round, rem, em, media, urlFriendlyColor }
