import CreatePage from '@/components/create'
import React, { Suspense } from 'react'
import Loading from '../Loading'

const create = () => {
  return (
    <div>
      <Suspense fallback={<Loading/>}>
      <CreatePage />
      </Suspense>
    </div>
  )
}

export default create