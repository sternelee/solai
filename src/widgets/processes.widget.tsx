import {LegendList, LegendListRef} from '@legendapp/list'
import clsx from 'clsx'
import {Key} from 'components/Key'
import {MainInput} from 'components/MainInput'
import {observer} from 'mobx-react-lite'
import prettyBytes from 'pretty-bytes'
import {FC, useEffect, useRef} from 'react'
import {Text, View} from 'react-native'
import {useStore} from 'store'
import {Process} from 'stores/processes.store'

const RenderItem = observer(({item, index}: any) => {
  const store = useStore()
  const selectedIndex = store.ui.selectedIndex
  const process: Process = item as any
  const isActive = index === selectedIndex
  return (
    <View
      className={clsx('px-2 py-1 flex-row rounded mx-2', {
        highlight: isActive,
      })}>
      {/* <Text
                className={clsx('text-sm w-28 text px-4 py-2', {
                  'dark:text-white': isActive,
                })}>
                {process.pid}
              </Text> */}
      <Text
        className={clsx('text-sm flex-1 text px-4 py-2', {
          'text-white dark:text-white': isActive,
        })}>
        {process.processName}
      </Text>
      <Text
        className={clsx('text-sm w-28 text px-4 py-2', {
          'text-white dark:text-white': isActive,
        })}>
        {prettyBytes(process.mem * 1024)}
      </Text>
      <Text
        className={clsx('text-sm w-28 text px-4 py-2', {
          'text-white dark:text-white': isActive,
        })}>
        {Math.round(process.cpu)}%
      </Text>
    </View>
  )
})

export const ProcessesWidget: FC = observer(() => {
  const store = useStore()
  const data = store.processes.filteredProcesses
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<LegendListRef | null>(null)

  useEffect(() => {
    if (data.length > 0) {
      listRef.current?.scrollToIndex({
        index: store.ui.selectedIndex,
        viewOffset: 80,
      })
    }
  }, [selectedIndex])

  useEffect(() => {
    store.processes.fetchProcesses()
    let interval = setInterval(() => {
      store.processes.fetchProcesses()
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <View className="flex-1">
      <View className="flex-row px-3">
        <MainInput placeholder="Search processes..." showBackButton />
      </View>
      <LegendList
        data={data}
        className="flex-1"
        contentContainerClassName="flex-grow"
        ref={listRef}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center">
            <Text className="dark:text-neutral-700 text-sm text-neutral-500">
              No items
            </Text>
          </View>
        }
        keyExtractor={(_, index) => index.toString()}
        ListHeaderComponent={() => {
          return (
            <View className="flex-row px-4 py-2 border-b border-color mb-2">
              {/* <Text className="w-28 font-semibold px-4">ID</Text> */}
              <Text className="flex-1 font-semibold px-4">Process Name</Text>
              <Text className="w-28 font-semibold px-4">Memory</Text>
              <Text className="w-28 font-semibold px-4">CPU</Text>
            </View>
          )
        }}
        renderItem={RenderItem}
      />

      <View className="py-2 px-4 flex-row items-center justify-end gap-1 subBg">
        <Text className="text-sm mr-2">Kill process</Text>
        <Key symbol={'⏎'} primary />
      </View>
    </View>
  )
})
