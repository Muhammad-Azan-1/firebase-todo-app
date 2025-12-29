"use client"
import React ,{FC , ReactNode} from 'react'
import store from '@/redux/store/store'
import { Provider } from 'react-redux'
import AuthProvder from '../AuthProvider/AuthProvder'

const ProviderComponent  = ({children} : {children : ReactNode}) => {
  return (
    <>
    <Provider store={store}>
      <AuthProvder>
        {children}
        </AuthProvder>
    </Provider>
    </>
  )
}

export default ProviderComponent