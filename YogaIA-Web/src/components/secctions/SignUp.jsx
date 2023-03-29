import React, { useState } from 'react'
import WebcamImage from '../WebCamImage'
import FaceRecognition from './FaceRecognition'

export const SignUp = () => {
    const [webCam, setWebCam] = useState(false)
    return (
        <>
            <h1 className="text-6xl font-semibold ">
                <p className="mb-6 text-white">Registro Nuevo</p>
            </h1>
            <div className="mt-5 mb-5">
                <p className="text-white">Cargar una imagen o usar Camara</p>
            </div>
            <div className="flex mb-4">
                <div className="w-1/4 p-2 text-center">
                    <div className="group relative py-3 leading-tight font-extrabold transition">
                        <button
                            className={`text-sm transition inline-flex items-center  font-semibold border rounded-lg px-6 py-3 text-primary hover:border-orangeColor hover:bg-transparent text-white ${
                                webCam
                                    ? 'border-orangeColor bg-orangeColor'
                                    : ' bg-transparent'
                            }`}
                            onClick={() => setWebCam(false)}
                        >
                            Subir Imagen
                        </button>
                    </div>
                    <div className="group relative py-3 leading-tight font-extrabold transition">
                        <button
                            className={`text-sm transition inline-flex items-center  font-semibold border rounded-lg px-6 py-3 text-primary hover:border-orangeColor hover:bg-transparent text-white ${
                                !webCam
                                    ? 'border-orangeColor bg-orangeColor'
                                    : ' bg-transparent'
                            }`}
                            onClick={() => setWebCam(true)}
                        >
                            Tomar Foto
                        </button>
                    </div>
                </div>
                <div className="w-full p-2 text-center">
                    {webCam ? <WebcamImage /> : <FaceRecognition />}
                </div>
            </div>
        </>
    )
}
