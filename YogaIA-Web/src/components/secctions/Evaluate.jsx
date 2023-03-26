import React from 'react'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'

export const Evaluate = () => {
    const login = localStorage.getItem('login')
    return login === 'true' ? <SignIn /> : <SignUp />
}
