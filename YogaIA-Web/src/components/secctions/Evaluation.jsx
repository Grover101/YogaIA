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

    function getCenterPoint(landmarks, leftBodyPart, rightBodyPart) {
        const left = tf.gather(landmarks, leftBodyPart, 1)
        const right = tf.gather(landmarks, rightBodyPart, 1)
        const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5))

        return center
    }

    function getPoseSize(landmarks, torsoSizeMultiplier = 2.5) {
        const hipsCenter = getCenterPoint(
            landmarks,
            POINTS.LEFT_HIP,
            POINTS.RIGHT_HIP
        )
        const shouldersCenter = getCenterPoint(
            landmarks,
            POINTS.LEFT_SHOULDER,
            POINTS.RIGHT_SHOULDER
        )
        const torsoSize = tf.norm(tf.sub(shouldersCenter, hipsCenter))

        let poseCenterNew = getCenterPoint(
            landmarks,
            POINTS.LEFT_HIP,
            POINTS.RIGHT_HIP
        )
        poseCenterNew = tf.expandDims(poseCenterNew, 1)

        poseCenterNew = tf.broadcastTo(poseCenterNew, [1, 17, 2])
        // return: shape(17,2)
        const d = tf.gather(tf.sub(landmarks, poseCenterNew), 0, 0)
        const distMax = tf.max(tf.norm(d, 'euclidean', 0))

        // normalize scale
        const poseSize = tf.maximum(
            tf.mul(torsoSize, torsoSizeMultiplier),
            distMax
        )
        // console.log('pose Size: ', poseSize)
        return poseSize
    }

    function normalizePoseLandmarks(landmarks) {
        let poseCenter = getCenterPoint(
            landmarks,
            POINTS.LEFT_HIP,
            POINTS.RIGHT_HIP
        )
        poseCenter = tf.expandDims(poseCenter, 1)
        poseCenter = tf.broadcastTo(poseCenter, [1, 17, 2])
        landmarks = tf.sub(landmarks, poseCenter)

        const poseSize = getPoseSize(landmarks)
        landmarks = tf.div(landmarks, poseSize)
        // console.log('landmarks normalize: ', landmarks)
        return landmarks
    }

    function landmarksToEmbedding(landmarks) {
        // normalize landmarks 2D
        landmarks = normalizePoseLandmarks(tf.expandDims(landmarks, 0))
        const embedding = tf.reshape(landmarks, [1, 34])
        // const embedding = tf.reshape(landmarks, [1, 1, 34])
        return embedding
    }

    useEffect(() => {
        runMoveNet()
    }, [])

    const runMoveNet = async () => {
        const detectorConfig = {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
        }
        const detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            detectorConfig
        )
        // carga de modelo
        const poseClassifier = await tf.loadLayersModel(
            'http://localhost:9000/poses/model.json'
        )

        interval = setInterval(() => {
            detectPose(detector, poseClassifier)
        }, 100)
    }

    const detectPose = async (detector, poseClassifier) => {
        // console.log(end)
        if (!end) {
            if (
                typeof webcam.current !== 'undefined' &&
                webcam.current !== null &&
                webcam.current.video.readyState === 4
            ) {
                let notDetected = 0
                const video = webcam.current.video
                const pose = await detector.estimatePoses(video)
                const ctx = canvasRef.current.getContext('2d')
                ctx.clearRect(
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                )
                try {
                    const keypoints = pose[0].keypoints
                    const input = keypoints.map(keypoint => {
                        if (keypoint.score > 0.4) {
                            if (
                                !(
                                    keypoint.name === 'left_eye' ||
                                    keypoint.name === 'right_eye'
                                )
                            ) {
                                drawPoint(
                                    ctx,
                                    keypoint.x,
                                    keypoint.y,
                                    8,
                                    'rgb(255,255,255)'
                                )
                                const connections =
                                    keyPointConnections[keypoint.name]
                                try {
                                    connections.forEach(connection => {
                                        const conName = connection.toUpperCase()
                                        drawSegment(
                                            ctx,
                                            [keypoint.x, keypoint.y],
                                            [
                                                keypoints[POINTS[conName]].x,
                                                keypoints[POINTS[conName]].y
                                            ],
                                            skeletonColor
                                        )
                                    })
                                } catch (err) {
                                    // console.log(err)
                                }
                            }
                        } else {
                            notDetected += 1
                        }
                        return [keypoint.x, keypoint.y]
                    })
                    if (notDetected > 4) {
                        skeletonColor = 'rgb(255,255,255)'
                        pause()
                        // poseCorrect = []
                        flag = false

                        return
                    }
                    const processedInput = landmarksToEmbedding(input)
                    const classification =
                        poseClassifier.predict(processedInput)

                    classification.array().then(data => {
                        console.log(data[0])
                        // const classNo = CLASS_NO[currentPose]
                        // console.log(data[0][classNo])/
                        // setCurrentTime(new Date(Date()).getTime())
                        if (!flag) {
                            // setStartingTime(new Date(Date()).getTime())
                            reset()
                            flag = true
                            // 'Chair',
                            //     'Chakravakasana',
                            //     'Cobra',
                            //     'DwiPadaViparitaDandasana',
                            //     'Shoudler',
                            //     'Traingle',
                            //     'Tree',
                            //     'Warrior'
                        } else if (data[0][0] > 0.97) {
                            // Chair
                            skeletonColor = 'rgb(0,255,0)' // Green
                            poseCorrect.push(data[0])
                            setPose(poseList[0])
                        } else if (data[0][1] > 0.97) {
                            // Chakravakasana
                            skeletonColor = 'rgb(0,0,255)' // Blue
                            poseCorrect.push(data[0])
                            setPose(poseList[1])
                        } else if (data[0][2] > 0.97) {
                            // Cobra
                            skeletonColor = 'rgb(255,255,0)' // Yellow
                            setPose(poseList[2])
                            poseCorrect.push(data[0])
                        } else if (data[0][3] > 0.97) {
                            // DwiPadaViparitaDandasana
                            skeletonColor = 'rgb(255,0,255)' // Rose
                            setPose(poseList[3])
                            poseCorrect.push(data[0])
                        } else if (data[0][4] > 0.97) {
                            // Shoudler
                            skeletonColor = 'rgb(255,165,0)' // Orange
                            setPose(poseList[4])
                            poseCorrect.push(data[0])
                        } else if (data[0][5] > 0.97) {
                            // Traingle
                            skeletonColor = 'rgb(0,255,255)' // Light Blue
                            setPose(poseList[5])
                            poseCorrect.push(data[0])
                        } else if (data[0][6] > 0.97) {
                            // Tree
                            skeletonColor = 'rgb(128,0,128)' // Purple
                            setPose(poseList[6])
                            poseCorrect.push(data[0])
                        } else if (data[0][7] > 0.97) {
                            // Warrior
                            skeletonColor = 'rgb(128,128,128)' // Gray
                            setPose(poseList[7])
                            poseCorrect.push(data[0])
                        } else {
                            skeletonColor = 'rgb(255,255,255)'
                            // poseCorrect.push(data[0])
                        }
                    })
                } catch (err) {
                    console.log(err)
                }
            }
        }
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
