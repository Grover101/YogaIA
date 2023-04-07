import * as faceapi from 'face-api.js'

export async function loadModels() {
    const MODEL_URL = 'http://localhost:9000/recognition'
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadFaceLandmarkTinyModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
}

export async function getFullFaceDescription(blob, inputSize = 512) {
    const scoreThreshold = 0.5
    const OPTION = new faceapi.TinyFaceDetectorOptions({
        inputSize,
        scoreThreshold
    })
    const useTinyModel = true
    const img = await faceapi.fetchImage(blob)
    const fullDesc = await faceapi
        .detectAllFaces(img, OPTION)
        .withFaceLandmarks(useTinyModel)
        .withFaceDescriptors()
    return fullDesc
}
