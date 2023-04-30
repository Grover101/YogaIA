import { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import * as poseDetection from '@tensorflow-models/pose-detection'
import * as tf from '@tensorflow/tfjs'
import { useStopwatch } from 'react-timer-hook'
import { Link } from 'react-router-dom'

import { Icons } from './../Icons'
import { yearOld } from '../../helpers/validation'
import { POINTS, keyPointConnections } from '../../utils/data'
import { drawPoint, drawSegment } from '../../utils/helper'

import tree from '../../assets/tree.jpg'
import traingle from '../../assets/traingle.jpg'
import warrior from '../../assets/warrior.jpg'
import chair from '../../assets/chair.jpg'

const WIDTH = 640
const HEIGHT = 480

let skeletonColor = 'rgb(255,255,255)'
const imgPose = {
    Chair: chair,
    Chakravakasana: chair,
    Cobra: chair,
    DwiPadaViparitaDandasana: chair,
    Shoudler: chair,
    Traingle: traingle,
    Tree: tree,
    Warrior: warrior
}
const poseList = [
    'Chair',
    'Chakravakasana',
    'Cobra',
    'DwiPadaViparitaDandasana',
    'Shoudler',
    'Traingle',
    'Tree',
    'Warrior'
]

let flag = false
let end = false
let interval
const poseEnd = {
    position: 0,
    name: 'Ninguno',
    porcentaje: 0,
    time: new Date('August 19, 1975 0:0:0'),
    bestPorcentaje: 0,
    bestTime: new Date('August 19, 1975 0:0:0'),
    image: null
}
let poseCorrect = []

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
                        <ul className="mt-5">
                            <li>
                                Mejor Tiempo:
                                {poseEnd.bestTime.getHours() < 10
                                    ? ` 0${poseEnd.bestTime.getHours()}`
                                    : poseEnd.bestTime.getHours()}
                                :
                                {poseEnd.bestTime.getMinutes() < 10
                                    ? `0${poseEnd.bestTime.getMinutes()}`
                                    : poseEnd.bestTime.getMinutes()}
                                :
                                {poseEnd.bestTime.getSeconds() < 10
                                    ? `0${poseEnd.bestTime.getSeconds()}`
                                    : poseEnd.bestTime.getSeconds()}
                            </li>
                            <li>
                                Tiempo:
                                {poseEnd.time.getHours() < 10
                                    ? ` 0${poseEnd.time.getHours()}`
                                    : poseEnd.time.getHours()}
                                :
                                {poseEnd.time.getMinutes() < 10
                                    ? `0${poseEnd.time.getMinutes()}`
                                    : poseEnd.time.getMinutes()}
                                :
                                {poseEnd.time.getSeconds() < 10
                                    ? `0${poseEnd.time.getSeconds()}`
                                    : poseEnd.time.getSeconds()}
                            </li>
                            <li>Mejor Evaluacion: {poseEnd.bestPorcentaje}%</li>
                            <li>Evaluacion: {poseEnd.porcentaje}%</li>
                        </ul>
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
