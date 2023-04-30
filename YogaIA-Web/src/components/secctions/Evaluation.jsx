import { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import * as poseDetection from '@tensorflow-models/pose-detection'
import * as tf from '@tensorflow/tfjs'
import { useStopwatch } from 'react-timer-hook'
import { Link } from 'react-router-dom'

import { Icons } from './../Icons'
import { yearOld } from '../../helpers/validation'

const WIDTH = 640
const HEIGHT = 480

export const Evaluation = () => {
    const webcam = useRef(null)
    const canvasRef = useRef(null)
    const { hours, seconds, minutes, pause, reset } = useStopwatch({
        autoStart: false
    })

    const [pose, setPose] = useState('')

    // const [resetPlay, setResetPlay] = useState(false)

    const user = JSON.parse(localStorage.getItem('user'))
    const videoConstraints = {
        width: WIDTH,
        height: HEIGHT,
        facingMode: 'user'
    }

    return (
        <>
            <h1 className="text-6xl font-semibold ">
                <p className="mb-6 text-white">Identificacion y Evaluacion</p>
            </h1>
            <div className="mt-5 mb-10 text-white text-3xl">
                <div className="flex">
                    <div className="w-4/12">
                        <span className="font-bold">USUARIO: </span>
                        {`${user.name} ${user.lastName}`}
                    </div>
                    <div className="w-4/12">
                        <span className="font-bold">EDAD: </span>
                        {yearOld(user.date)}
                    </div>
                    <div className="w-4/12">
                        <span className="font-bold">GENERO: </span>
                        {user.genero}
                    </div>
                </div>
                <div className="text-center mt-8 text-6xl">
                    {hours < 10 ? `0${hours}` : hours}:
                    {minutes < 10 ? `0${minutes}` : minutes}:
                    {seconds < 10 ? `0${seconds}` : seconds}
                </div>
            </div>
            <div className="flex">
                <div className="w-2/4 p-2 text-center">
                    <div className="flex flex-col items-center">
                        <div
                            style={{
                                width: WIDTH,
                                height: HEIGHT,
                                position: 'relative'
                            }}
                        >
                            <Webcam
                                audio={false}
                                mirrored={true}
                                width={WIDTH}
                                height={HEIGHT}
                                ref={webcam}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                                className="rounded-xl"
                                style={{
                                    position: 'absolute',
                                    padding: '0px'
                                }}
                            />
                            <canvas
                                ref={canvasRef}
                                id="my-canvas"
                                width="640px"
                                height="480px"
                                style={{
                                    position: 'absolute',
                                    zIndex: 1
                                }}
                            ></canvas>
                        </div>
                    </div>
                </div>
                <div className="w-2/4 p-2 flex bg-white rounded-xl">
                    <div className="m-auto text-2xl">
                        <h3 className="text-orangeColor text-center mb-5 font-bold text-4xl">
                            {pose}
                        </h3>
                        <div>
                            <Icons.warrior className="m-auto" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex mt-9 text-center">
                <div className="w-2/4 px-3">
                    <button
                        className={`text-sm transition inline-flex items-center  font-semibold border rounded-lg px-6 py-2 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor`}
                        onClick={stopPose}
                    >
                        Finalizar Ejercicio
                    </button>
                    {/* {resetPlay ? (
                        <button
                            className={`text-sm transition inline-flex items-center  font-semibold border rounded-lg ml-4 px-6 py-2 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor`}
                            onClick={resetPose}
                        >
                            Reiniciar Ejercicio
                        </button>
                    ) : null} */}
                </div>
                <div className="w-2/4 px-3">
                    <Link
                        to="/profile"
                        className={`text-sm transition inline-flex items-center  font-semibold border rounded-lg px-6 py-2 text-primary hover:border-orangeColor hover:bg-transparent text-white border-orangeColor bg-orangeColor`}
                        onClick={stopPose}
                    >
                        Ver Historial
                    </Link>
                </div>
            </div>
        </>
    )
}
