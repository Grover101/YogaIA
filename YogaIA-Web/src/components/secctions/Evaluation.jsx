import { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import * as poseDetection from '@tensorflow-models/pose-detection'
import * as tf from '@tensorflow/tfjs'
import { useStopwatch } from 'react-timer-hook'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { yearOld } from '../../helpers/validation'
import { POINTS, keyPointConnections } from '../../utils/data'
import { drawPoint, drawSegment } from '../../utils/helper'

import tree from '../../assets/tree.jpg'
import traingle from '../../assets/traingle.jpg'
import warrior from '../../assets/warrior.jpg'
import chair from '../../assets/chair.jpg'
import shouldler from '../../assets/shoulder.jpg'
import chakravakasana from '../../assets/chakravakasana.jpg'
import dwiPadaViparitaDandasana from '../../assets/dwiPadaViparitaDandasana.jpg'
import ninguno from '../../assets/ninguno.png'

const WIDTH = 640
const HEIGHT = 480

let skeletonColor = 'rgb(255,255,255)'
const imgPose = {
    Chair: chair,
    Chakravakasana: chakravakasana,
    DwiPadaViparitaDandasana: dwiPadaViparitaDandasana,
    Shoudler: shouldler,
    Traingle: traingle,
    Tree: tree,
    Warrior: warrior
}
const poseList = [
    'Chair',
    'Chakravakasana',
    'DwiPadaViparitaDandasana',
    'Shoudler',
    'Traingle',
    'Tree',
    'Warrior'
]

let flag = false
let flag1 = true
let end = false
var interval
let timeEnd = false

const poseCorrect = []

export const Evaluation = () => {
    const webcam = useRef(null)
    const canvasRef = useRef(null)
    const { hours, seconds, minutes, pause, reset } = useStopwatch({
        autoStart: false
    })

    const [infoFinal, setInfoFinal] = useState({
        // position: 0,
        name: 'Ninguno',
        porcentaje: 0,
        // time: new Date('5/1/23'),
        // bestPorcentaje: 0,
        bestTime: new Date('5/1/23')
        // image: ninguno
    })

    const [pose, setPose] = useState({ name: 'Ninguno', imagen: ninguno })

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
                        // poseCorrect = []
                        pause()
                        flag = false

                        return
                    }
                    const processedInput = landmarksToEmbedding(input)
                    const classification =
                        poseClassifier.predict(processedInput)

                    classification.array().then(data => {
                        console.log(data[0][5])
                        // const classNo = CLASS_NO[currentPose]
                        // console.log(data[0][classNo])/
                        // setCurrentTime(new Date(Date()).getTime())
                        if (data[0][0] > 0.97) {
                            // Chair
                            if (!flag) {
                                // setStartingTime(new Date(Date()).getTime())
                                reset()
                                flag = true
                                flag1 = false
                            }
                            skeletonColor = 'rgb(0,255,0)' // Green
                            poseCorrect.push(data[0])
                            setPose({
                                name: poseList[0],
                                imagen: imgPose[poseList[0]]
                            })
                        } else if (data[0][1] > 0.97) {
                            // Chakravakasana
                            if (!flag) {
                                // setStartingTime(new Date(Date()).getTime())
                                reset()
                                flag = true
                                flag1 = false
                            }
                            skeletonColor = 'rgb(0,0,255)' // Blue
                            poseCorrect.push(data[0])
                            setPose({
                                name: poseList[1],
                                imagen: imgPose[poseList[1]]
                            })
                        } else if (data[0][2] > 0.97) {
                            // DwiPadaViparitaDandasana
                            if (!flag) {
                                // setStartingTime(new Date(Date()).getTime())
                                reset()
                                flag = true
                                flag1 = false
                            }
                            skeletonColor = 'rgb(255,0,255)' // Rose
                            setPose({
                                name: poseList[2],
                                imagen: imgPose[poseList[2]]
                            })
                            poseCorrect.push(data[0])
                        } else if (data[0][3] > 0.97) {
                            // Shoudler
                            if (!flag) {
                                // setStartingTime(new Date(Date()).getTime())
                                reset()
                                flag = true
                                flag1 = false
                            }
                            skeletonColor = 'rgb(255,165,0)' // Orange
                            setPose({
                                name: poseList[3],
                                imagen: imgPose[poseList[3]]
                            })
                            poseCorrect.push(data[0])
                        } else if (data[0][4] > 0.97) {
                            // Traingle
                            if (!flag) {
                                // setStartingTime(new Date(Date()).getTime())
                                reset()
                                flag = true
                                flag1 = false
                            }
                            skeletonColor = 'rgb(0,255,255)' // Light Blue
                            setPose({
                                name: poseList[4],
                                imagen: imgPose[poseList[4]]
                            })
                            poseCorrect.push(data[0])
                        } else if (data[0][5] > 0.97) {
                            // Tree
                            if (!flag) {
                                // setStartingTime(new Date(Date()).getTime())
                                reset()
                                flag = true
                                flag1 = false
                            }
                            skeletonColor = 'rgb(128,0,128)' // Purple
                            setPose({
                                name: poseList[5],
                                imagen: imgPose[poseList[5]]
                            })
                            poseCorrect.push(data[0])
                        } else if (data[0][6] > 0.97) {
                            // Warrior
                            if (!flag) {
                                // setStartingTime(new Date(Date()).getTime())
                                reset()
                                flag = true
                                flag1 = false
                            }
                            skeletonColor = 'rgb(128,128,128)' // Gray
                            setPose({
                                name: poseList[6],
                                imagen: imgPose[poseList[6]]
                            })
                            poseCorrect.push(data[0])
                        } else {
                            skeletonColor = 'rgb(255,255,255)'
                            poseCorrect.push(data[0])
                            if (!flag1) {
                                console.log('pause', flag1)
                                pause()
                                // calculate()
                                timeEnd = true
                            }
                            flag = false
                        }
                    })
                } catch (err) {
                    console.log(err)
                }
            }
        }
    }

    const calculate = () => {
        // pause()
        // console.log(poseCorrect.length)
        // console.log(poseCorrect)
        let sum = []
        let sum1 = 0
        for (let i = 0; i < poseList.length; i++) {
            sum1 = 0
            for (let j = 0; j < poseCorrect.length; j++) {
                sum1 += poseCorrect[j][i]
            }
            sum[i] = sum1
        }
        // console.log('suma: ', sum)
        sum = sum.map(item => item / poseCorrect.length)
        // console.log('suma promediado: ', sum)
        let mayor = -Infinity
        let index = 0
        for (let i = 0; i < sum.length; i++) {
            if (sum[i] > mayor) {
                mayor = sum[i]
                index = i
            }
        }

        // console.log(poseEnd.time, poseEnd.bestTime)

        const poseEnd = infoFinal

        poseEnd.name = poseList[index]
        poseEnd.porcentaje = (sum[index] * 100).toFixed(2)
        // console.log(poseEnd.porcentaje > infoFinal.bestPorcentaje)
        // console.log(poseEnd.porcentaje, infoFinal.bestPorcentaje)
        // console.log(typeof poseEnd.porcentaje, typeof infoFinal.bestPorcentaje)
        // poseEnd.bestPorcentaje =
        //     infoFinal.bestPorcentaje > poseEnd.porcentaje
        //         ? infoFinal.bestPorcentaje
        //         : poseEnd.porcentaje
        // console.log(hours, minutes, seconds)
        // poseEnd.time = poseEnd.time.setHours(hours, minutes, seconds)
        const time = new Date()
        time.setHours(hours, minutes, seconds)
        const bestTime = new Date(infoFinal.bestTime)
        // // console.log(bestTime.getTime(), time.getTime())
        poseEnd.bestTime =
            bestTime.getTime() > time.getTime()
                ? bestTime.getTime()
                : time.getTime()
        // poseEnd.image = imgPose[poseEnd.name]

        // console.log(poseEnd)

        // console.log(poseEnd.time)
        // console.log(infoFinal)
        // const timeBest = new Date(bestPerform)
        // const timeNow = new Date()
        // timeNow.setHours(hours, minutes, seconds)
        // console.log(timeBest.getTime() < timeNow.getTime())
        // if (timeBest.getTime() < timeNow.getTime()) {
        //     console.log('entra aqui')
        //     setBestPerform(timeNow.getTime())
        // }
        // console.log(timeBest.getTime(), timeNow.getTime())

        setInfoFinal(e => {
            return { ...poseEnd }
        })
        console.log(infoFinal)
    }

    const stopPose = () => {
        if (infoFinal.name !== 'Ninguno') {
            console.log('termina')
            end = true
            const ctx = canvasRef.current.getContext('2d')
            ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            )
            // setPoseTime(0)
            // pause()
            clearInterval(interval)

            const data = {
                id: user.id,
                name: infoFinal.name,
                bestTime: infoFinal.bestTime,
                porcentaje: infoFinal.porcentaje
            }

            console.log(data)

            fetch('http://localhost:9000/api/activity', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            })
                .then(data => {
                    // console.log(data.body)
                    // toast.success('Progreso Guardado!!!')
                    toast.success('Evalucion Gurdada y Finalizada!!!')
                })
                .catch(error => {
                    console.error(error)
                    toast.error('Ocurrio un error al guardar')
                })
            // console.log(JSON.stringify(infoFinal, null, 2))
            // calculate()
            // setResetPlay(true)
            // window.location.reload()
        } else toast.error('Debe Realizar una Evaluacion')
    }

    // function resetPose() {
    //     console.log('restar')
    //     end = false
    // }

    if (timeEnd) {
        console.log(timeEnd)
        timeEnd = false
        calculate()
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
                            {pose.name}
                        </h3>
                        <div className="h-80">
                            <img
                                src={pose.imagen}
                                alt={pose.name}
                                className="m-auto h-full"
                            />
                        </div>
                        <ul className="mt-5">
                            <li>
                                Mejor Tiempo:{' '}
                                {new Date(infoFinal.bestTime).getHours() < 10
                                    ? `0${new Date(
                                          infoFinal.bestTime
                                      ).getHours()}`
                                    : new Date(infoFinal.bestTime).getHours()}
                                :
                                {new Date(infoFinal.bestTime).getMinutes() < 10
                                    ? `0${new Date(
                                          infoFinal.bestTime
                                      ).getMinutes()}`
                                    : new Date(infoFinal.bestTime).getMinutes()}
                                :
                                {new Date(infoFinal.bestTime).getSeconds() < 10
                                    ? `0${new Date(
                                          infoFinal.bestTime
                                      ).getSeconds()}`
                                    : new Date(infoFinal.bestTime).getSeconds()}
                            </li>
                            <li>
                                Tiempo: {hours < 10 ? `0${hours}` : hours}:
                                {minutes < 10 ? `0${minutes}` : minutes}:
                                {seconds < 10 ? `0${seconds}` : seconds}
                            </li>
                            <li>Evaluacion: {infoFinal.porcentaje}%</li>
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
                        // onClick={stopPose}
                    >
                        Ver Historial
                    </Link>
                </div>
            </div>
        </>
    )
}
