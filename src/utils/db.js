import { clear as kvClear, get as kvGet, getMany, set as kvSet, setMany, createStore } from 'idb-keyval'

const edgeStore = createStore('edge', 'wallet')

const clear = async () => {
  await kvClear(edgeStore)
}

const get = async key => {
  let returnValue

  if (Array.isArray(key)) {
    returnValue = await getMany(key, edgeStore)
  } else {
    returnValue = await kvGet(key, edgeStore)
  }

  return returnValue
}

const set = async (key, value) => {
  await kvSet(key, value, edgeStore)
}

export {
  clear,
  get,
  set
}
