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
            <div className="flex mt-10">
                <div className="w-2/4 p-2 text-center">
                    <CameraFaceDetect />
                </div>
                <div className="w-2/4 p-2 text-center">
                    Mostrar detalles del Usuario identificado.
                </div>
            </div>
        </>
    )
}
