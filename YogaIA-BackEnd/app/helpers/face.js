// require('@tensorflow/tfjs-node')
const faceapi = require('face-api.js')
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const path = require('path')
const canvas = require('canvas')

const { Canvas, Image, ImageData } = canvas
const maxDescriptorDistance = 0.5

exports.loadModels = async () => {
    try {
        faceapi.env.monkeyPatch({ fetch, Canvas, Image, ImageData })
        const MODEL_URL = path.join(__dirname, '/../../models/recognition')

        await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL)
        await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODEL_URL)
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL)
    } catch (error) {
        console.log(error)
    }
}

exports.getFullFaceDescription = async (blob, inputSize = 512) => {
    const scoreThreshold = 0.5
    const OPTION = new faceapi.TinyFaceDetectorOptions({
        inputSize,
        scoreThreshold
    })
    const useTinyModel = true
    const img = await canvas.loadImage(blob)
    const fullDesc = await faceapi
        .detectAllFaces(img, OPTION)
        .withFaceLandmarks(useTinyModel)
        .withFaceDescriptors()

    return fullDesc
}

exports.createMatcher = async faceProfile => {
    const members = Object.keys(faceProfile)
    const labeledDescriptors = members.map(
        member =>
            new faceapi.LabeledFaceDescriptors(
                faceProfile[member].name,
                faceProfile[member].descriptors.map(
                    descriptor => new Float32Array(descriptor)
                )
            )
    )

    const faceMatcher = new faceapi.FaceMatcher(
        labeledDescriptors,
        maxDescriptorDistance
    )
    return faceMatcher
}
