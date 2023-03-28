import React from 'react'
import { Link } from 'react-router-dom'
import { Evaluation } from './Evaluation'
import yogaLogin from './../../assets/yogaLogin.png'

export const Evaluate = () => {
    const login = localStorage.getItem('login')
    return login === 'true' ? (
        <Evaluation />
    ) : (
        <>
            <h1 className="text-6xl font-semibold ">
                <p className="mb-6 text-white">Inicia Algo Nuevo</p>
            </h1>
            <p className="text-white">Si eres nuevo registrate!</p>
            <div className="flex justify-center items-center">
                <div className="text-center">
                    <div className="w-2/3 m-auto mt-5">
                        <img src={yogaLogin} alt="" />
                    </div>
                    <div className="mt-5">
                        <Link
                            to="/login"
                            className="text-sm transition inline-flex items-center font-semibold border rounded-lg px-6 mr-20 py-3 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm transition inline-flex items-center font-semibold border rounded-lg px-6 py-3 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}
