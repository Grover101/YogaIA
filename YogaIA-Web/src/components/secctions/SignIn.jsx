import React from 'react'
import { CameraFaceDetect } from './CameraFaceDetect'

export const SignIn = () => {
    return (
        <>
            <h1 className="text-6xl font-semibold ">
                <p className="mb-6 text-white">
                    Login - Identificacion Usuario
                </p>
            </h1>
            <div className="mt-5 mb-5">
                <p className="text-white">
                    Uso de Camara, una vez identificado compruebe sus datos.
                </p>
            </div>
            <CameraFaceDetect />
        </>
    )
}
